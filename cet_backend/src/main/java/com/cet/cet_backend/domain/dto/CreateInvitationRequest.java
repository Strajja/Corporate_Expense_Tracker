package com.cet.cet_backend.domain.dto;

import com.cet.cet_backend.domain.entities.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Data Transfer Object representing a request to create a new user invitation.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateInvitationRequest {

    @NotBlank(message = "First name is required.")
    private String firstName;

    @NotBlank(message = "Last name is required.")
    private String lastName;

    @NotBlank(message = "Email address is required.")
    @Email(message = "Email must be in a valid format.")
    private String emailAddress;

    @NotNull(message = "Date of birth is required.")
    @Past(message = "Date of birth must be in the past.")
    private LocalDate dateOfBirth;

    @NotNull(message = "Hire date is required.")
    private LocalDate hireDate;

    @NotNull(message = "Role is required.")
    private Role role;
}