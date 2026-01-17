package org.example.service;

import org.example.exception.EmailAlreadyExistsException;
import org.example.exception.NotActiveException;
import org.example.model.LoginResponse;
import org.example.model.Role;
import org.example.model.User;
import org.example.model.UserLogin;
import org.example.repository.UserRepository;
import org.example.security.CustomUserDetails;
import org.example.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;
import static org.springframework.test.util.AssertionErrors.assertEquals;


@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private Authentication authentication;

    @Mock
    private CustomUserDetails customUserDetails;

    @Test
    void login_success() {

        UserLogin req = new UserLogin();
        req.setEmail("test@gmail.com");
        req.setPassword("12345");

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        when(authentication.getPrincipal()).thenReturn(customUserDetails);
        when(customUserDetails.isEnabled()).thenReturn(true);
        when(customUserDetails.getRole()).thenReturn(Role.ADMIN);

        when(jwtService.generateToken(customUserDetails)).thenReturn("jwt-token");

        LoginResponse response = authService.login(req);

        assertEquals("jwt-token", response.token(), "jwt-token");
        assertEquals("ADMIN", response.role(), "ADMIN");
    }


    @Test
    void login_userNotActive() {
        User user = new User();
        user.setActive(false);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        when(authenticationManager.authenticate(any()))
                .thenReturn(authentication);

        assertThrows(NotActiveException.class,
                () -> authService.login(new UserLogin()));
    }

    @Test
    void register_success() {
        User user = new User();
        user.setEmail("new@gmail.com");
        user.setPassword("123");

        when(userRepository.findUserByEmail("new@gmail.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("123")).thenReturn("encoded");

        String result = authService.register(user);

        verify(userRepository).save(user);
        assertTrue(result.contains("Created successfully"));
    }

    @Test
    void register_emailAlreadyExists() {
        User user = new User();
        user.setEmail("test@gmail.com");

        when(userRepository.findUserByEmail("test@gmail.com"))
                .thenReturn(Optional.of(new User()));

        assertThrows(EmailAlreadyExistsException.class,
                () -> authService.register(user));
    }
}

