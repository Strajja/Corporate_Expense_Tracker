package com.cet.cet_backend.repository;

import com.cet.cet_backend.domain.entities.UserInvitationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Repository interface for performing database operations on User Invitation entities.
 */
public interface UserInvitationRepository extends JpaRepository<UserInvitationEntity, Long> {

    /**
     * Finds a user invitation by its unique registration code.
     */
    Optional<UserInvitationEntity> findByCode(String code);
}