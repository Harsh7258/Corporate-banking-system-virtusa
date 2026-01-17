package org.example.model.credit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreditRequest {
    @NotNull(message = "Client ID is required")
    private String clientId;

    @NotNull(message = "Request amount is required")
    @Positive(message = "Request amount must be greater than 0")
    private Double requestAmount;

    @NotNull(message = "Tenure months is required")
    @Positive(message = "Tenure months must be greater than 0")
    private Integer tenureMonths;

    @NotBlank(message = "Purpose cannot be empty")
    private String purpose;
}
