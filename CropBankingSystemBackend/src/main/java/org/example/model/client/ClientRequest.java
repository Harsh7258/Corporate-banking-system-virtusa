package org.example.model.client;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientRequest {
    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name must not exceed 150 characters")
    private String companyName;

    @NotBlank(message = "Industry is required")
    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String industry;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Valid
    @NotNull(message = "Primary contact details are required")
    private PrimaryContact primaryContact;

    @NotNull(message = "Annual turnover is required")
    @PositiveOrZero(message = "Annual turnover must be greater than zero")
    private Double annualTurnover;

    @NotNull(message = "Document submission status is required")
    private Boolean documentsSubmitted;
}
