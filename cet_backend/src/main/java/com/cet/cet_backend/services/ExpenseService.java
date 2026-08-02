package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.Status;

import java.util.List;

public interface ExpenseService {

    ExpenseDto createExpense(ExpenseDto expenseDto);

    List<ExpenseDto> findAllExpenses();

    List<ExpenseDto> findExpensesByEmployeeId(Long employeeId);

    ExpenseDto updateExpenseStatus(Long expenseId, Status newStatus);

    void deleteExpense(Long expenseId);

    List<ExpenseDto> findPendingExpensesForTeam(List<Long> employeeIds, Status status);
}
