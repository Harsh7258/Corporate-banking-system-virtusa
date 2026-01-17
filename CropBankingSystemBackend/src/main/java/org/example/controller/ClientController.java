package org.example.controller;

import jakarta.validation.Valid;
import org.example.model.client.ClientOn;
import org.example.model.client.ClientRequest;
import org.example.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rm/clients")
@PreAuthorize("hasRole('RELATIONSHIP_MANAGER')")
public class ClientController {
    @Autowired
    private ClientService clientService;

    @GetMapping(value = "/")
    public ResponseEntity<List<ClientOn>> getAllClients(Authentication auth) {
        List<ClientOn> clients = clientService.getMyClients(auth);
        return ResponseEntity.status(HttpStatus.OK).body(clients);
    }

    @PostMapping(value = "/")
    public ResponseEntity<String> createClient(@Valid @RequestBody ClientRequest clientRequest, Authentication auth) {
        String msg = clientService.addClient(clientRequest,auth);
        return ResponseEntity.status(HttpStatus.CREATED).body(msg);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<ClientOn> getClientById(@PathVariable String id, Authentication auth) {
        ClientOn client = clientService.getClientById(id, auth);
        return ResponseEntity.status(HttpStatus.OK).body(client);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<String> updateClient(@PathVariable String id, @Valid @RequestBody ClientRequest clientRequest, Authentication auth) {
        String msg = clientService.updateClient(id, clientRequest, auth);

        return ResponseEntity.status(HttpStatus.OK).body(msg);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClientOn>> searchClients(@RequestParam(required = false) String companyName,
            @RequestParam(required = false) String industry, Authentication authentication) {

        List<ClientOn> clients = clientService.searchClients(companyName, industry, authentication);
        return ResponseEntity.status(HttpStatus.OK).body(clients);
    }

    @GetMapping("/industries")
    public ResponseEntity<List<String>> getIndustries(Authentication authentication) {
        List<String> industries = clientService.getIndustriesDistinct(authentication);
        return ResponseEntity.status(HttpStatus.OK).body(industries);
    }
}
