package org.example.controller;

import jakarta.validation.Valid;
import org.example.model.LoginResponse;
import org.example.model.User;
import org.example.model.UserLogin;
import org.example.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody UserLogin request) {
        LoginResponse res  = authService.login(request);
        return ResponseEntity.status(HttpStatus.OK).body(res);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> register(@Valid @RequestBody User user) {
        String msg = authService.register(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(msg);
    }
}

