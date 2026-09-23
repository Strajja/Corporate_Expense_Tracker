package com.cet.cet_backend.repository;

import com.cet.cet_backend.domain.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByEmailAddress(String emailAddress);

    List<UserEntity> findByManagerId(Long managerId);
}
