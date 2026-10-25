package com.cet.cet_worker.service

import com.cet.cet_worker.dto.ExpenseDto
import org.springframework.stereotype.Service
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.layout.Document
import com.itextpdf.layout.element.Paragraph
import java.io.FileOutputStream
import java.nio.file.Files
import java.nio.file.Paths

/**
 * Service responsible for generating PDF receipts for corporate expenses using iText library.
 */
@Service
class PdfService {

    /**
     * Generates a PDF receipt file containing details of the provided expense DTO
     * inside the local 'receipts' directory and returns the file path.
     */
    fun generateReceipt(expenseDto: ExpenseDto): String {
        val directory = Paths.get("receipts")
        if (!Files.exists(directory)) {
            Files.createDirectory(directory)
        }

        val filePath = "receipts/Expense_${expenseDto.id}.pdf"

        val writer = PdfWriter(FileOutputStream(filePath))
        val pdfDoc = PdfDocument(writer)
        val document = Document(pdfDoc)

        document.add(Paragraph("Corporate Expense Receipt"))
        document.add(Paragraph("---------------------------------"))
        document.add(Paragraph("Expense ID: ${expenseDto.id}"))
        document.add(Paragraph("Employee: ${expenseDto.employeeFirstName ?: "N/A"} (ID: ${expenseDto.employeeId})"))
        document.add(Paragraph("Category: ${expenseDto.category}"))
        document.add(Paragraph("Description: ${expenseDto.description}"))
        document.add(Paragraph("Amount: ${expenseDto.amount} RSD"))
        document.add(Paragraph("Status: ${expenseDto.status}"))

        document.close()

        println("PDF Receipt successfully generated at: $filePath")
        return filePath
    }
}