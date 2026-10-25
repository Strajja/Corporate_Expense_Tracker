package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.LoginRequest;
import com.cet.cet_backend.domain.dto.TokenResponse;
import com.cet.cet_backend.domain.dto.RegisterRequest;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.domain.entities.UserInvitationEntity;
import com.cet.cet_backend.repository.UserInvitationRepository;
import com.cet.cet_backend.repository.UserRepository;
import com.cet.cet_backend.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Service responsible for user authentication and registration operations.
 */
@Service
public class AuthService {

    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserInvitationRepository userInvitationRepository;

    public AuthService(JwtService jwtService, AuthenticationManager authenticationManager, UserRepository userRepository, PasswordEncoder passwordEncoder, UserInvitationRepository userInvitationRepository) {
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userInvitationRepository = userInvitationRepository;
    }

    /**
     * Authenticates a user based on provided credentials and returns a JWT token.
     *
     * @param loginRequest DTO containing username and password.
     * @return TokenResponse containing the generated JWT.
     */
    public TokenResponse login(LoginRequest loginRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        var user = userRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
        var jwtToken = jwtService.generateToken(user);

        return TokenResponse.builder()
                .token(jwtToken)
                .build();
    }

    /**
     * Registers a new user using a valid invitation code and returns a JWT token.
     *
     * @param registerRequest DTO containing invitation code, desired username, and password.
     * @return TokenResponse containing the generated JWT.
     */
    public TokenResponse register(RegisterRequest registerRequest) {
        UserInvitationEntity invitation = userInvitationRepository.findByCode(registerRequest.getCode())
                .orElseThrow(() -> new RuntimeException("User invitation not found"));

        if (invitation.getExpirationDate().isBefore(LocalDateTime.now())) {
            userInvitationRepository.delete(invitation);
            throw new RuntimeException("User invitation is expired");
        }

        if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Username has already been registered");
        }

        UserEntity newUser = UserEntity.builder()
                .firstName(invitation.getFirstName())
                .lastName(invitation.getLastName())
                .emailAddress(invitation.getEmailAddress())
                .dateOfBirth(invitation.getDateOfBirth())
                .role(invitation.getRole())
                .username(registerRequest.getUsername())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .hireDate(invitation.getHireDate())
                .build();

        if (invitation.getManagerId() != null) {
            newUser.setManagerId(invitation.getManagerId());
        }

        userRepository.save(newUser);
        userInvitationRepository.delete(invitation);

        String jwtToken = jwtService.generateToken(newUser);

        return new TokenResponse(jwtToken);
    }
}