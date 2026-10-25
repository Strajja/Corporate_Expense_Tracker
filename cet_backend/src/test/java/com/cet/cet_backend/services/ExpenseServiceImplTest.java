package com.cet.cet_backend.services;

import com.cet.cet_backend.config.RabbitMQConfig;
import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.Category;
import com.cet.cet_backend.domain.entities.ExpenseEntity;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.Status;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.mappers.Mapper;
import com.cet.cet_backend.repository.ExpenseRepository;
import com.cet.cet_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the ExpenseServiceImpl class.
 * Mocks dependencies to test the business logic for expense management in isolation.
 */
@ExtendWith(MockitoExtension.class)
public class ExpenseServiceImplTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private Mapper<ExpenseEntity, ExpenseDto> expenseMapper;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private ExpenseServiceImpl expenseService;

    private UserEntity employee;
    private UserEntity manager;
    private ExpenseEntity expenseEntity;
    private ExpenseDto expenseDto;

    @BeforeEach
    void setUp() {
        manager = UserEntity.builder()
                .id(2L)
                .username("manager")
                .role(Role.MANAGER)
                .emailAddress("manager@cet.com")
                .build();

        employee = UserEntity.builder()
                .id(1L)
                .username("employee")
                .firstName("John")
                .role(Role.EMPLOYEE)
                .managerId(2L)
                .build();

        expenseEntity = ExpenseEntity.builder()
                .id(100L)
                .description("Business Lunch")
                .amount(new BigDecimal("50.00"))
                .category(Category.REPRESENTATION)
                .status(Status.PENDING)
                .employee(employee)
                .date(LocalDate.now())
                .build();

        expenseDto = ExpenseDto.builder()
                .id(100L)
                .description("Business Lunch")
                .amount(new BigDecimal("50.00"))
                .category(Category.REPRESENTATION)
                .status("PENDING")
                .date(LocalDate.now())
                .build();
    }

    /**
     * Tests successful creation of an expense.
     * Verifies that the expense is saved, mapped correctly, and an event is sent to RabbitMQ.
     */
    @Test
    void createExpense_Success() {
        when(userRepository.findByUsername("employee")).thenReturn(Optional.of(employee));
        when(expenseMapper.mapFrom(any(ExpenseDto.class))).thenReturn(expenseEntity);
        when(expenseRepository.save(any(ExpenseEntity.class))).thenReturn(expenseEntity);
        when(expenseMapper.mapTo(any(ExpenseEntity.class))).thenReturn(expenseDto);
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));

        ExpenseDto result = expenseService.createExpense(expenseDto, "employee");

        assertNotNull(result);
        assertEquals(employee.getId(), result.getEmployeeId());
        assertEquals("manager@cet.com", result.getManagerEmail());
        verify(rabbitTemplate, times(1)).convertAndSend(eq(RabbitMQConfig.EXPENSE_QUEUE), any(ExpenseDto.class));
    }

    /**
     * Tests that an employee without an assigned manager cannot create an expense.
     */
    @Test
    void createExpense_FailsWhenEmployeeHasNoManager() {
        employee.setManagerId(null);
        when(userRepository.findByUsername("employee")).thenReturn(Optional.of(employee));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            expenseService.createExpense(expenseDto, "employee");
        });

        assertEquals("You cannot create expenses because you do not have an assigned manager.", exception.getMessage());
        verify(expenseRepository, never()).save(any());
    }

    /**
     * Tests retrieving a paginated list of expenses for a specific user.
     */
    @Test
    void findAllExpenses_ReturnsPagedData() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<ExpenseEntity> page = new PageImpl<>(List.of(expenseEntity));

        when(userRepository.findByUsername("employee")).thenReturn(Optional.of(employee));
        when(expenseRepository.findAllByEmployeeId(1L, pageable)).thenReturn(page);
        when(expenseMapper.mapTo(any(ExpenseEntity.class))).thenReturn(expenseDto);

        Page<ExpenseDto> result = expenseService.findAllExpenses(pageable, "employee");

        assertEquals(1, result.getTotalElements());
        assertEquals("Business Lunch", result.getContent().get(0).getDescription());
    }

    /**
     * Tests the successful approval of an expense by a manager.
     */
    @Test
    void updateExpenseStatus_SuccessByManager() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("manager", "password")
        );

        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(manager));
        when(expenseRepository.findById(100L)).thenReturn(Optional.of(expenseEntity));

        expenseDto.setStatus("APPROVED");
        when(expenseMapper.mapTo(any(ExpenseEntity.class))).thenReturn(expenseDto);

        ExpenseDto result = expenseService.updateExpenseStatus(100L, Status.APPROVED, "Looks good");

        assertEquals(Status.APPROVED, expenseEntity.getStatus());
        assertEquals("Looks good", expenseEntity.getComment());
        assertEquals(manager, expenseEntity.getReviewedBy());
        verify(expenseRepository, times(1)).save(expenseEntity);
    }

    /**
     * Tests that an employee is blocked from approving or rejecting their own expense.
     */
    @Test
    void updateExpenseStatus_FailsIfEmployeeTriesToApprove() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("employee", "password")
        );

        when(userRepository.findByUsername("employee")).thenReturn(Optional.of(employee));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            expenseService.updateExpenseStatus(100L, Status.APPROVED, "Approving my own");
        });

        assertEquals("Access denied: Employees cannot approve or reject expenses", exception.getMessage());
    }

    /**
     * Tests successful deletion of an expense by its owner.
     */
    @Test
    void deleteExpense_Success() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("employee", "password")
        );

        when(userRepository.findByUsername("employee")).thenReturn(Optional.of(employee));
        when(expenseRepository.findById(100L)).thenReturn(Optional.of(expenseEntity));

        expenseService.deleteExpense(100L);

        verify(expenseRepository, times(1)).delete(expenseEntity);
    }
}