package com.cet.cet_backend.config;

import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                UserEntity admin = UserEntity.builder()
                        .firstName("System")
                        .lastName("Admin")
                        .emailAddress("admin@cet.com")
                        .username("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .dateOfBirth(LocalDate.of(2000, 1, 1))
                        .hireDate(LocalDate.now())
                        .role(Role.ADMIN)
                        .build();

                userRepository.save(admin);
                System.out.println(">>> Inicijalni ADMIN nalog je uspešno kreiran (admin / admin123)");
            }
        };
    }
}