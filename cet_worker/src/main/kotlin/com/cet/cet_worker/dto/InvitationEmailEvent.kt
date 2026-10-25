package com.cet.cet_worker.dto

/**
 * Data transfer object representing an invitation email event triggered for new user registrations.
 */
data class InvitationEmailEvent (
    val emailAddress: String = "",
    val firstName: String = "",
    val invitationCode: String = ""
)