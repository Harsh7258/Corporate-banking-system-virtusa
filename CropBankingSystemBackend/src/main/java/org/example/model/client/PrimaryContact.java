package org.example.model.client;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrimaryContact {

    // Email and phone must follow basic patterns.
    @NotBlank(message = "Contact name is required")
    private String name;

    @NotBlank(message = "Contact email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Contact phone is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phone;
}


