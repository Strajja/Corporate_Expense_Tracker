package com.cet.cet_backend.services;

import com.cet.cet_backend.config.RabbitMQConfig;
import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.ExpenseEntity;
import com.cet.cet_backend.domain.entities.Status;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.mappers.Mapper;
import com.cet.cet_backend.repository.ExpenseRepository;
import com.cet.cet_backend.repository.UserRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;

    private final UserRepository userRepository;

    private final Mapper<ExpenseEntity,ExpenseDto> expenseMapper;

    private final RabbitTemplate rabbitTemplate;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository, UserRepository userRepository, Mapper<ExpenseEntity, ExpenseDto> expenseMapper,  RabbitTemplate rabbitTemplate) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.expenseMapper = expenseMapper;
        this.rabbitTemplate = rabbitTemplate;
    }
    @Async("asyncExecutor")
    @Override
    public CompletableFuture<ExpenseDto> createExpense(ExpenseDto expenseDto, String currentUsername) {

        UserEntity employee = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Logged in user not found in DB"));

        ExpenseEntity expenseEntity = expenseMapper.mapFrom(expenseDto);

        expenseEntity.setEmployee(employee);

        ExpenseEntity savedExpense = expenseRepository.save(expenseEntity);
        ExpenseDto outputDto = expenseMapper.mapTo(savedExpense);

        rabbitTemplate.convertAndSend(RabbitMQConfig.EXPENSE_QUEUE, outputDto);

        return CompletableFuture.completedFuture(outputDto);
    }

    @Override
    public Page<ExpenseDto> findAllExpenses(Pageable pageable) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found in DB"));

        Page<ExpenseEntity> expenses = expenseRepository.findAllByEmployeeId(user.getId(), pageable);

        return expenses.map(expenseMapper::mapTo);
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

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole().equals("EMPLOYEE")) {
            throw new RuntimeException("Access denied: Employees cannot approve or reject expenses");
        }

        ExpenseEntity expenseEntity = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expenseEntity.setStatus(newStatus);
        expenseRepository.save(expenseEntity);

        return expenseMapper.mapTo(expenseEntity);
    }

    @Override
    public void deleteExpense(Long expenseId) {


        Authentication authentication= SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ExpenseEntity expense= expenseRepository.findById(expenseId)
                .orElseThrow(()->new RuntimeException("Expense not found"));

        if(!expense.getEmployee().getId().equals(user.getId())){
            throw new RuntimeException("Access denied: You do not own this expense");
        }

        expenseRepository.delete(expense);

    }

    @Override
    public List<ExpenseDto> findPendingExpensesForTeam(List<Long> employeeIds, Status status) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole().equals("EMPLOYEE")) {
            throw new RuntimeException("Access denied: Only managers can view team expenses");
        }

        if(employeeIds.isEmpty()){
            throw new RuntimeException("Employee list should not be empty");
        }

        List<ExpenseEntity> expenseEntity = expenseRepository.findAllByEmployeeIdInAndStatus(employeeIds, status);

        return expenseEntity.stream()
                .map(expenseMapper::mapTo)
                .collect(Collectors.toList());
    }
}
