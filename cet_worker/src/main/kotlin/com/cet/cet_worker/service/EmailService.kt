package com.cet.cet_worker.service

import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.stereotype.Service
import java.math.BigDecimal

@Service
class EmailService  (private val mailSender: JavaMailSender) {

    fun sendApprovalRequest(expenseId: Long?, amount: BigDecimal?, employeeId: Long?) {

        val message = SimpleMailMessage()
        message.from = "system@cet.com"
        message.setTo("manager@cet.com")
        message.subject = "Action Required: New Expense Approval (ID: $expenseId)"
        message.text = "Employee ID $employeeId has submitted a new expense for the amount of $amount RSD.\n\nPlease log in to the Corporate Expense Tracker to review and approve."

        mailSender.send(message)
        println("📧 Email successfully sent to manager for Expense ID: $expenseId")
    }

}