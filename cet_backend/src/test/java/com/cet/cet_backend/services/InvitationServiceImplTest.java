package com.cet.cet_backend.services;

import com.cet.cet_backend.config.RabbitMQConfig;
import com.cet.cet_backend.domain.dto.CreateInvitationRequest;
import com.cet.cet_backend.domain.dto.InvitationEmailEvent;
import com.cet.cet_backend.domain.entities.Role;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.domain.entities.UserInvitationEntity;
import com.cet.cet_backend.repository.UserInvitationRepository;
import com.cet.cet_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for the InvitationServiceImpl class.
 * Verifies invitation generation and RabbitMQ event dispatching.
 */
@ExtendWith(MockitoExtension.class)
public class InvitationServiceImplTest {

    @Mock
    private UserInvitationRepository invitationRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private InvitationServiceImpl invitationService;

    private UserEntity manager;
    private CreateInvitationRequest request;

    @BeforeEach
    void setUp() {
        manager = UserEntity.builder()
                .id(1L)
                .username("manager")
                .role(Role.MANAGER)
                .build();

        request = CreateInvitationRequest.builder()
                .firstName("Jane")
                .lastName("Doe")
                .emailAddress("jane@cet.com")
                .dateOfBirth(LocalDate.of(1995, 5, 5))
                .hireDate(LocalDate.now())
                .role(Role.EMPLOYEE)
                .build();
    }

    /**
     * Tests successful creation of an invitation.
     * Verifies that the invitation is saved in the database and an event is sent to RabbitMQ.
     */
    @Test
    void createInvitation_Success() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("manager", "pass")
        );

        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(manager));
        when(invitationRepository.save(any(UserInvitationEntity.class))).thenAnswer(i -> i.getArguments()[0]);

        UserInvitationEntity result = invitationService.createInvitation(request);

        assertNotNull(result);
        assertNotNull(result.getCode());
        assertEquals("jane@cet.com", result.getEmailAddress());
        assertEquals(manager.getId(), result.getManagerId());

        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConfig.EMAIL_EXCHANGE),
                eq(RabbitMQConfig.EMAIL_ROUTING_KEY),
                any(InvitationEmailEvent.class)
        );
    }

    /**
     * Tests role-based restriction preventing a manager from inviting another manager.
     */
    @Test
    void createInvitation_FailsWhenManagerInvitesManager() {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("manager", "pass")
        );

        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(manager));

        request.setRole(Role.MANAGER); // Manager trying to invite another manager

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                invitationService.createInvitation(request)
        );

        assertEquals("Managers can only send invitations for employees", exception.getMessage());
        verify(invitationRepository, never()).save(any());
        verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any(Object.class));
    }
}