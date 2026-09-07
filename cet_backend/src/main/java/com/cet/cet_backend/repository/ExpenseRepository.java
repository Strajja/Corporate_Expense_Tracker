package com.cet.cet_backend.repository;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.ExpenseEntity;
import com.cet.cet_backend.domain.entities.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExpenseRepository extends JpaRepository<ExpenseEntity,Long> {

    Page<ExpenseEntity> findAllByEmployeeId(Long employeeId, Pageable pageable);

    List<ExpenseEntity> findAllByEmployeeId(Long employeeId);

    List<ExpenseEntity  > findAllByEmployeeIdInAndStatus(List<Long> employeeIds, Status status);
}
