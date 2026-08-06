package com.cet.cet_backend.domain.dto;

import jakarta.validation.constraints.*;
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

    @NotBlank(message = "Description should not be blank.")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero.")
    private BigDecimal amount;

    @NotNull(message = "Date cannot be null.")
    @PastOrPresent(message="Date should not be in future.")
    private LocalDate date;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Employee ID is required")
    @Positive(message = "Employee ID must be a positive number")
    private Long employeeId;

    private String employeeFirstName;

}