package com.uni.pm.config;

import com.uni.pm.model.Role;
import com.uni.pm.model.User;
import com.uni.pm.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setEmail("admin@example.com");
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
                System.out.println("Admin-User erstellt: admin / admin123");
            }
        };
    }
}
