package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.UserDto;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.mappers.Mapper;
import com.cet.cet_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the UserServiceImpl class.
 * Validates business logic related to user management, including password and username changes.
 */
@ExtendWith(MockitoExtension.class)
public class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private Mapper<UserEntity, UserDto> userMapper;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private UserEntity user;
    private UserDto userDto;

    @BeforeEach
    void setUp() {
        user = UserEntity.builder()
                .id(1L)
                .username("testuser")
                .password("encoded_old_pass")
                .role(Role.EMPLOYEE)
                .build();

        userDto = UserDto.builder()
                .id(1L)
                .username("testuser")
                .build();
    }

    /**
     * Tests retrieving a list of all users.
     */
    @Test
    void findAllUsers_ReturnsList() {
        when(userRepository.findAll()).thenReturn(List.of(user));
        when(userMapper.mapTo(user)).thenReturn(userDto);

        List<UserDto> result = userService.findAllUsers();

        assertEquals(1, result.size());
        assertEquals("testuser", result.get(0).getUsername());
    }

    /**
     * Tests a successful password change.
     * Verifies that the new password is encoded and the user is saved.
     */
    @Test
    void changePassword_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("oldPass", "encoded_old_pass")).thenReturn(true);
        when(passwordEncoder.encode("newPass")).thenReturn("encoded_new_pass");

        userService.changePassword("testuser", "oldPass", "newPass");

        verify(userRepository, times(1)).save(user);
        assertEquals("encoded_new_pass", user.getPassword());
    }

    /**
     * Tests that an exception is thrown when the user provides an incorrect old password.
     */
    @Test
    void changePassword_FailsWhenOldPasswordMismatch() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongPass", "encoded_old_pass")).thenReturn(false);

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                userService.changePassword("testuser", "wrongPass", "newPass")
        );

        assertEquals("Old password does not match", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    /**
     * Tests a successful username change.
     * Verifies the timestamp is updated correctly.
     */
    @Test
    void changeUsername_Success() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());

        userService.changeUsername("testuser", "newuser");

        verify(userRepository, times(1)).save(user);
        assertEquals("newuser", user.getUsername());
        assertNotNull(user.getLastUsernameChangeDate());
    }

    /**
     * Tests the cooldown period for username changes.
     * Verifies an exception is thrown if the user attempts to change their username before 30 days have passed.
     */
    @Test
    void changeUsername_FailsIfChangedRecently() {
        user.setLastUsernameChangeDate(LocalDateTime.now().minusDays(10)); // Changed 10 days ago
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                userService.changeUsername("testuser", "newuser")
        );

        assertTrue(exception.getMessage().contains("You can change your username again in"));
        verify(userRepository, never()).save(any());
    }
}