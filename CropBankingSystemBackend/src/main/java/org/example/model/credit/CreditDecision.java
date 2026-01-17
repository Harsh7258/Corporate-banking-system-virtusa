package org.example.model.credit;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditDecision {
    @NotNull(message = "Status is required")
    private String status; // APPROVED or REJECTED

    @NotBlank(message = "Purpose cannot be empty")
    private String remarks;
}
