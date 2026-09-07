package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface ExpenseService {

    CompletableFuture<ExpenseDto> createExpense(ExpenseDto expenseDto,  String currentUsername);

    Page<ExpenseDto> findAllExpenses(Pageable pageable);

    List<ExpenseDto> findExpensesByEmployeeId(Long employeeId);

    ExpenseDto updateExpenseStatus(Long expenseId, Status newStatus);

    void deleteExpense(Long expenseId);

    List<ExpenseDto> findPendingExpensesForTeam(List<Long> employeeIds, Status status);

}
