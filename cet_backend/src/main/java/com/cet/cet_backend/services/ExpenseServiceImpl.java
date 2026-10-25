package com.cet.cet_backend.services;

import com.cet.cet_backend.config.RabbitMQConfig;
import com.cet.cet_backend.domain.dto.ExpenseDto;
import com.cet.cet_backend.domain.entities.ExpenseEntity;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.Status;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.mappers.Mapper;
import com.cet.cet_backend.repository.ExpenseRepository;
import com.cet.cet_backend.repository.UserRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ExpenseService, providing logic for expense management and integration with RabbitMQ.
 */
@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final Mapper<ExpenseEntity, ExpenseDto> expenseMapper;
    private final RabbitTemplate rabbitTemplate;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository, UserRepository userRepository, Mapper<ExpenseEntity, ExpenseDto> expenseMapper, RabbitTemplate rabbitTemplate) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.expenseMapper = expenseMapper;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public ExpenseDto createExpense(ExpenseDto expenseDto, String currentUsername) {
        UserEntity employee = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Logged in user not found in DB"));

        if (employee.getRole() == Role.EMPLOYEE && employee.getManagerId() == null) {
            throw new RuntimeException("You cannot create expenses because you do not have an assigned manager.");
        }

        ExpenseEntity expenseEntity = expenseMapper.mapFrom(expenseDto);
        expenseEntity.setEmployee(employee);

        if (employee.getRole() == Role.EMPLOYEE) {
            expenseEntity.setStatus(Status.PENDING);
        } else {
            expenseEntity.setStatus(Status.APPROVED);
        }

        ExpenseEntity savedExpense = expenseRepository.save(expenseEntity);
        ExpenseDto outputDto = expenseMapper.mapTo(savedExpense);

        outputDto.setEmployeeFirstName(employee.getFirstName());
        outputDto.setEmployeeId(employee.getId());

        if (employee.getManagerId() != null) {
            userRepository.findById(employee.getManagerId())
                    .ifPresent(manager -> outputDto.setManagerEmail(manager.getEmailAddress()));
        }

        // Send notification event to RabbitMQ
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXPENSE_QUEUE, outputDto);

        return outputDto;
    }

    @Override
    public Page<ExpenseDto> findAllExpenses(Pageable pageable, String currentUsername) {
        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found in DB"));

        Page<ExpenseEntity> expenses = expenseRepository.findAllByEmployeeId(user.getId(), pageable);
        return expenses.map(expenseMapper::mapTo);
    }

    @Override
    public Page<ExpenseDto> findAllApprovals(Pageable pageable, String currentUsername) {
        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found in DB"));

        if (user.getRole() == Role.ADMIN) {
            Page<ExpenseEntity> expenses = expenseRepository.findAllByEmployeeIdNot(user.getId(), pageable);
            return expenses.map(expenseMapper::mapTo);
        } else if (user.getRole() == Role.MANAGER) {
            List<UserEntity> teamEmployees = userRepository.findAllByManagerId(user.getId());
            List<Long> employeeIds = teamEmployees.stream().map(UserEntity::getId).toList();

            if (employeeIds.isEmpty()) {
                return Page.empty(pageable);
            }

            Page<ExpenseEntity> expenses = expenseRepository.findAllByEmployeeIdIn(employeeIds, pageable);
            return expenses.map(expenseMapper::mapTo);
        }
        return Page.empty(pageable);
    }

    @Override
    public List<ExpenseDto> findExpensesByEmployeeId(Long employeeId) {
        if (!userRepository.existsById(employeeId)) {
            throw new RuntimeException("Employee not found");
        }

        return expenseRepository.findAllByEmployeeId(employeeId)
                .stream()
                .map(expenseMapper::mapTo)
                .collect(Collectors.toList());
    }

    @Override
    public ExpenseDto updateExpenseStatus(Long expenseId, Status newStatus, String comment) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            throw new RuntimeException("Access denied: Employees cannot approve or reject expenses");
        }

        ExpenseEntity expenseEntity = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expenseEntity.setStatus(newStatus);
        expenseEntity.setComment(comment);
        expenseEntity.setReviewedBy(currentUser);
        expenseRepository.save(expenseEntity);

        return expenseMapper.mapTo(expenseEntity);
    }

    @Override
    public ExpenseDto adminOverride(Long expenseId, Status newStatus, String comment) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            throw new RuntimeException("Access denied: Only admins can override expenses");
        }

        ExpenseEntity expenseEntity = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        expenseEntity.setStatus(newStatus);
        expenseEntity.setComment(comment + " (Admin Override)");
        expenseEntity.setReviewedBy(currentUser);
        expenseRepository.save(expenseEntity);

        return expenseMapper.mapTo(expenseEntity);
    }

    @Override
    public void deleteExpense(Long expenseId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ExpenseEntity expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getEmployee().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
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

        if (currentUser.getRole() == Role.EMPLOYEE) {
            throw new RuntimeException("Access denied: Only managers can view team expenses");
        }

        if (employeeIds.isEmpty()) {
            throw new RuntimeException("Employee list should not be empty");
        }

        List<ExpenseEntity> expenseEntities = expenseRepository.findAllByEmployeeIdInAndStatus(employeeIds, status);

        return expenseEntities.stream()
                .map(expenseMapper::mapTo)
                .collect(Collectors.toList());
    }

    @Override
    public ExpenseDto updateExpense(Long expenseId, ExpenseDto expenseDto, String currentUsername) {
        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ExpenseEntity expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getEmployee().getId().equals(user.getId()) && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Access denied: You do not own this expense");
        }

        if (expense.getStatus() != Status.PENDING && user.getRole() == Role.EMPLOYEE) {
            throw new RuntimeException("You can only edit pending expenses");
        }

        expense.setDescription(expenseDto.getDescription());
        expense.setAmount(expenseDto.getAmount());
        if (expenseDto.getCategory() != null) {
            expense.setCategory(expenseDto.getCategory());
        }

        ExpenseEntity updatedExpense = expenseRepository.save(expense);
        ExpenseDto outputDto = expenseMapper.mapTo(updatedExpense);

        outputDto.setEmployeeFirstName(expense.getEmployee().getFirstName());
        outputDto.setEmployeeId(expense.getEmployee().getId());
        outputDto.setComment(updatedExpense.getComment());

        return outputDto;
    }
}