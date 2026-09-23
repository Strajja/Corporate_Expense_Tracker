package com.cet.cet_worker.dto

data class InvitationEmailEvent (

    val emailAddress: String = "",
    val firstName: String = "",
    val invitationCode: String = ""
)