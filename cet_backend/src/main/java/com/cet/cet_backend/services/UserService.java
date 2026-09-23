package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.UserDto;

import java.util.List;

public interface UserService {

    UserDto registerUser(UserDto userDto);

    List<UserDto> findAllUsers();

    void changePassword(String username, String oldPassword, String newPassword);

    UserDto updateUserByAdmin(Long userId, UserDto userDto);
}