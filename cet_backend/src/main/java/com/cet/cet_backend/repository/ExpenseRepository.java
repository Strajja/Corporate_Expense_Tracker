package com.cet.cet_backend.repository;

import com.cet.cet_backend.domain.entities.ExpenseEntity;
import com.cet.cet_backend.domain.entities.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository interface for performing database operations on Expense entities.
 */
public interface ExpenseRepository extends JpaRepository<ExpenseEntity, Long> {

    /**
     * Retrieves a paginated list of expenses belonging to a specific employee.
     */
    Page<ExpenseEntity> findAllByEmployeeId(Long employeeId, Pageable pageable);

    /**
     * Retrieves all expenses belonging to a specific employee.
     */
    List<ExpenseEntity> findAllByEmployeeId(Long employeeId);

    /**
     * Retrieves a list of expenses for multiple employees filtered by their status.
     */
    List<ExpenseEntity> findAllByEmployeeIdInAndStatus(List<Long> employeeIds, Status status);

    /**
     * Retrieves a paginated list of expenses for multiple employees.
     */
    Page<ExpenseEntity> findAllByEmployeeIdIn(List<Long> employeeIds, Pageable pageable);

    /**
     * Retrieves a paginated list of all expenses excluding those of a specific employee.
     */
    Page<ExpenseEntity> findAllByEmployeeIdNot(Long employeeId, Pageable pageable);
}