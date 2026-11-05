package com.cet.cet_backend.repository;

import com.cet.cet_backend.domain.entities.UserPreferencesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for managing UserPreferencesEntity data.
 */
@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferencesEntity, Long> {

    /**
     * Retrieves user preferences based on the user's ID.
     *
     * @param userId The ID of the user.
     * @return An Optional containing the UserPreferencesEntity if found.
     */
    Optional<UserPreferencesEntity> findByUserId(Long userId);
}