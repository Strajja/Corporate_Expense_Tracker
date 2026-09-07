package com.cet.cet_backend.controllers;

import com.cet.cet_backend.domain.dto.UserDto;
import com.cet.cet_backend.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UserController {

    private final UserService userService;



    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping(path="/users/register")
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody UserDto userDto){

        UserDto createdUser= userService.registerUser(userDto);

        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);

    }

    @GetMapping(path="/users")
    public  ResponseEntity<List<UserDto>> getAllUsers(){

        List <UserDto> users = userService.findAllUsers();

        return new ResponseEntity<>(users, HttpStatus.OK);
    }

}