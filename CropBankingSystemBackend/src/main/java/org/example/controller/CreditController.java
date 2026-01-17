package org.example.controller;

import jakarta.validation.Valid;
import org.example.model.credit.Credit;
import org.example.model.credit.CreditAllDetails;
import org.example.model.credit.CreditDecision;
import org.example.model.credit.CreditRequest;
import org.example.security.CustomUserDetails;
import org.example.service.CreditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/credit-requests")
public class CreditController {
    @Autowired
    private CreditService creditService;

    @PostMapping(value = "/")
    @PreAuthorize("hasRole('RELATIONSHIP_MANAGER')")
    public ResponseEntity<String> createCredit(@Valid @RequestBody CreditRequest request,
                                       Authentication authentication) {
        CustomUserDetails user =  (CustomUserDetails) authentication.getPrincipal();
        assert user != null;
        String msg = creditService.createCredit(request, user.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(msg);
    }

    @GetMapping(value = "/")
    @PreAuthorize("hasAnyRole('RELATIONSHIP_MANAGER','ANALYST')")
    public ResponseEntity<List<CreditAllDetails>> getCredits(Authentication authentication) {
        CustomUserDetails user =  (CustomUserDetails) authentication.getPrincipal();
        boolean isAnalyst = authentication.getAuthorities()
                .stream().anyMatch(a ->
                        a.getAuthority().equals("ROLE_ANALYST"));

        assert user != null;
        List<CreditAllDetails> credits = creditService.getCredits(user.getId(), isAnalyst);

        return ResponseEntity.status(HttpStatus.OK).body(credits);
    }

    @GetMapping(value = "/{id}")
    @PreAuthorize("hasAnyRole('RELATIONSHIP_MANAGER','ANALYST')")
    public ResponseEntity<Credit> getCreditById(@PathVariable String id) {
        Credit credit = creditService.getCreditById(id);
        return ResponseEntity.status(HttpStatus.OK).body(credit);
    }

    @PutMapping(value = "/{id}")
    @PreAuthorize("hasRole('ANALYST')")
    public ResponseEntity<String> updateCreditDecision(@PathVariable String id, @Valid @RequestBody CreditDecision decision) {
        String msg = creditService.updateCreditDecision(id, decision);
        return ResponseEntity.status(HttpStatus.OK).body(msg);
    }
}
