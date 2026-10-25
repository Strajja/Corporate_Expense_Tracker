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

/**
 * Controller managing user accounts, team assignments, and system invitations.
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping(path = "/users")
public class UserController {

    private final UserService userService;
    private final InvitationService invitationService;

    public UserController(UserService userService, InvitationService invitationService) {
        this.userService = userService;
        this.invitationService = invitationService;
    }

    /**
     * Retrieves all users registered in the system.
     *
     * @return ResponseEntity containing a list of UserDto.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers(){
        List<UserDto> users = userService.findAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    /**
     * Retrieves the team members assigned to the currently authenticated manager.
     *
     * @return ResponseEntity containing a list of UserDto representing team members.
     */
    @GetMapping(path = "/team")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<UserDto>> getMyTeam() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        List<UserDto> users = userService.findTeamMembers(authentication.getName());
        return ResponseEntity.ok(users);
    }

    /**
     * Retrieves a list of employees who do not currently have an assigned manager.
     *
     * @return ResponseEntity containing a list of unassigned UserDto.
     */
    @GetMapping(path = "/unassigned")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public ResponseEntity<List<UserDto>> getUnassignedEmployees() {
        List<UserDto> users = userService.findUnassignedEmployees();
        return ResponseEntity.ok(users);
    }

    /**
     * Assigns an employee to the currently authenticated manager's team.
     *
     * @param employeeId The ID of the employee to assign.
     * @return ResponseEntity with a success message.
     */
    @PatchMapping(path = "/{id}/assign")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<String> assignEmployee(@PathVariable("id") Long employeeId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        userService.assignManagerToEmployee(employeeId, authentication.getName());
        return ResponseEntity.ok("Employee successfully assigned to your team.");
    }

    /**
     * Removes an employee from their current manager's team.
     *
     * @param employeeId The ID of the employee to unassign.
     * @return ResponseEntity with a success message.
     */
    @PatchMapping(path = "/{id}/unassign")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<String> unassignEmployee(@PathVariable("id") Long employeeId) {
        userService.unassignEmployee(employeeId);
        return ResponseEntity.ok("Employee removed from team.");
    }

    /**
     * Deletes a user account from the system.
     *
     * @param userId The ID of the user to delete.
     * @return ResponseEntity with no content.
     */
    @DeleteMapping(path = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteUser(@PathVariable("id") Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Updates the password for the currently authenticated user.
     *
     * @param oldPassword The user's current password.
     * @param newPassword The requested new password.
     * @return ResponseEntity with a success message.
     */
    @PatchMapping(path="/me/password")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<String> changePassword(
            @RequestParam("oldPassword") String oldPassword,
            @RequestParam("newPassword") String newPassword) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();

        userService.changePassword(currentUsername, oldPassword, newPassword);
        return ResponseEntity.ok("Password successfully updated.");
    }

    /**
     * Updates the username for the currently authenticated user.
     * Subject to a 30-day cooldown period.
     *
     * @param body Map containing the 'newUsername'.
     * @return ResponseEntity with a success message.
     */
    @PatchMapping(path="/me/username")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN')")
    public ResponseEntity<String> changeUsername(@RequestBody java.util.Map<String, String> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        String newUsername = body.get("newUsername");

        if (newUsername == null || newUsername.trim().isEmpty()) {
            throw new IllegalArgumentException("New username cannot be empty.");
        }

        userService.changeUsername(currentUsername, newUsername);
        return ResponseEntity.ok("Username successfully updated.");
    }

    /**
     * Allows an administrator to directly update user details.
     *
     * @param userId  The ID of the user to update.
     * @param userDto DTO containing updated user information.
     * @return ResponseEntity with the updated UserDto.
     */
    @PutMapping(path="/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUserByAdmin(
            @PathVariable("id") Long userId,
            @Valid @RequestBody UserDto userDto) {

        UserDto updatedUser = userService.updateUserByAdmin(userId, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Generates a new invitation code and initiates the email delivery process.
     *
     * @param invitationRequest DTO containing invitee details.
     * @return ResponseEntity with a success message.
     */
    @PostMapping(path="/invite")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<String> inviteUser(@Valid @RequestBody CreateInvitationRequest invitationRequest) {
        invitationService.createInvitation(invitationRequest);
        return new ResponseEntity<>("Invitation successfully created and sent.", HttpStatus.CREATED);
    }
}