package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.CreateInvitationRequest;
import com.cet.cet_backend.domain.entities.UserInvitationEntity;

/**
 * Interface defining operations for user invitations.
 */
public interface InvitationService {

     /*
      * =====================================================================================
      * ORIGINAL PRODUCTION METHOD
      * =====================================================================================
      * This code was used previously for the production environment.
      * It returns the full UserInvitationEntity.
      *
      * UserInvitationEntity createInvitation(CreateInvitationRequest createInvitationRequest);
      * =====================================================================================
      */

     /**
      * DEMO MODE METHOD
      * Returns the generated invitation code directly as a String.
      * This modification allows recruiters, evaluators, and public testers to easily
      * retrieve the code directly from the frontend modal without needing access
      * to an actual email inbox.
      */
     String createInvitation(CreateInvitationRequest createInvitationRequest);
}