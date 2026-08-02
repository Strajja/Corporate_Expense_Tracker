package com.cet.cet_backend.services;

import com.cet.cet_backend.domain.dto.UserDto;
import com.cet.cet_backend.domain.entities.UserEntity;
import com.cet.cet_backend.mappers.Mapper;
import com.cet.cet_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final Mapper<UserEntity, UserDto> userMapper;

    public UserServiceImpl(UserRepository userRepository, Mapper<UserEntity, UserDto> userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Override
    public UserDto registerUser(UserDto userDto) {
        if(userRepository.findByEmailAddress(userDto.getEmailAddress()).isPresent()){
            throw new RuntimeException("Korisnik vec postoji");
        }

        UserEntity userEntity = userMapper.mapFrom(userDto);

        UserEntity savedUserEntity = userRepository.save(userEntity);

        return userMapper.mapTo(savedUserEntity);
    }

    @Override
    public List<UserDto> findAllUsers() {

        return userRepository
                .findAll()
                .stream()
                .map(userMapper::mapTo)
                .collect(Collectors.toList());

    }
}