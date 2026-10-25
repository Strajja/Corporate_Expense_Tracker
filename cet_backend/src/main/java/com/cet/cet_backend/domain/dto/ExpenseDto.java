package com.cet.cet_backend.domain.dto;

import com.cet.cet_backend.domain.entities.Category;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Object representing expense information exchanged between client and server.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExpenseDto {

    private Long id;

    @NotBlank(message = "Description should not be blank.")
    private String description;

    @NotNull(message = "Category is required.")
    private Category category;

    @NotNull(message = "Amount is required.")
    @Positive(message = "Amount must be greater than zero.")
    private BigDecimal amount;

    @NotNull(message = "Date cannot be null.")
    @PastOrPresent(message = "Date should not be in the future.")
    private LocalDate date;

    private String status;

    private String comment;

    private Long employeeId;

    private String employeeFirstName;

    private String managerEmail;
}