package com.cet.cet_worker.config

import com.cet.cet_worker.dto.ExpenseDto
import com.cet.cet_worker.dto.InvitationEmailEvent
import org.springframework.amqp.core.Queue
import org.springframework.amqp.core.QueueBuilder
import org.springframework.amqp.support.converter.DefaultClassMapper
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMQConfig {

    @Bean
    open fun jsonMessageConverter(): Jackson2JsonMessageConverter {
        val converter = Jackson2JsonMessageConverter()
        val classMapper = DefaultClassMapper().apply {
            setTrustedPackages("*")
            setIdClassMapping(
                mapOf(
                    "com.cet.cet_backend.domain.dto.InvitationEmailEvent" to InvitationEmailEvent::class.java,
                    "com.cet.cet_backend.domain.dto.ExpenseDto" to ExpenseDto::class.java
                )
            )
        }
        converter.setClassMapper(classMapper)
        return converter
    }

    @Bean
    fun expenseNotificationsQueue(): Queue {
        return QueueBuilder.durable("expense_notifications")
            .withArgument("x-dead-letter-exchange", "expense_dlx")
            .withArgument("x-dead-letter-routing-key", "expense_notifications_dlq")
            .build()
    }

    @Bean
    fun emailInvitationsQueue(): Queue {
        return Queue("email_invitation_queue", true)
    }
}