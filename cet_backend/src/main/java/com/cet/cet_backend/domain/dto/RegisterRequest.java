package com.cet.cet_backend.domain.dto;

import com.cet.cet_backend.domain.entities.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank
    private String code;

    @NotBlank
    private String username;

    @NotBlank
    private String password;

}
