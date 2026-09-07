package com.cet.cet_backend.controllers;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.Status;
import com.cet.cet_backend.services.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping(path = "/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public CompletableFuture<ResponseEntity<ExpenseDto>> createExpense(@Valid @RequestBody ExpenseDto expenseDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        return expenseService.createExpense(expenseDto, currentUsername)
                .thenApply(savedExpense->ResponseEntity.status(HttpStatus.CREATED).body(savedExpense));
    }

    @GetMapping
    public ResponseEntity<Page<ExpenseDto>> getMyExpenses(Pageable pageable) {
        return ResponseEntity.ok(expenseService.findAllExpenses(pageable));
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable("id") Long expenseId) {
        expenseService.deleteExpense(expenseId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping(path = "/{id}/status")
    public ResponseEntity<ExpenseDto> updateExpenseStatus(
            @PathVariable("id") Long expenseId,
            @RequestParam("status") Status newStatus) {

        ExpenseDto updatedExpense = expenseService.updateExpenseStatus(expenseId, newStatus);
        return ResponseEntity.ok(updatedExpense);
    }

    @GetMapping(path = "/team")
    public ResponseEntity<List<ExpenseDto>> getTeamPendingExpenses(
            @RequestParam("employeeIds") List<Long> employeeIds,
            @RequestParam("status") Status status) {

        List<ExpenseDto> teamExpenses = expenseService.findPendingExpensesForTeam(employeeIds, status);
        return ResponseEntity.ok(teamExpenses);
    }
}