package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.UserDto;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.mappers.Mapper;
import com.cet.cet_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final Mapper<UserEntity, UserDto> userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, Mapper<UserEntity, UserDto> userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDto registerUser(UserDto userDto) {
        UserEntity userEntity = userMapper.mapFrom(userDto);

        userEntity.setPassword(passwordEncoder.encode(userDto.getPassword()));

        if (userEntity.getRole() == null) {
            userEntity.setRole(Role.EMPLOYEE);
        }

        UserEntity savedUser = userRepository.save(userEntity);
        return userMapper.mapTo(savedUser);
    }

    @Override
    public List<UserDto> findAllUsers() {
        return userRepository
                .findAll()
                .stream()
                .map(userMapper::mapTo)
                .collect(Collectors.toList());
    }

    @Override
    public void changePassword(String username, String oldPassword, String newPassword) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password does not match");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public UserDto updateUserByAdmin(Long userId, UserDto userDto) {
        UserEntity existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserEntity updates = userMapper.mapFrom(userDto);

        if (updates.getFirstName() != null) existingUser.setFirstName(updates.getFirstName());
        if (updates.getLastName() != null) existingUser.setLastName(updates.getLastName());
        if (updates.getEmailAddress() != null) existingUser.setEmailAddress(updates.getEmailAddress());
        if (updates.getUsername() != null) existingUser.setUsername(updates.getUsername());
        if (updates.getRole() != null) existingUser.setRole(updates.getRole());
        if (updates.getManagerId() != null) existingUser.setManagerId(updates.getManagerId());

        if (userDto.getPassword() != null && !userDto.getPassword().trim().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        UserEntity savedUser = userRepository.save(existingUser);
        return userMapper.mapTo(savedUser);
    }
}