package org.example.model.credit;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "credits")
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Credit {
    @Id
    private String id;

    private String clientId;
    private String submittedBy; // RM userId
    private Double requestAmount;
    private Integer tenureMonths;
    private String purpose;
    private CreditStatus status;
    private String remarks;

    @CreatedDate
    private Instant createdAt;
}
