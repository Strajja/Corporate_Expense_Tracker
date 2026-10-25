package com.cet.cet_backend.controllers;

import com.cet.cet_backend.domain.dto.LoginRequest;
import com.cet.cet_backend.domain.dto.RegisterRequest;
import com.cet.cet_backend.domain.dto.TokenResponse;
import com.cet.cet_backend.security.JwtService;
import com.cet.cet_backend.services.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web MVC tests for AuthController.
 * Validates HTTP routing, request deserialization, and response formatting for authentication endpoints.
 */
@WebMvcTest(controllers=AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(JwtService.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Tests the /users/login endpoint to ensure it returns 200 OK and a valid token on success.
     */
    @Test
    void login_ReturnsOkWithToken() throws Exception {
        LoginRequest request = new LoginRequest("user", "pass");
        TokenResponse tokenResponse = new TokenResponse("jwt-token-123");

        when(authService.login(any(LoginRequest.class))).thenReturn(tokenResponse);

        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-123"));
    }

    /**
     * Tests the /users/register endpoint to ensure it returns 200 OK and a valid token on success.
     */
    @Test
    void register_ReturnsOkWithToken() throws Exception {
        RegisterRequest request = new RegisterRequest("CODE123", "newuser", "pass");
        TokenResponse tokenResponse = new TokenResponse("jwt-token-456");

        when(authService.register(any(RegisterRequest.class))).thenReturn(tokenResponse);

        mockMvc.perform(post("/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token-456"));
    }
}