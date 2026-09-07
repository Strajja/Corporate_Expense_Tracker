package com.cet.cet_backend.controllers;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.security.JwtAuthenticationFilter;
import com.cet.cet_backend.services.ExpenseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ExpenseController.class)
@AutoConfigureMockMvc(addFilters = false)
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private ExpenseService expenseService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void createExpense_ReturnsOk_WithSavedExpenseJson() throws Exception {

        ExpenseDto inputDto = new ExpenseDto();
        inputDto.setAmount(BigDecimal.valueOf(1250.0));
        inputDto.setCategory("OFFICE_SUPPLIES");

        ExpenseDto outputDto = new ExpenseDto();
        outputDto.setId(5L);
        outputDto.setAmount(BigDecimal.valueOf(1250.0));
        outputDto.setCategory("OFFICE_SUPPLIES");

        Mockito.when(expenseService.createExpense(Mockito.any(ExpenseDto.class))).thenReturn(outputDto);

        mockMvc.perform(post("/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputDto)))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5L))
                .andExpect(jsonPath("$.category").value("OFFICE_SUPPLIES"));
    }


}