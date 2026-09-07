package com.cet.cet_backend.repository;

import com.cet.cet_backend.domain.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<Object> findByEmailAddress(String emailAddress);

    Optional<UserEntity> findByUsername(String username);
}
