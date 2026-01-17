package org.example.model.client;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientOn {
    @Id
    private String id;

    @NotBlank(message = "Company name is mandatory")
    private String companyName;

    @NotBlank(message = "Industry is mandatory")
    private String industry;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @NotNull(message = "Primary contact details are required")
    private PrimaryContact primaryContact;

    @NotNull(message = "Annual turnover is required")
    @PositiveOrZero(message = "Annual turnover must be zero or positive")
    private Double annualTurnover;

    @NotNull(message = "Document submission status is required")
    private Boolean documentsSubmitted;

    @NotNull(message = "RM ID must be present (auto-assigned)")
    private String rmId; //Auto-populated from JWT
}
