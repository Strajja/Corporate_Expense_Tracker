package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Interface defining the operations for managing expenses.
 */
public interface ExpenseService {

    ExpenseDto createExpense(ExpenseDto expenseDto, String currentUsername);

    Page<ExpenseDto> findAllExpenses(Pageable pageable, String currentUsername);

    List<ExpenseDto> findExpensesByEmployeeId(Long employeeId);

    ExpenseDto updateExpenseStatus(Long expenseId, Status newStatus, String comment);

    ExpenseDto adminOverride(Long expenseId, Status newStatus, String comment);

    void deleteExpense(Long expenseId);

    List<ExpenseDto> findPendingExpensesForTeam(List<Long> employeeIds, Status status);

    ExpenseDto updateExpense(Long expenseId, ExpenseDto expenseDto, String currentUsername);

    Page<ExpenseDto> findAllApprovals(Pageable pageable, String currentUsername);
}