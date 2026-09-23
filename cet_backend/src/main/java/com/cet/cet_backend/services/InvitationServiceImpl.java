package com.cet.cet_backend.services;

import com.cet.cet_backend.config.RabbitMQConfig;
import com.cet.cet_backend.domain.dto.CreateInvitationRequest;
import com.cet.cet_backend.domain.dto.InvitationEmailEvent;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.domain.entities.UserInvitationEntity;
import com.cet.cet_backend.repository.UserInvitationRepository;
import com.cet.cet_backend.repository.UserRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class InvitationServiceImpl implements InvitationService {

    private final UserInvitationRepository invitationRepository;

    private final UserRepository userRepository;

    private final RabbitTemplate rabbitTemplate;

    public InvitationServiceImpl(UserInvitationRepository invitationRepository,  UserRepository userRepository,  RabbitTemplate rabbitTemplate) {
        this.invitationRepository = invitationRepository;
        this.userRepository = userRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    public UserInvitationEntity createInvitation(CreateInvitationRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        UserEntity currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(()->new RuntimeException("User not found"));

        if(currentUser.getRole()== Role.MANAGER && request.getRole() != Role.EMPLOYEE){
            throw new RuntimeException("Manager can just send invitation for employees");
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
                .expirationDate(expiration)
                .build();

        InvitationEmailEvent event =InvitationEmailEvent
                .builder()
                .emailAdress(request.getEmailAddress())
                .firstName(request.getFirstName())
                .invitationCode(uniqueCode)
                .build();

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EMAIL_QUEUE,
                RabbitMQConfig.EMAIL_ROUTING_KEY,
                event
        );

        invitationRepository.save(invitation);

        System.out.println("Generisan kod za radnika: " + uniqueCode);

        return invitation;
    }
}