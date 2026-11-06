package com.cet.cet_backend.services;

import com.cet.cet_backend.config.RabbitMQConfig;
import com.cet.cet_backend.domain.dto.CreateInvitationRequest;
import com.cet.cet_backend.domain.dto.InvitationEmailEvent;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.domain.entities.UserInvitationEntity;
import com.cet.cet_backend.repository.UserInvitationRepository;
import com.cet.cet_backend.repository.UserRepository;
import lombok.extern.java.Log;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Implementation of InvitationService, managing the generation of invitations and dispatching email events via RabbitMQ.
 */
@Service
@Log
public class InvitationServiceImpl implements InvitationService {

    private final UserInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate;

    public InvitationServiceImpl(UserInvitationRepository invitationRepository, UserRepository userRepository, RabbitTemplate rabbitTemplate) {
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    /*
     * =====================================================================================
     * ORIGINAL PRODUCTION METHOD
     * =====================================================================================
     * This code was used previously for the production environment.
     * It returns the UserInvitationEntity and relies entirely on RabbitMQ and an SMTP
     * worker to deliver the code securely via email.
     *
     * @Override
     * public UserInvitationEntity createInvitation(CreateInvitationRequest request) {
     *     Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
     *     String currentUsername = authentication.getName();
     *
     *     UserEntity currentUser = userRepository.findByUsername(currentUsername)
     *             .orElseThrow(() -> new RuntimeException("User not found"));
     *
     *     if (currentUser.getRole() == Role.MANAGER && request.getRole() != Role.EMPLOYEE) {
     *         throw new RuntimeException("Managers can only send invitations for employees");
     *     }
     *
     *     String uniqueCode = UUID.randomUUID().toString();
     *     LocalDateTime expiration = LocalDateTime.now().plusDays(1);
     *
     *     UserInvitationEntity invitation = UserInvitationEntity.builder()
     *             .code(uniqueCode)
     *             .firstName(request.getFirstName())
     *             .lastName(request.getLastName())
     *             .emailAddress(request.getEmailAddress())
     *             .dateOfBirth(request.getDateOfBirth())
     *             .hireDate(request.getHireDate())
     *             .role(request.getRole())
     *             .managerId(currentUser.getRole() == Role.MANAGER ? currentUser.getId() : null)
     *             .expirationDate(expiration)
     *             .build();
     *
     *     InvitationEmailEvent event = InvitationEmailEvent.builder()
     *             .emailAddress(request.getEmailAddress())
     *             .firstName(request.getFirstName())
     *             .invitationCode(uniqueCode)
     *             .build();
     *
     *     log.info("Preparing message for RabbitMQ...");
     *     rabbitTemplate.convertAndSend(
     *             RabbitMQConfig.EMAIL_EXCHANGE,
     *             RabbitMQConfig.EMAIL_ROUTING_KEY,
     *             event
     *     );
     *     log.info("Message successfully sent to RabbitMQ!");
     *
     *     invitationRepository.save(invitation);
     *     System.out.println("Generated code for employee: " + uniqueCode);
     *
     *     return invitation;
     * }
     * =====================================================================================
     */

    /**
     * DEMO MODE METHOD
     * Generates a new invitation code and explicitly returns it as a String.
     * This allows recruiters, evaluators, and public testers to easily retrieve the code directly
     * from the frontend modal without needing access to an actual email inbox.
     * The RabbitMQ event is still sent to demonstrate async architecture and messaging capabilities.
     */
    @Override
    public String createInvitation(CreateInvitationRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() == Role.MANAGER && request.getRole() != Role.EMPLOYEE) {
            throw new RuntimeException("Managers can only send invitations for employees");
        }

        String uniqueCode = UUID.randomUUID().toString();
        LocalDateTime expiration = LocalDateTime.now().plusDays(1);

        UserInvitationEntity invitation = UserInvitationEntity.builder()
                .code(uniqueCode)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .emailAddress(request.getEmailAddress())
                .dateOfBirth(request.getDateOfBirth())
                .hireDate(request.getHireDate())
                .role(request.getRole())
                .managerId(currentUser.getRole() == Role.MANAGER ? currentUser.getId() : null)
                .expirationDate(expiration)
                .build();

        InvitationEmailEvent event = InvitationEmailEvent.builder()
                .emailAddress(request.getEmailAddress())
                .firstName(request.getFirstName())
                .invitationCode(uniqueCode)
                .build();

        log.info("Preparing message for RabbitMQ (DEMO MODE)...");
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EMAIL_EXCHANGE,
                RabbitMQConfig.EMAIL_ROUTING_KEY,
                event
        );
        log.info("Message successfully sent to RabbitMQ!");

        invitationRepository.save(invitation);

        // Console logging for demo monitoring
        log.info("DEMO MODE - Generated code for user: " + uniqueCode);

        return uniqueCode;
    }
}