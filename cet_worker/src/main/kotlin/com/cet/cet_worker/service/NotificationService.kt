package com.cet.cet_worker.service

import com.cet.cet_worker.dto.ExpenseDto
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Service

@Service
class NotificationService(private val emailService: EmailService) {

    @RabbitListener(queues = ["expense_notifications"])
    fun receiveExpenseNotification(expense: ExpenseDto) {

        println("\n=========================================================")
        println("📩 NEW MESSAGE RECEIVED FROM RABBITMQ!")
        println("=========================================================")
        println("Generating manager notification...")
        println("Expense ID: ${expense.id}")
        println("Amount: ${expense.amount}")
        println("Category: ${expense.category}")

        emailService.sendApprovalRequest(expense.id, expense.amount, expense.employeeId)
        println("=========================================================\n")


    }
}