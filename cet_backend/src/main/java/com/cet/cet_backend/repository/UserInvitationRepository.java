package com.cet.cet_backend.repository;

import com.cet.cet_backend.domain.entities.UserInvitationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserInvitationRepository extends JpaRepository<UserInvitationEntity,Long> {

    Optional<UserInvitationEntity> findByCode(String code);
}
