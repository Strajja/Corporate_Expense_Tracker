package com.cet.cet_backend.controllers;

import com.cet.cet_backend.domain.dto.CreateInvitationRequest;
import com.cet.cet_backend.domain.dto.UserDto;
import com.cet.cet_backend.services.InvitationService;
import com.cet.cet_backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(path = "/users")
public class UserController {

    private final UserService userService;

    private final InvitationService invitationService;

    public UserController(UserService userService,  InvitationService invitationService) {
        this.userService = userService;
        this.invitationService = invitationService;
    }


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers(){

        List <UserDto> users = userService.findAllUsers();

        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @PatchMapping(path="/me/password")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<String> changePassword(
            @RequestParam("oldPassword") String oldPassword,
            @RequestParam("newPassword") String newPassword) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        userService.changePassword(currentUsername, oldPassword, newPassword);
        return ResponseEntity.ok("Password successfully updated");
    }

    @PutMapping(path="/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUserByAdmin(
            @PathVariable("id") Long userId,
            @Valid @RequestBody UserDto userDto) {

        UserDto updatedUser = userService.updateUserByAdmin(userId, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping(path="/invite")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<String> inviteUser(@Valid @RequestBody CreateInvitationRequest invitationRequest) {

        invitationService.createInvitation(invitationRequest);

        return new ResponseEntity<>("Invitation has successful created and send.",HttpStatus.CREATED);

    }
}