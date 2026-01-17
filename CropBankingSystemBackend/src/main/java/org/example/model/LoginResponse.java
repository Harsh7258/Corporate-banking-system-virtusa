package org.example.model;

// @desc special class for DTOs gives all functions without boiler plate
public record LoginResponse(String token, String role) {
}
