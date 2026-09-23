package com.cet.cet_worker.service

import com.cet.cet_worker.dto.ExpenseDto
import com.cet.cet_worker.dto.InvitationEmailEvent
import com.cet.cet_worker.entity.NotificationLog
import com.cet.cet_worker.repository.NotificationLogRepository
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Service

@Service
class NotificationService(
    private val emailService: EmailService,
    private val pdfService: PdfService,
    private val logRepository: NotificationLogRepository
) {

    @RabbitListener(queues = ["expense_notifications"])
    fun receiveExpenseNotification(expense: ExpenseDto) {
        println("\n=========================================================")
        println("NEW MESSAGE RECEIVED FROM RABBITMQ!")

        try {
            pdfService.generateReceipt(expense)

            emailService.sendApprovalRequest(expense.id, expense.amount, expense.employeeId)

            val log = NotificationLog(
                expenseId = expense.id ?: 0L,
                status = "SUCCESS"
            )
            logRepository.save(log)

            println("Notification workflow completed and logged to H2 DB.")
        } catch (e: Exception) {
            println("Error processing notification for Expense ID: ${expense.id}")
            val log = NotificationLog(
                expenseId = expense.id ?: 0L,
                status = "FAILED"
            )
            logRepository.save(log)
            throw e
        }
        println("=========================================================\n")
    }

    @RabbitListener(queues = ["email_invitation_queue"])
    fun receiveInvitationNotification(event: InvitationEmailEvent) {
        println("\n=========================================================")
        println("NEW INVITATION EMAIL MESSAGE RECEIVED FROM RABBITMQ!")

        try {
            emailService.sendCodeForRegistration(
                emailAddress = event.emailAddress,
                firstName = event.firstName,
                code = event.invitationCode
            )

            val log = NotificationLog(
                expenseId = 0L,
                status = "SUCCESS_INVITATION"
            )
            logRepository.save(log)

            println("Invitation email workflow completed and logged to H2 DB.")
        } catch (e: Exception) {
            println("Error processing invitation email for: ${event.emailAddress}")
            val log = NotificationLog(
                expenseId = 0L,
                status = "FAILED_INVITATION"
            )
            logRepository.save(log)
            throw e
        }
        println("=========================================================\n")
    }
}