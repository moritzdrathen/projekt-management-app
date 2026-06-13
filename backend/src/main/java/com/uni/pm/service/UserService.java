package com.uni.pm.service;

import com.uni.pm.dto.CreateUserRequest;
import com.uni.pm.dto.UserDto;
import com.uni.pm.model.Role;
import com.uni.pm.model.User;
import com.uni.pm.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public UserDto createUser(CreateUserRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setRole(Role.valueOf(request.getRole()));
        return toDto(userRepository.save(user));
    }

    public UserDto updateUser(Long id, CreateUserRequest request) {
        User user = userRepository.findById(id).orElseThrow();
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getRole() != null) user.setRole(Role.valueOf(request.getRole()));
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return toDto(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public User getByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow();
    }

    public UserDto toDto(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole().name());
    }
}
