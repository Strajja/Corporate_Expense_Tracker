package com.cet.cet_backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private Long id;

    private String firstName;

    private String lastName;

    private String emailAddress;

    private String username;

    private LocalDate dateOfBirth;

    private LocalTime hireDate;

    private String role;

    private Long managerId;
}
