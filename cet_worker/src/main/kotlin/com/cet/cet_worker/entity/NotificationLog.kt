package com.cet.cet_worker.entity

import jakarta.persistence.*
import java.time.LocalDateTime

/**
 * Entity class representing notification logs stored in the database
 * to track the success or failure of sent emails and generated documents.
 */
@Entity
@Table(name = "notification_logs")
data class NotificationLog (
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,
    val expenseId: Long,
    val sentAt: LocalDateTime = LocalDateTime.now(),
    val status: String
)