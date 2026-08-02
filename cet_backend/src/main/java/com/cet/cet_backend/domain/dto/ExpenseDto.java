package com.cet.cet_backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExpenseDto {

    private Long id;

    private String description;

    private String category;

    private BigDecimal amount;

    private LocalDate date;

    private String status;

    private Long employeeId;

    private String employeeFirstName;

}
