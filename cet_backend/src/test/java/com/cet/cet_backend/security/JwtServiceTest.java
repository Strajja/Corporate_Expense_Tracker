package com.cet.cet_backend.security;

import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for JwtService.
 * Validates JWT token generation, claim extraction, and token expiration logic.
 */
@ExtendWith(MockitoExtension.class)
public class JwtServiceTest {

    private JwtService jwtService;
    private UserEntity user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        // Inject secret key and expiration time for test environment
        ReflectionTestUtils.setField(
                jwtService,
                "secretKey",
                "404E635266556A586E3272357538782F413F4428472B4B6250655368566D5971"
        );
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hour

        user = UserEntity.builder()
                .id(1L)
                .username("john_doe")
                .role(Role.EMPLOYEE)
                .build();
    }

    /**
     * Tests JWT generation and subject extraction.
     */
    @Test
    void generateToken_And_ExtractUsername_Success() {
        String token = jwtService.generateToken(user);

        assertNotNull(token);
        String username = jwtService.extractUsername(token);
        assertEquals("john_doe", username);
    }

    /**
     * Tests token validation against user details.
     */
    @Test
    void isTokenValid_ReturnsTrueForValidUser() {
        String token = jwtService.generateToken(user);

        boolean isValid = jwtService.isTokenValid(token, user);

        assertTrue(isValid);
    }
}