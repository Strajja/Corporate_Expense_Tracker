package com.cet.cet_worker.service

import com.cet.cet_worker.dto.ExpenseDto
import jakarta.mail.internet.MimeMessage
import org.springframework.core.io.FileSystemResource
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.mail.javamail.MimeMessageHelper
import org.springframework.stereotype.Service
import java.io.File

@Service
class EmailService(
    private val mailSender: JavaMailSender
) {

    fun sendApprovalRequest(expense: ExpenseDto, pdfPath: String) {
        val managerEmail = expense.managerEmail
        if (managerEmail.isNullOrEmpty()) {
            println("Manager email missing for Expense ID: ${expense.id}")
            return
        }

        val message: MimeMessage = mailSender.createMimeMessage()
        val helper = MimeMessageHelper(message, true)

        helper.setTo(managerEmail)
        helper.setSubject("Novi trošak na čekanju: ${expense.description}")
        helper.setText(
            "Poštovani,\n\nRadnik ${expense.employeeFirstName ?: ""} (ID: ${expense.employeeId}) je podneo novi trošak za odobrenje.\n\n" +
                    "Iznos: ${expense.amount} RSD\n" +
                    "Kategorija: ${expense.category}\n" +
                    "Opis: ${expense.description}\n\n" +
                    "U prilogu se nalazi generisani PDF izveštaj.\n\nSrdačan pozdrav,\nCET Sistem"
        )

        val pdfFile = File(pdfPath)
        if (pdfFile.exists()) {
            helper.addAttachment("Trosak_${expense.id}.pdf", FileSystemResource(pdfFile))
        }

        mailSender.send(message)
        println("Email sa PDF-om uspešno poslat menadžeru na: $managerEmail")
    }

    fun sendCodeForRegistration(emailAddress: String?, firstName: String?, code: String?) {
        val message: MimeMessage = mailSender.createMimeMessage()
        val helper = MimeMessageHelper(message, false)

        helper.setTo(emailAddress ?: return)
        helper.setSubject("Pozivnica za registraciju")
        helper.setText("Zdravo ${firstName ?: ""},\n\nTvoj kod za registraciju je: $code")

        mailSender.send(message)
    }
}