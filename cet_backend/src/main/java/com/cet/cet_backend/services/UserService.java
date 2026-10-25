package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.UserDto;

import java.util.List;

/**
 * Interface defining operations for managing users within the system.
 */
public interface UserService {

    UserDto registerUser(UserDto userDto);

    List<UserDto> findAllUsers();

    void changePassword(String username, String oldPassword, String newPassword);

    void changeUsername(String currentUsername, String newUsername);

    UserDto updateUserByAdmin(Long userId, UserDto userDto);

    List<UserDto> findTeamMembers(String managerUsername);

    List<UserDto> findUnassignedEmployees();

    void assignManagerToEmployee(Long employeeId, String managerUsername);

    void unassignEmployee(Long employeeId);

    void deleteUser(Long userId);
}