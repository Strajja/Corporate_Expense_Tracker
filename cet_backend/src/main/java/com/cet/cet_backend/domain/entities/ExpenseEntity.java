package com.cet.cet_backend.domain.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Entity representing an individual expense record in the database.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name="expenses")
public class ExpenseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @Enumerated(EnumType.STRING)
    private Category category;

    private BigDecimal amount;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String comment;

    /**
     * The employee who submitted the expense.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="employee_id", nullable = false)
    private UserEntity employee;

    /**
     * The manager or admin who reviewed the expense.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="reviewed_by_id")
    private UserEntity reviewedBy;
}