package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.UserDto;
import com.cet.cet_backend.domain.entities.UserEntity;

import java.util.List;


public interface UserService {

    UserDto registerUser(UserDto userDto);

    List<UserDto> findAllUsers();

}
