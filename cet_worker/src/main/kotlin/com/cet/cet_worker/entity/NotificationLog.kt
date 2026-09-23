package com.cet.cet_worker.entity

import jakarta.persistence.*;
import java.time.LocalDateTime

@Entity
@Table(name = "notification_logs")
data class NotificationLog (
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long?= null,
    val expenseId: Long,
    val sentAt: LocalDateTime = LocalDateTime.now(),
    val status: String

)