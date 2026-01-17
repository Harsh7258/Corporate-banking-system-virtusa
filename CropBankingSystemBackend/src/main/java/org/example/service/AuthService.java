package org.example.service;

import org.example.exception.EmailAlreadyExistsException;
import org.example.exception.NotActiveException;
import org.example.model.LoginResponse;
import org.example.model.User;
import org.example.model.UserLogin;
import org.example.repository.UserRepository;
import org.example.security.CustomUserDetails;
import org.example.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public LoginResponse login(UserLogin req) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        CustomUserDetails cud = (CustomUserDetails) authentication.getPrincipal();

        assert cud != null;
        if (!cud.isEnabled()) {
            throw new NotActiveException("Your account is not active. Please contact admin.");
        }

        String token = jwtService.generateToken(cud);
        String role = cud.getRole().name();

        return new LoginResponse(token, role);
    }

    // ADMIN only
    public String register(User user) {
        if (userRepository.findUserByEmail(user.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setActive(true);

        userRepository.save(user);
        return "Created successfully, Role: " + user.getRole();
    }
}
