package com.cet.cet_worker.service

import com.cet.cet_worker.dto.ExpenseDto
import jakarta.mail.internet.MimeMessage
import org.springframework.core.io.FileSystemResource
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service
import java.io.File

/**
 * Service responsible for composing and sending emails,
 * including approval requests with attached PDF reports and user registration codes.
 */
@Service
class EmailService(
    private val mailSender: JavaMailSender
) {

    /**
     * Sends an email to the manager requesting expense approval, attaching the generated PDF receipt.
     * Modified for DEMO MODE: Simulates the email sending to prevent SMTP errors during local testing.
     */
    fun sendApprovalRequest(expense: ExpenseDto, pdfPath: String) {
        val managerEmail = expense.managerEmail
        if (managerEmail.isNullOrEmpty()) {
            println("Manager email missing for Expense ID: ${expense.id}")
            return
        }

        /*
         * =====================================================================================
         * ORIGINAL PRODUCTION METHOD
         * =====================================================================================
         * val message: MimeMessage = mailSender.createMimeMessage()
         * val helper = MimeMessageHelper(message, true)
         *
         * helper.setTo(managerEmail)
         * helper.setSubject("New Expense Pending Approval: ${expense.description}")
         * helper.setText(
         *     "Dear Manager,\n\nEmployee ${expense.employeeFirstName ?: ""} (ID: ${expense.employeeId}) has submitted a new expense for approval.\n\n" +
         *             "Amount: ${expense.amount} RSD\n" +
         *             "Category: ${expense.category}\n" +
         *             "Description: ${expense.description}\n\n" +
         *             "Please find the generated PDF report attached.\n\nBest regards,\nCET System"
         * )
         *
         * val pdfFile = File(pdfPath)
         * if (pdfFile.exists()) {
         *     helper.addAttachment("Expense_${expense.id}.pdf", FileSystemResource(pdfFile))
         * }
         *
         * mailSender.send(message)
         * println("Email with PDF successfully sent to manager at: $managerEmail")
         * =====================================================================================
         */

        // DEMO MODE: Log to console instead of sending an actual email via SMTP
        println("=========================================================")
        println("DEMO WORKER - RabbitMQ successfully processed PDF Approval Request!")
        println("Simulating email with PDF attachment to manager: $managerEmail")
        println("Expense Description: ${expense.description}")
        println("Amount: ${expense.amount} RSD")
        println("=========================================================")
    }

    /**
     * DEMO MODE METHOD
     * Simulates sending a registration invitation email containing an activation code to a new user.
     * Instead of actually dispatching the email via SMTP, it prints the payload to the console.
     * This allows testing the async RabbitMQ pipeline without requiring valid SMTP credentials.
     */
    fun sendCodeForRegistration(emailAddress: String?, firstName: String?, code: String?) {
        /*
         * =====================================================================================
         * ORIGINAL PRODUCTION METHOD
         * =====================================================================================
         * val message: MimeMessage = mailSender.createMimeMessage()
         * val helper = MimeMessageHelper(message, false)
         *
         * helper.setTo(emailAddress ?: return)
         * helper.setSubject("Registration Invitation")
         * helper.setText("Hello ${firstName ?: ""},\n\nYour registration code is: $code")
         *
         * mailSender.send(message)
         * =====================================================================================
         */

        if (emailAddress == null) return

        // DEMO MODE: Console output to prove that RabbitMQ Consumer works
        println("=========================================================")
        println("DEMO WORKER - RabbitMQ successfully received the message!")
        println("Simulating email dispatch to: $emailAddress")
        println("Generated registration code: $code")
        println("=========================================================")
    }
}