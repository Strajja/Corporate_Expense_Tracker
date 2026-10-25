package com.cet.cet_backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event payload dispatched to RabbitMQ for sending invitation emails via worker.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvitationEmailEvent {

    private String emailAddress;

    private String firstName;

    private String invitationCode;
}