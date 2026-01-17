package org.example.model;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder // build pattern
public class User {
    @Id
    private String id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be 3–30 characters")
    @Indexed(unique = true)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    private Boolean active;
}
