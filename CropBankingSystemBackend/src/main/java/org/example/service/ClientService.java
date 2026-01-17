package org.example.service;

import org.example.exception.ClientNotFoundException;
import org.example.exception.UnauthAccessDeniedException;
import org.example.kafka.events.ClientEvent;
import org.example.kafka.producer.KafkaEventProducer;
import org.example.model.client.ClientOn;
import org.example.model.client.ClientRequest;
import org.example.repository.ClientRepository;
import org.example.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClientService {
    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private KafkaEventProducer kafkaEventProducer;

    // @desc rmId = MongoDB User _id, no db hit just getting it from JWT (scaled)
    // @func helper method, use customUserDetails
    private String getRmId(Authentication authentication) {
        CustomUserDetails cud = (CustomUserDetails) authentication.getPrincipal();
        return cud.getUser().getId();
    }

    public String addClient(ClientRequest request, Authentication authentication) {
        String rmId = getRmId(authentication);

        ClientOn client = ClientOn.builder()
                .companyName(request.getCompanyName())
                .industry(request.getIndustry())
                .address(request.getAddress())
                .primaryContact(request.getPrimaryContact())
                .annualTurnover(request.getAnnualTurnover())
                .documentsSubmitted(request.getDocumentsSubmitted())
                .rmId(rmId)
                .build();

        clientRepository.save(client);

        ClientEvent event = ClientEvent.builder()
                .eventType("CLIENT_CREATED")
                .clientId(client.getId())
                .clientName(client.getCompanyName())
                .industry(client.getIndustry())
                .onboardedBy(client.getRmId())
                .timestamp(LocalDateTime.now())
                .build();

        kafkaEventProducer.publishClientEvent(event);

        return "Client Created successfully";
    }

    public List<ClientOn> getMyClients(Authentication authentication) {
        String rmId = getRmId(authentication);
        return clientRepository.findByRmId(rmId);
    }

    public ClientOn getClientById(String clientId, Authentication authentication) {
        String rmId = getRmId(authentication);

        ClientOn client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ClientNotFoundException("Client not found: " + clientId));

        if (!client.getRmId().equals(rmId)) {
            throw new UnauthAccessDeniedException("You are not allowed to update this client");
        }

        return client;
    }

    public String updateClient(String clientId, ClientRequest request, Authentication authentication) {
        String rmId = getRmId(authentication);

        ClientOn client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ClientNotFoundException("Client not found with: "+clientId));

        if (!client.getRmId().equals(rmId)) {
            throw new UnauthAccessDeniedException("You are not allowed to update this client");
        }

        client.setCompanyName(request.getCompanyName());
        client.setIndustry(request.getIndustry());
        client.setAddress(request.getAddress());
        client.setPrimaryContact(request.getPrimaryContact());
        client.setAnnualTurnover(request.getAnnualTurnover());
        client.setDocumentsSubmitted(request.getDocumentsSubmitted());

        clientRepository.save(client);
        return "Updated Client successfully";
    }

    public List<ClientOn> searchClients(String companyName, String industry, Authentication authentication) {
        String rmId = getRmId(authentication);

        if (companyName != null && !companyName.isBlank()) {
            return clientRepository.findByRmIdAndCompanyNameContainingIgnoreCase(rmId, companyName);
        }
        if (industry != null && !industry.isBlank()) {
            return clientRepository.findByRmIdAndIndustryIgnoreCase(rmId, industry);
        }

        return clientRepository.findByRmId(rmId);
    }

    public List<String> getIndustriesDistinct(Authentication authentication) {
        String rmId = getRmId(authentication);

        return clientRepository.findDistinctIndustriesByRmId(rmId);
    }
}
