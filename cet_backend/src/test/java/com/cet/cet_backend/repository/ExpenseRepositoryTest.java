package com.cet.cet_backend.repository;

import com.cet.cet_backend.domain.entities.Category;
import com.cet.cet_backend.domain.entities.ExpenseEntity;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.Status;
import com.cet.cet_backend.domain.entities.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * JPA tests for ExpenseRepository using an embedded database.
 * Verifies custom query logic and data persistence rules.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class ExpenseRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ExpenseRepository expenseRepository;

    private UserEntity employee;

    @BeforeEach
    void setUp() {
        employee = UserEntity.builder()
                .firstName("John")
                .lastName("Doe")
                .emailAddress("john@cet.com")
                .username("john_doe")
                .password("password123")
                .role(Role.EMPLOYEE)
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .hireDate(LocalDate.now())
                .build();

        entityManager.persist(employee);

        ExpenseEntity expense = ExpenseEntity.builder()
                .description("Office Supplies")
                .category(Category.EQUIPMENT)
                .amount(new BigDecimal("120.00"))
                .date(LocalDate.now())
                .status(Status.PENDING)
                .employee(employee)
                .build();

        entityManager.persist(expense);
        entityManager.flush();
    }

    /**
     * Tests retrieving expenses paginated by employee ID.
     */
    @Test
    void findAllByEmployeeId_ReturnsPagedExpenses() {
        Page<ExpenseEntity> result = expenseRepository.findAllByEmployeeId(
                employee.getId(),
                PageRequest.of(0, 10)
        );

        assertEquals(1, result.getTotalElements());
        assertEquals("Office Supplies", result.getContent().get(0).getDescription());
    }

    /**
     * Tests filtering expenses for multiple employee IDs by status.
     */
    @Test
    void findAllByEmployeeIdInAndStatus_ReturnsMatchingExpenses() {
        List<ExpenseEntity> results = expenseRepository.findAllByEmployeeIdInAndStatus(
                List.of(employee.getId()),
                Status.PENDING
        );

        assertEquals(1, results.size());
        assertEquals(Status.PENDING, results.get(0).getStatus());
    }
}