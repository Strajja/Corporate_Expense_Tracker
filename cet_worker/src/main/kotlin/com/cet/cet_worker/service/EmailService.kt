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

    fun sendCodeForRegistration(emailAddress: String, firstName: String, code: String) {
        val message = SimpleMailMessage()
        message.from = "system@cet.com"
        message.setTo(emailAddress)
        message.subject = "Pozivnica za registraciju - CET Platforma"
        message.text = """
            Zdravo $firstName,
            
            Pozvani ste da se registrujete na CET platformu.
            Vaš kod za registraciju je: $code
            
            Srdačan pozdrav,
            CET Tim
        """.trimIndent()

        mailSender.send(message)
        println("Email sa kodom za registraciju uspešno poslat na: $emailAddress")
    }

}