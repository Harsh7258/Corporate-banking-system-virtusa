package org.example.kafka.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.model.credit.CreditStatus;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditEvent {
    private String eventType; // "CREATED" or "STATUS_UPDATED"
    private String rmId;
    private String clientId;
    private String clientName;
    private Double amount;
    private CreditStatus status;
    private String previousStatus;
    private String actionBy;
    private String comments;
    private LocalDateTime timestamp;
}
