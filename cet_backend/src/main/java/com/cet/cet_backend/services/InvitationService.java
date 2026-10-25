package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.CreateInvitationRequest;
import com.cet.cet_backend.domain.entities.UserInvitationEntity;

/**
 * Interface defining operations for user invitations.
 */
public interface InvitationService {

     UserInvitationEntity createInvitation(CreateInvitationRequest createInvitationRequest);
}