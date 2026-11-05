package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.UserDto;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.domain.entities.UserPreferencesEntity;
import com.cet.cet_backend.mappers.Mapper;
import com.cet.cet_backend.repository.UserPreferencesRepository;
import com.cet.cet_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of UserService, handling business logic for user management, account updates, and team assignments.
 */
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final Mapper<UserEntity, UserDto> userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, UserPreferencesRepository userPreferencesRepository, Mapper<UserEntity, UserDto> userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userPreferencesRepository = userPreferencesRepository;
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

        UserPreferencesEntity preferences = new UserPreferencesEntity(savedUser);
        userPreferencesRepository.save(preferences);

        UserDto resultDto = userMapper.mapTo(savedUser);
        resultDto.setLanguage(preferences.getLanguage());
        return resultDto;
    }

    @Override
    public List<UserDto> findAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> {
                    UserDto dto = userMapper.mapTo(user);
                    if (user.getPreferences() != null) {
                        dto.setLanguage(user.getPreferences().getLanguage());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void changePassword(String username, String oldPassword, String newPassword) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Old password does not match");
        }

        if (oldPassword.equals(newPassword)) {
            throw new RuntimeException("New password cannot be the same as the old password.");
        }

        String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        if (!newPassword.matches(regex)) {
            throw new RuntimeException("Password must contain at least 8 characters, an uppercase letter, a number, and a special character.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public void changeUsername(String currentUsername, String newUsername) {
        UserEntity user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getUsername().equals(newUsername)) {
            throw new RuntimeException("This is already your username");
        }

        if (userRepository.findByUsername(newUsername).isPresent()) {
            throw new RuntimeException("Username is already taken");
        }

        if (user.getLastUsernameChangeDate() != null) {
            LocalDateTime nextAllowedDate = user.getLastUsernameChangeDate().plusDays(30);
            if (LocalDateTime.now().isBefore(nextAllowedDate)) {
                long daysLeft = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), nextAllowedDate);
                throw new RuntimeException("You can change your username again in " + daysLeft + " days");
            }
        }

        user.setUsername(newUsername);
        user.setLastUsernameChangeDate(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    public void changeLanguage(String username, String language) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserPreferencesEntity preferences = userPreferencesRepository.findByUserId(user.getId())
                .orElse(new UserPreferencesEntity(user));

        preferences.setLanguage(language);
        userPreferencesRepository.save(preferences);
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

        UserDto resultDto = userMapper.mapTo(savedUser);
        if (savedUser.getPreferences() != null) {
            resultDto.setLanguage(savedUser.getPreferences().getLanguage());
        }
        return resultDto;
    }

    @Override
    public List<UserDto> findTeamMembers(String username) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long targetManagerId = (user.getRole() == Role.EMPLOYEE) ? user.getManagerId() : user.getId();

        if (targetManagerId == null) {
            return List.of();
        }

        List<UserEntity> team = new java.util.ArrayList<>(userRepository.findAllByManagerId(targetManagerId));

        userRepository.findById(targetManagerId).ifPresent(manager -> {
            if (team.stream().noneMatch(u -> u.getId().equals(manager.getId()))) {
                team.add(0, manager);
            }
        });

        return team.stream()
                .map(u -> {
                    UserDto dto = userMapper.mapTo(u);
                    if (u.getPreferences() != null) {
                        dto.setLanguage(u.getPreferences().getLanguage());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDto> findUnassignedEmployees() {
        return userRepository.findByRoleAndManagerIdIsNull(Role.EMPLOYEE).stream()
                .map(u -> {
                    UserDto dto = userMapper.mapTo(u);
                    if (u.getPreferences() != null) {
                        dto.setLanguage(u.getPreferences().getLanguage());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public void assignManagerToEmployee(Long employeeId, String managerUsername) {
        UserEntity manager = userRepository.findByUsername(managerUsername)
                .orElseThrow(() -> new RuntimeException("Manager not found"));
        UserEntity employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        employee.setManagerId(manager.getId());
        userRepository.save(employee);
    }

    @Override
    public void unassignEmployee(Long employeeId) {
        UserEntity employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        employee.setManagerId(null);
        userRepository.save(employee);
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }
}