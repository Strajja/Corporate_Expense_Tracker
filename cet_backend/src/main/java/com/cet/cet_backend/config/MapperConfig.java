package com.cet.cet_backend.config;

import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for DTO to Entity object mapping.
 */
@Configuration
public class MapperConfig {

    /**
     * Exposes ModelMapper to be injected across the application.
     */
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}