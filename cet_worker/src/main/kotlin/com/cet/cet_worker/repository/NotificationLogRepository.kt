package com.cet.cet_worker.repository

import com.cet.cet_worker.entity.NotificationLog
import org.springframework.data.jpa.repository.JpaRepository

/**
 * Repository interface for performing CRUD operations on NotificationLog entities.
 */
interface NotificationLogRepository : JpaRepository<NotificationLog, Long> {
}