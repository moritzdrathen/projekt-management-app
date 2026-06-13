package com.uni.pm.service;

import com.uni.pm.dto.CreateUserRequest;
import com.uni.pm.model.Role;
import com.uni.pm.model.User;
import com.uni.pm.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    void passwort_wird_gehasht_beim_erstellen() {
        CreateUserRequest request = new CreateUserRequest();
        request.setUsername("newuser");
        request.setPassword("plaintext");
        request.setEmail("new@example.com");
        request.setRole("EMPLOYEE");

        User saved = new User();
        saved.setId(1L);
        saved.setUsername("newuser");
        saved.setPassword("hashed");
        saved.setRole(Role.EMPLOYEE);

        when(passwordEncoder.encode("plaintext")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(saved);

        userService.createUser(request);

        verify(passwordEncoder).encode("plaintext");
        verify(userRepository).save(argThat(u -> u.getPassword().equals("hashed")));
    }

    @Test
    void passwort_bleibt_unveraendert_wenn_leer_bei_update() {
        User existing = new User();
        existing.setId(1L);
        existing.setPassword("altes-hash");
        existing.setRole(Role.EMPLOYEE);

        CreateUserRequest request = new CreateUserRequest();
        request.setPassword("");
        request.setRole("EMPLOYEE");

        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(existing));
        when(userRepository.save(any(User.class))).thenReturn(existing);

        userService.updateUser(1L, request);

        verify(passwordEncoder, never()).encode(any());
        assertThat(existing.getPassword()).isEqualTo("altes-hash");
    }
}
