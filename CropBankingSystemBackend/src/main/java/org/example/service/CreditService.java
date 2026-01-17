package org.example.service;

import org.example.exception.ClientNotFoundException;
import org.example.exception.CreditNotFoundException;
import org.example.kafka.events.CreditEvent;
import org.example.kafka.producer.KafkaEventProducer;
import org.example.model.client.ClientOn;
import org.example.model.credit.*;
import org.example.repository.ClientRepository;
import org.example.repository.CreditRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CreditService {
        @Autowired
        private CreditRepository creditRepository;

        @Autowired
        private ClientRepository clientRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private KafkaEventProducer kafkaEventProducer;

        public String createCredit(CreditRequest request, String rmUserId) {
                ClientOn client = clientRepository.findByIdAndRmId(request.getClientId(), rmUserId).orElseThrow(
                                () -> new ClientNotFoundException("Client not found: " + request.getClientId()));

                Credit credit = Credit.builder()
                                .clientId(client.getId())
                                .submittedBy(rmUserId)
                                .requestAmount(request.getRequestAmount())
                                .tenureMonths(request.getTenureMonths())
                                .purpose(request.getPurpose())
                                .status(CreditStatus.PENDING)
                                .createdAt(Instant.now())
                                .remarks("")
                                .build();

                creditRepository.save(credit);

                CreditEvent event = CreditEvent.builder()
                                .eventType("CREATED")
                                .clientId(credit.getClientId())
                                .amount(credit.getRequestAmount())
                                .status(credit.getStatus())
                                .actionBy(credit.getSubmittedBy())
                                .timestamp(LocalDateTime.now())
                                .build();

                kafkaEventProducer.publishCreditEvent(event);

                return "Credit created successfully";
        }

        // RM → own, Analyst → all
        public List<CreditAllDetails> getCredits(String userId, boolean isAnalyst) {
                List<Credit> credits = isAnalyst ? creditRepository.findAll()
                                : creditRepository.findBySubmittedBy(userId);

                return credits.stream()
                                .map(credit -> {
                                        CreditAllDetails dto = new CreditAllDetails();

                                        // Credit basic fields
                                        dto.setId(credit.getId());
                                        dto.setClientId(credit.getClientId());
                                        dto.setSubmittedBy(credit.getSubmittedBy());
                                        dto.setRequestAmount(credit.getRequestAmount());
                                        dto.setTenureMonths(credit.getTenureMonths());
                                        dto.setPurpose(credit.getPurpose());
                                        dto.setStatus(CreditStatus.valueOf(String.valueOf(credit.getStatus())));
                                        dto.setRemarks(credit.getRemarks());
                                        dto.setCreatedAt(credit.getCreatedAt());

                                        // Client lookup
                                        clientRepository.findById(credit.getClientId())
                                                        .ifPresent(client -> dto
                                                                        .setClientName(client.getCompanyName()));

                                        // RM lookup
                                        userRepository.findById(credit.getSubmittedBy())
                                                        .ifPresent(rm -> dto.setRmName(rm.getUsername()));

                                        // Return DTO (only return, no chaining)
                                        return dto;
                                })
                                .toList();
        }

        public Credit getCreditById(String id) {
                return creditRepository.findById(id)
                                .orElseThrow(() -> new CreditNotFoundException("Credit request not found: " + id));
        }

        // Analyst updates status
        public String updateCreditDecision(String id, CreditDecision decision) {
                Credit credit = getCreditById(id);

                credit.setStatus(CreditStatus.valueOf(decision.getStatus()));
                credit.setRemarks(decision.getRemarks());

                creditRepository.save(credit);

                CreditEvent event = CreditEvent.builder()
                                .eventType("STATUS_UPDATED")
                                .clientId(credit.getClientId())
                                .previousStatus("PENDING")
                                .status(credit.getStatus())
                                .actionBy(credit.getSubmittedBy())
                                .comments(credit.getRemarks())
                                .timestamp(LocalDateTime.now())
                                .build();

                kafkaEventProducer.publishCreditEvent(event);

                return "Updated credit successfully";
        }
}
