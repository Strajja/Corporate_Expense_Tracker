package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.ExpenseEntity;
import com.cet.cet_backend.domain.entities.Status;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.mappers.Mapper;
import com.cet.cet_backend.repository.ExpenseRepository;
import com.cet.cet_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;

    private final UserRepository userRepository;

    private final Mapper<ExpenseEntity,ExpenseDto> expenseMapper;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository, UserRepository userRepository, Mapper<ExpenseEntity, ExpenseDto> expenseMapper) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.expenseMapper = expenseMapper;
    }
    @Override
    public ExpenseDto createExpense(ExpenseDto expenseDto) {

        UserEntity employee=userRepository
                .findById(expenseDto.getEmployeeId())
                .orElseThrow(()->new RuntimeException("Employee not found"));

        ExpenseEntity expenseEntity=expenseMapper.mapFrom(expenseDto);

        expenseEntity.setEmployee(employee);

        ExpenseEntity savedExpense=expenseRepository.save(expenseEntity);

        return expenseMapper.mapTo(savedExpense);
    }

    @Override
    public List<ExpenseDto> findAllExpenses() {
        return expenseRepository.findAll()
                .stream()
                .map(expenseMapper::mapTo)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExpenseDto> findExpensesByEmployeeId(Long employeeId) {

        if(!userRepository.existsById(employeeId)){
            throw new RuntimeException("Employee not found");
        }

        return expenseRepository.findAllByEmployeeId(employeeId)
                .stream()
                .map(expenseMapper::mapTo)
                .collect(Collectors.toList());
    }

    @Override
    public ExpenseDto updateExpenseStatus(Long expenseId, Status newStatus) {

        ExpenseEntity expenseEntity = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expenseEntity.setStatus(newStatus);

        expenseRepository.save(expenseEntity);

        return expenseMapper.mapTo(expenseEntity);

    }

    @Override
    public void deleteExpense(Long expenseId) {

        if(!expenseRepository.existsById(expenseId)){
            throw new RuntimeException("Expense not found");
        }
        expenseRepository.deleteById(expenseId);

    }

    @Override
    public List<ExpenseDto> findPendingExpensesForTeam(List<Long> employeeIds, Status status) {

        if(employeeIds.isEmpty()){
            throw new RuntimeException("Employee list should not be empty");
        }

        List<ExpenseEntity> expenseEntity=expenseRepository.findAllByEmployeeIdInAndStatus(employeeIds,status);

        return expenseEntity.stream()
                .map(expenseMapper::mapTo)
                .collect(Collectors.toList());
    }
}
