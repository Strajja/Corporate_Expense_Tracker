package com.cet.cet_backend.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXPENSE_QUEUE="expense_notifications";

    @Bean
    public Queue expenseQueue() {
        return new Queue(EXPENSE_QUEUE,true);
    }
}

