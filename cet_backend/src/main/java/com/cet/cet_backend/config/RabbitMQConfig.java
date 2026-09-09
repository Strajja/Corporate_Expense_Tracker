package com.cet.cet_backend.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXPENSE_QUEUE="expense_notifications";
    public static final String DLQ="expense_notifications_dlq";
    public static final String DLX="expense_dlx";


    @Bean
    public DirectExchange deadLetterExchange(){
        return new DirectExchange(DLX);
    }

    @Bean
    public Queue dlq(){
        return new Queue(DLQ,true);
    }

    @Bean
    public Binding dlqBinding(){
        return BindingBuilder.bind(dlq()).to(deadLetterExchange()).with(DLX);
    }

    @Bean
    public Queue expenseQueue() {
        return QueueBuilder.durable(EXPENSE_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX)
                .withArgument("x-dead-letter-routing-key", DLQ)
                .build();
    }
}

