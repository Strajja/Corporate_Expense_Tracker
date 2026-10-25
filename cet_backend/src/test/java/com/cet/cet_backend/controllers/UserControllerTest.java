package com.cet.cet_backend.controllers;

import com.cet.cet_backend.domain.dto.UserDto;
import com.cet.cet_backend.security.JwtService;
import com.cet.cet_backend.services.InvitationService;
import com.cet.cet_backend.services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Web MVC tests for UserController.
 * Verifies HTTP endpoints for user management and team assignments.
 */
@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(JwtService.class)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;
    @MockitoBean
    private InvitationService invitationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Tests the retrieval of all users, ensuring the response is formatted as a JSON array.
     */
    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getAllUsers_ReturnsList() throws Exception {
        UserDto userDto = UserDto.builder().id(1L).username("emp1").build();
        when(userService.findAllUsers()).thenReturn(List.of(userDto));

        mockMvc.perform(get("/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("emp1"));
    }

    /**
     * Tests the manager assignment endpoint, verifying the service method is called and returns a success string.
     */
    @Test
    @WithMockUser(username = "manager", roles = {"MANAGER"})
    void assignEmployee_ReturnsOk() throws Exception {
        mockMvc.perform(patch("/users/5/assign"))
                .andExpect(status().isOk())
                .andExpect(content().string("Employee successfully assigned to your team."));

        verify(userService, times(1)).assignManagerToEmployee(eq(5L), eq("manager"));
    }

    /**
     * Tests the username change endpoint, ensuring JSON body is correctly parsed.
     */
    @Test
    @WithMockUser(username = "employee", roles = {"EMPLOYEE"})
    void changeUsername_ReturnsOk() throws Exception {
        Map<String, String> body = Map.of("newUsername", "new_emp");

        mockMvc.perform(patch("/users/me/username")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(content().string("Username successfully updated."));

        verify(userService, times(1)).changeUsername(eq("employee"), eq("new_emp"));
    }
}