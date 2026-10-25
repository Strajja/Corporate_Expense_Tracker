package com.cet.cet_backend.controllers;

import com.cet.cet_backend.domain.dto.LoginRequest;
import com.cet.cet_backend.domain.dto.TokenResponse;
import com.cet.cet_backend.domain.dto.RegisterRequest;
import com.cet.cet_backend.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller handling user authentication and registration requests.
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Authenticates a user and returns a JWT token upon successful login.
     *
     * @param loginRequest DTO containing username and password.
     * @return ResponseEntity containing the TokenResponse.
     */
    @PostMapping(path="/users/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest loginRequest){
        return ResponseEntity.ok(authService.login(loginRequest));
    }

    /**
     * Registers a new user based on a valid invitation code.
     *
     * @param registerRequest DTO containing registration details.
     * @return ResponseEntity containing the TokenResponse.
     */
    @PostMapping(path="/users/register")
    public ResponseEntity<TokenResponse> register(@RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.register(registerRequest));
    }
}