package com.cet.cet_backend.controllers;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.Status;
import com.cet.cet_backend.services.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller managing CRUD operations and status updates for expenses.
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(path = "/expenses")
public class    ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    /**
     * Creates a new expense record for the currently authenticated user.
     *
     * @param expenseDto DTO containing expense details.
     * @return ResponseEntity with the created ExpenseDto.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ExpenseDto> createExpense(@Valid @RequestBody ExpenseDto expenseDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        ExpenseDto savedExpense = expenseService.createExpense(expenseDto, currentUsername);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedExpense);
    }

    /**
     * Retrieves a paginated list of expenses submitted by the current user.
     *
     * @param pageable Pagination configuration.
     * @return ResponseEntity containing a page of ExpenseDto.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Page<ExpenseDto>> getMyExpenses(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return ResponseEntity.ok(expenseService.findAllExpenses(pageable, currentUsername));
    }

    /**
     * Retrieves a paginated list of expenses pending approval for the current manager.
     *
     * @param pageable Pagination configuration.
     * @return ResponseEntity containing a page of ExpenseDto.
     */
    @GetMapping(path="/approvals")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<Page<ExpenseDto>> getMyApprovals(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        return ResponseEntity.ok(expenseService.findAllApprovals(pageable, currentUsername));
    }

    /**
     * Updates an existing expense record.
     *
     * @param expenseId  ID of the expense to update.
     * @param expenseDto Updated expense data.
     * @return ResponseEntity with the updated ExpenseDto.
     */
    @PutMapping(path = "/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<ExpenseDto> updateExpense(
            @PathVariable("id") Long expenseId,
            @RequestBody ExpenseDto expenseDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        ExpenseDto updatedExpense = expenseService.updateExpense(expenseId, expenseDto, currentUsername);
        return ResponseEntity.ok(updatedExpense);
    }

    /**
     * Deletes an expense record.
     *
     * @param expenseId ID of the expense to delete.
     * @return ResponseEntity with no content.
     */
    @DeleteMapping(path = "/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<Void> deleteExpense(@PathVariable("id") Long expenseId) {
        expenseService.deleteExpense(expenseId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Updates the status of an expense (e.g., approve or reject) with an optional comment.
     *
     * @param expenseId ID of the expense.
     * @param body      Map containing the new status and optional comment.
     * @return ResponseEntity with the updated ExpenseDto.
     */
    @PatchMapping(path = "/{id}/status")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<ExpenseDto> updateExpenseStatus(
            @PathVariable("id") Long expenseId,
            @RequestBody java.util.Map<String, Object> body) {
        String statusStr = (String) body.get("status");
        Status newStatus = Status.valueOf(statusStr.toUpperCase());
        String comment = (String) body.getOrDefault("comment", "");

        ExpenseDto updatedExpense = expenseService.updateExpenseStatus(expenseId, newStatus, comment);
        return ResponseEntity.ok(updatedExpense);
    }

    /**
     * Allows an administrator to override the status of any expense.
     *
     * @param expenseId ID of the expense.
     * @param newStatus The overridden status.
     * @param comment   Optional explanation for the override.
     * @return ResponseEntity with the updated ExpenseDto.
     */
    @PatchMapping(path = "/{id}/override")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ExpenseDto> adminOverride(
            @PathVariable("id") Long expenseId,
            @RequestParam("status") Status newStatus,
            @RequestParam(value = "comment", defaultValue = "") String comment) {
        ExpenseDto updatedExpense = expenseService.adminOverride(expenseId, newStatus, comment);
        return ResponseEntity.ok(updatedExpense);
    }

    /**
     * Retrieves a list of pending expenses for specified team members.
     *
     * @param employeeIds List of employee IDs.
     * @param status      The status to filter by (typically PENDING).
     * @return ResponseEntity containing a list of ExpenseDto.
     */
    @GetMapping(path = "/team")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<ExpenseDto>> getTeamPendingExpenses(
            @RequestParam("employeeIds") List<Long> employeeIds,
            @RequestParam("status") Status status) {
        List<ExpenseDto> teamExpenses = expenseService.findPendingExpensesForTeam(employeeIds, status);
        return ResponseEntity.ok(teamExpenses);
    }
}