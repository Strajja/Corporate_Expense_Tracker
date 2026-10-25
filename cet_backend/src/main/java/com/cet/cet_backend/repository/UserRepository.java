package com.cet.cet_backend.repository;

import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for performing database operations on User entities.
 */
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    /**
     * Finds a user by their unique username.
     */
    Optional<UserEntity> findByUsername(String username);

    /**
     * Finds a user by their unique email address.
     */
    Optional<UserEntity> findByEmailAddress(String emailAddress);

    /**
     * Retrieves all users managed by a specific manager ID.
     */
    List<UserEntity> findAllByManagerId(Long managerId);

    /**
     * Retrieves a list of users holding a specific role who are not assigned to any manager.
     */
    List<UserEntity> findByRoleAndManagerIdIsNull(Role role);
}