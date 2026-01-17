package org.example.controller;

import org.example.model.UserAdminList;
import org.example.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping(value="/users")
    public ResponseEntity<List<UserAdminList>> getAllUsers() {
        return ResponseEntity.status(HttpStatus.OK).body(userService.getAllUsers());
    }

    @PutMapping(value = "/users/{id}/status")
    public ResponseEntity<String> updateStatus(@PathVariable String id, @RequestParam boolean active) {
        String msg = userService.updateStatus(id, active);
        return ResponseEntity.status(HttpStatus.OK).body(msg);
    }
}

