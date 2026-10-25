package com.cet.cet_backend;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.Category;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for the Expense module.
 * Boots the full application context to test interaction across all application layers.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class ExpenseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        UserEntity manager = UserEntity.builder()
                .firstName("Manager")
                .lastName("User")
                .emailAddress("manager@cet.com")
                .username("manager_user")
                .password("pass")
                .role(Role.MANAGER)
                .dateOfBirth(LocalDate.of(1985, 1, 1))
                .hireDate(LocalDate.now())
                .build();
        manager = userRepository.save(manager);

        UserEntity employee = UserEntity.builder()
                .firstName("Employee")
                .lastName("User")
                .emailAddress("employee@cet.com")
                .username("employee_user")
                .password("pass")
                .role(Role.EMPLOYEE)
                .managerId(manager.getId())
                .dateOfBirth(LocalDate.of(1995, 1, 1))
                .hireDate(LocalDate.now())
                .build();
        userRepository.save(employee);
    }

    /**
     * End-to-end test verifying expense creation from HTTP request to database persistence.
     */
    @Test
    @WithMockUser(username = "employee_user", roles = {"EMPLOYEE"})
    void createExpense_EndToEndSuccess() throws Exception {
        ExpenseDto requestDto = ExpenseDto.builder()
                .description("Team Conference Ticket")
                .category(Category.EDUCATION)
                .amount(new BigDecimal("150.00"))
                .date(LocalDate.now())
                .build();

        mockMvc.perform(post("/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.description").value("Team Conference Ticket"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }
}