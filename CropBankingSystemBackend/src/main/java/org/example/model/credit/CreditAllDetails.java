package org.example.model.credit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditAllDetails {
    private String id;

    private String clientId;
    private String clientName;

    private String submittedBy;
    private String rmName;

    private Double requestAmount;
    private Integer tenureMonths;
    private String purpose;
    private CreditStatus status;
    private String remarks;
    private Instant createdAt;
}
