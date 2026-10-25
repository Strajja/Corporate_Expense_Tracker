package com.cet.cet_backend.controllers;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.Category;
import com.cet.cet_backend.domain.entities.Status;
import com.cet.cet_backend.security.JwtService;
import com.cet.cet_backend.services.ExpenseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web MVC tests for ExpenseController.
 * Validates HTTP routing, JSON serialization/deserialization, and status codes for expense operations.
 */
@WebMvcTest(ExpenseController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(JwtService.class)
public class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ExpenseService expenseService;

    private ObjectMapper objectMapper;
    private ExpenseDto expenseDto;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        expenseDto = ExpenseDto.builder()
                .id(1L)
                .description("Flight to London")
                .amount(new BigDecimal("350.00"))
                .category(Category.TRANSPORTATION)
                .status("PENDING")
                .date(LocalDate.now())
                .employeeId(1L)
                .build();
    }

    /**
     * Tests the POST /expenses endpoint to ensure it returns 201 Created and the correct payload.
     */
    @Test
    @WithMockUser(username = "employee1", roles = {"EMPLOYEE"})
    void createExpense_ReturnsCreatedStatus() throws Exception {
        when(expenseService.createExpense(any(ExpenseDto.class), eq("employee1"))).thenReturn(expenseDto);

        mockMvc.perform(post("/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expenseDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.description").value("Flight to London"));
    }

    /**
     * Tests the GET /expenses endpoint to verify paginated data retrieval.
     */
    @Test
    @WithMockUser(username = "employee1", roles = {"EMPLOYEE"})
    void getMyExpenses_ReturnsPagedData() throws Exception {
        Page<ExpenseDto> page = new PageImpl<>(List.of(expenseDto));
        when(expenseService.findAllExpenses(any(Pageable.class), eq("employee1"))).thenReturn(page);

        mockMvc.perform(get("/expenses?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].description").value("Flight to London"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    /**
     * Tests the PATCH /expenses/{id}/status endpoint for updating expense status.
     */
    @Test
    @WithMockUser(username = "manager1", roles = {"MANAGER"})
    void updateExpenseStatus_ReturnsUpdatedExpense() throws Exception {
        ExpenseDto approvedDto = ExpenseDto.builder()
                .id(1L)
                .status("APPROVED")
                .comment("Approved by manager")
                .build();

        when(expenseService.updateExpenseStatus(eq(1L), eq(Status.APPROVED), eq("Approved by manager")))
                .thenReturn(approvedDto);

        Map<String, String> requestBody = Map.of(
                "status", "APPROVED",
                "comment", "Approved by manager"
        );

        mockMvc.perform(patch("/expenses/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"))
                .andExpect(jsonPath("$.comment").value("Approved by manager"));
    }

    /**
     * Tests the DELETE /expenses/{id} endpoint to ensure it returns 204 No Content.
     */
    @Test
    @WithMockUser(username = "employee1", roles = {"EMPLOYEE"})
    void deleteExpense_ReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/expenses/1"))
                .andExpect(status().isNoContent());
    }
}