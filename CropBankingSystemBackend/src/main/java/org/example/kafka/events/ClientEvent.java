package org.example.kafka.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientEvent {
    private String eventType;
    private String clientId;
    private String clientName;
    private String industry;
    private String onboardedBy;
    private LocalDateTime timestamp;
}