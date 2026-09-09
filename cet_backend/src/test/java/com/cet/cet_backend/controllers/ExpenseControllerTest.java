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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.concurrent.CompletableFuture;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ExpenseController.class)
@AutoConfigureMockMvc(addFilters = false)
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper().registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private ExpenseService expenseService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    void createExpense_ReturnsOk_WithSavedExpenseJson() throws Exception {

        ExpenseDto inputDto = new ExpenseDto();
        inputDto.setAmount(BigDecimal.valueOf(1250.0));
        inputDto.setCategory("OFFICE_SUPPLIES");
        inputDto.setDescription("Office equipment purchase");
        inputDto.setDate(LocalDate.now());
        inputDto.setEmployeeId(1L);
        inputDto.setStatus("PENDING");

        ExpenseDto outputDto = new ExpenseDto();
        outputDto.setCategory("OFFICE_SUPPLIES");
        outputDto.setId(5L);
        outputDto.setAmount(BigDecimal.valueOf(1250.0));

        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken("test-user@email.com", null, java.util.Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        Mockito.when(expenseService.createExpense(Mockito.any(ExpenseDto.class), Mockito.eq("test-user@email.com")))
                .thenReturn(CompletableFuture.completedFuture(outputDto));

        MvcResult mvcResult = mockMvc.perform(post("/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(request().asyncStarted())
                .andReturn();

        mockMvc.perform(asyncDispatch(mvcResult))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5L))
                .andExpect(jsonPath("$.category").value("OFFICE_SUPPLIES"));

        SecurityContextHolder.clearContext();
    }


}