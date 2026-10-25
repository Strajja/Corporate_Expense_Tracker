package com.cet.cet_worker.service

import com.cet.cet_worker.dto.ExpenseDto
import com.cet.cet_worker.dto.InvitationEmailEvent
import com.cet.cet_worker.entity.NotificationLog
import com.cet.cet_worker.repository.NotificationLogRepository
import org.springframework.amqp.rabbit.annotation.RabbitListener
import org.springframework.stereotype.Service

/**
 * Service that listens to RabbitMQ queues to process incoming expense notifications
 * and registration invitation events, triggering document generation and email dispatch.
 */
@Service
class NotificationService(
    private val emailService: EmailService,
    private val pdfService: PdfService,
    private val logRepository: NotificationLogRepository
) {

    /**
     * Listens to the expense notifications queue, generates a PDF receipt,
     * sends an approval request email, and logs the execution outcome.
     */
    @RabbitListener(queues = ["expense_notifications"])
    fun receiveExpenseNotification(expense: ExpenseDto) {
        println("\n=========================================================")
        println("NEW EXPENSE MESSAGE RECEIVED FROM RABBITMQ!")

        try {
            val pdfPath = pdfService.generateReceipt(expense)
            emailService.sendApprovalRequest(expense, pdfPath)

            val log = NotificationLog(
                expenseId = expense.id ?: 0L,
                status = "SUCCESS"
            )
            logRepository.save(log)

            println("Notification workflow completed and logged.")
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

    /**
     * Listens to the email invitation queue, sends registration codes to new users,
     * and logs the outcome.
     */
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

            println("Invitation email successfully sent and logged.")
        } catch (e: Exception) {
            println("Error processing invitation email for: ${event.emailAddress}")
            e.printStackTrace()
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