package org.example.kafka.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.model.Role;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEvent {
    private String eventType;
    private String userId;
    private String username;
    private Role role;
    private Boolean previousStatus;
    private String email;
    private LocalDateTime timestamp;
}
