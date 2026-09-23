package com.cet.cet_backend.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InvitationEmailEvent {

    private String emailAdress;

    private String firstName;

    private String invitationCode;

}
