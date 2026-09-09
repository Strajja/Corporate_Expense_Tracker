package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.ExpenseEntity;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.mappers.Mapper;
import com.cet.cet_backend.repository.ExpenseRepository;
import com.cet.cet_backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

    @Test
    void createExpense_ReturnsSavedExpense_WhenUserExists() {

        UserEntity mockUser = new UserEntity();
        mockUser.setId(1L);
        mockUser.setUsername("username");

        ExpenseDto inputDto = new ExpenseDto();
        ExpenseEntity mappedEntity= new ExpenseEntity();
        ExpenseEntity savedEntity = new ExpenseEntity();
        ExpenseDto outputDto = new ExpenseDto();
        outputDto.setId(50L);

        Authentication  authentication = mock(Authentication.class);
        lenient().when(authentication.getName()).thenReturn("username");
        SecurityContext securityContext = mock(SecurityContext.class);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByUsername("username")).thenReturn(Optional.of(mockUser));
        when(expenseMapper.mapFrom(inputDto)).thenReturn(mappedEntity);
        when(expenseRepository.save(mappedEntity)).thenReturn(savedEntity);
        when(expenseMapper.mapTo(savedEntity)).thenReturn(outputDto);

        CompletableFuture<ExpenseDto> futureResult=expenseService.createExpense(inputDto, mockUser.getUsername());

        ExpenseDto result=futureResult.join();

        assertNotNull(result);
        assertEquals(50L, result.getId());
        assertEquals(mockUser,mappedEntity.getEmployee());
        verify(expenseRepository, times(1)).save(mappedEntity);

    }

    @Test
    void deleteExpense_ThrowsException_WhenUserIsNotOwner() {

        UserEntity mockUser = new UserEntity();
        mockUser.setId(1L);
        mockUser.setUsername("username");

        UserEntity realUser= new UserEntity();
        realUser.setId(2L);

        ExpenseEntity expense= new ExpenseEntity();
        expense.setId(100L);
        expense.setEmployee(realUser);

        Authentication  authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("username");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(userRepository.findByUsername("username")).thenReturn(Optional.of(mockUser));
        when(expenseRepository.findById(100L)).thenReturn(Optional.of(expense));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> expenseService.deleteExpense(100L));

        assertEquals("Access denied: You do not own this expense", exception.getMessage());

        verify(expenseRepository, never()).delete(any());
    }
}
