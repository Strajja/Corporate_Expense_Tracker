package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.LoginRequest;
import com.cet.cet_backend.domain.dto.RegisterRequest;
import com.cet.cet_backend.domain.dto.TokenResponse;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.domain.entities.UserInvitationEntity;
import com.cet.cet_backend.repository.UserInvitationRepository;
import com.cet.cet_backend.repository.UserRepository;
import com.cet.cet_backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the AuthService class.
 * Mocks dependencies to test the business logic for login and registration in isolation.
 */
@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserInvitationRepository userInvitationRepository;

    @InjectMocks
    private AuthService authService;

    private UserEntity user;
    private UserInvitationEntity invitation;

    @BeforeEach
    void setUp() {
        user = UserEntity.builder()
                .id(1L)
                .username("testuser")
                .password("encodedpassword")
                .role(Role.EMPLOYEE)
                .build();

        invitation = UserInvitationEntity.builder()
                .id(1L)
                .code("VALID-CODE")
                .firstName("John")
                .lastName("Doe")
                .emailAddress("john@example.com")
                .role(Role.EMPLOYEE)
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .hireDate(LocalDate.now())
                .expirationDate(LocalDateTime.now().plusDays(1))
                .build();
    }

    /**
     * Tests a successful login scenario.
     * Verifies that the authentication manager is called and a valid token is returned.
     */
    @Test
    void login_Success_ReturnsToken() {
        LoginRequest request = new LoginRequest("testuser", "password");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("mocked-jwt-token");

        TokenResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.getToken());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    /**
     * Tests a successful user registration scenario using a valid invitation code.
     * Verifies that a new user is saved, the invitation is deleted, and a token is generated.
     */
    @Test
    void register_Success_ReturnsToken() {
        RegisterRequest request = new RegisterRequest("VALID-CODE", "newuser", "password");

        when(userInvitationRepository.findByCode("VALID-CODE")).thenReturn(Optional.of(invitation));
        when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("encoded-pwd");
        when(jwtService.generateToken(any(UserEntity.class))).thenReturn("new-jwt-token");

        TokenResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("new-jwt-token", response.getToken());
        verify(userRepository, times(1)).save(any(UserEntity.class));
        verify(userInvitationRepository, times(1)).delete(invitation);
    }

    /**
     * Tests the registration flow when the provided invitation code has expired.
     * Verifies that an exception is thrown and the expired invitation is deleted from the database.
     */
    @Test
    void register_Fails_WhenInvitationExpired() {
        invitation.setExpirationDate(LocalDateTime.now().minusDays(1)); // Set to past
        RegisterRequest request = new RegisterRequest("VALID-CODE", "newuser", "password");

        when(userInvitationRepository.findByCode("VALID-CODE")).thenReturn(Optional.of(invitation));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.register(request));

        assertEquals("User invitation is expired", exception.getMessage());
        verify(userInvitationRepository, times(1)).delete(invitation);
        verify(userRepository, never()).save(any());
    }
}