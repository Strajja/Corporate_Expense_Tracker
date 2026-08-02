package com.cet.cet_backend.controllers;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.Status;
import com.cet.cet_backend.services.ExpenseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping(path="/expenses")
    public ResponseEntity<ExpenseDto> createExpense(@RequestBody ExpenseDto expenseDto){
        expenseDto=expenseService.createExpense(expenseDto);

        return new ResponseEntity<>(expenseDto, HttpStatus.CREATED);
    }

    @GetMapping(path="/expenses")
    public ResponseEntity<List<ExpenseDto>> getAllExpenses(){
        List<ExpenseDto> expenses=expenseService.findAllExpenses();

        return new ResponseEntity<>(expenses, HttpStatus.OK);
    }

    @GetMapping(path="/expenses/employee/{employeeId}")
    public ResponseEntity<List<ExpenseDto>> getExpense(@PathVariable("employeeId") Long employeeId){
        List<ExpenseDto> expenses=expenseService.findExpensesByEmployeeId(employeeId);

        return new ResponseEntity<>(expenses, HttpStatus.OK);
    }

    @PatchMapping(path="/expenses/{id}/status")
    public ResponseEntity<ExpenseDto> updateExpenseStatus(@PathVariable("id") Long id, @RequestParam Status newStatus){

        ExpenseDto expenseDto=expenseService.updateExpenseStatus(id,newStatus);

        return new ResponseEntity<>(expenseDto, HttpStatus.OK);
    }

    @DeleteMapping(path="/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(@PathVariable("expenseId") Long expenseId){

        expenseService.deleteExpense(expenseId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);

    }

    @GetMapping(path = "/expenses/team")
    public ResponseEntity<List<ExpenseDto>> getAllTeamExpenses(@RequestParam List<Long>employeeIds, @RequestParam  Status status){

        List<ExpenseDto> expenses= expenseService.findPendingExpensesForTeam(employeeIds,status);

        return new ResponseEntity<>(HttpStatus.OK);

    }
}
