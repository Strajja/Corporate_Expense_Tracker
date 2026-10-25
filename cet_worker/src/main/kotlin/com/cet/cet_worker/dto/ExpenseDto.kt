package com.cet.cet_worker.dto

import java.math.BigDecimal

/**
 * Data transfer object representing expense details received from the main application.
 */
data class ExpenseDto(
    val id: Long? = null,
    val amount: BigDecimal? = null,
    val category: String? = null,
    val description: String? = null,
    val status: String? = null,
    val employeeId: Long? = null,
    val employeeFirstName: String? = null,
    val managerEmail: String? = null
)