package com.cet.cet_worker.dto

import java.math.BigDecimal

data class ExpenseDto(
    val id: Long?,
    val amount: BigDecimal?,
    val category: String?,
    val description: String?,
    val status: String?,
    val employeeId: Long?
)