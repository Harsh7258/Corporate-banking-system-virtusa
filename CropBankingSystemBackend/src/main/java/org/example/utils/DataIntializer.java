package org.example.utils;

import org.example.model.Role;
import org.example.model.User;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataIntializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (userRepository.findUserByEmail("adminOne@gmail.com").isPresent()) {
            return; // Admin already exists
        }

        User admin = User.builder()
                .email("adminOne@gmail.com")
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .active(true)
                .build();

        userRepository.save(admin);

        System.out.println("Default ADMIN user created");
    }
}
