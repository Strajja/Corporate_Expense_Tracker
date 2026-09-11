package com.cet.cet_worker.config

import org.springframework.amqp.support.converter.JacksonJsonMessageConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMQConfig {

    @Bean
    fun jsonMessageConverter(): JacksonJsonMessageConverter {
        return JacksonJsonMessageConverter()
    }
}