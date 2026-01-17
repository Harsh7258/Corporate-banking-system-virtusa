package org.example.service;

import org.example.exception.CreditNotFoundException;
import org.example.kafka.events.CreditEvent;
import org.example.kafka.producer.KafkaEventProducer;
import org.example.model.Role;
import org.example.model.User;
import org.example.model.client.ClientOn;
import org.example.model.credit.*;
import org.example.repository.ClientRepository;
import org.example.repository.CreditRepository;
import org.example.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CreditServiceTest {

        @Mock
        private CreditRepository creditRepository;

        @Mock
        private ClientRepository clientRepository;

        @Mock
        private UserRepository userRepository;

        @Mock
        private KafkaEventProducer kafkaEventProducer;

        @InjectMocks
        private CreditService creditService;

        private Credit mockCredit;
        private ClientOn mockClient;
        private User mockUser;
        private CreditRequest mockCreditRequest;

        @BeforeEach
        void setUp() {
                // Setup mock client
                mockClient = ClientOn.builder()
                                .id("client-001")
                                .companyName("ABC Corp")
                                .rmId("rm-001")
                                .build();

                // Setup mock user (RM)
                mockUser = User.builder()
                                .id("rm-001")
                                .username("john.doe")
                                .email("john@example.com")
                                .role(Role.RELATIONSHIP_MANAGER)
                                .build();

                // Setup mock credit
                mockCredit = Credit.builder()
                                .id("credit-001")
                                .clientId("client-001")
                                .submittedBy("rm-001")
                                .requestAmount(500000.0)
                                .tenureMonths(12)
                                .purpose("Working Capital")
                                .status(CreditStatus.PENDING)
                                .remarks("")
                                .createdAt(Instant.now())
                                .build();

                // Setup mock credit request
                mockCreditRequest = new CreditRequest();
                mockCreditRequest.setClientId("client-001");
                mockCreditRequest.setRequestAmount(500000.0);
                mockCreditRequest.setTenureMonths(12);
                mockCreditRequest.setPurpose("Working Capital");
        }

        @Test
        @DisplayName("Should successfully create credit request and publish Kafka event")
        void createCredit_success() {
                // Arrange
                when(clientRepository.findByIdAndRmId("client-001", "rm-001"))
                                .thenReturn(Optional.of(mockClient));
                when(creditRepository.save(any(Credit.class))).thenAnswer(invocation -> {
                        Credit credit = invocation.getArgument(0);
                        credit.setId("credit-new-001");
                        return credit;
                });

                // Act
                String result = creditService.createCredit(mockCreditRequest, "rm-001");

                // Assert
                assertEquals("Credit created successfully", result);

                // Verify credit was saved
                verify(creditRepository, times(1)).save(any(Credit.class));

                // Verify Kafka event was published
                ArgumentCaptor<CreditEvent> eventCaptor = ArgumentCaptor.forClass(CreditEvent.class);
                verify(kafkaEventProducer, times(1)).publishCreditEvent(eventCaptor.capture());

                CreditEvent capturedEvent = eventCaptor.getValue();
                assertEquals("CREATED", capturedEvent.getEventType());
                assertEquals("client-001", capturedEvent.getClientId());
                assertEquals(500000.0, capturedEvent.getAmount());
                assertEquals(CreditStatus.PENDING, capturedEvent.getStatus());
                assertEquals("rm-001", capturedEvent.getActionBy());
                assertNotNull(capturedEvent.getTimestamp());
        }

        // @Test
        // @DisplayName("Should throw ClientNotFoundException when client not found")
        // void createCredit_clientNotFound() {
        // // Arrange
        // when(clientRepository.findByIdAndRmId("non-existent", "rm-001"))
        // .thenReturn(Optional.empty());

        // // Act & Assert
        // assertThrows(ClientNotFoundException.class,
        // () -> creditService.createCredit(mockCreditRequest, "rm-001"));
        // verify(creditRepository, never()).save(any(Credit.class));
        // verify(kafkaEventProducer,
        // never()).publishCreditEvent(any(CreditEvent.class));
        // }

        @Test
        @DisplayName("Should get all credits for analyst")
        void getCredits_asAnalyst() {
                // Arrange
                List<Credit> mockCredits = Arrays.asList(mockCredit);
                when(creditRepository.findAll()).thenReturn(mockCredits);
                when(clientRepository.findById("client-001")).thenReturn(Optional.of(mockClient));
                when(userRepository.findById("rm-001")).thenReturn(Optional.of(mockUser));

                // Act
                List<CreditAllDetails> result = creditService.getCredits("analyst-001", true);

                // Assert
                assertEquals(1, result.size());
                assertEquals("credit-001", result.get(0).getId());
                assertEquals("ABC Corp", result.get(0).getClientName());
                assertEquals("john.doe", result.get(0).getRmName());
                verify(creditRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should get only RM's credits for RM role")
        void getCredits_asRM() {
                // Arrange
                List<Credit> mockCredits = Arrays.asList(mockCredit);
                when(creditRepository.findBySubmittedBy("rm-001")).thenReturn(mockCredits);
                when(clientRepository.findById("client-001")).thenReturn(Optional.of(mockClient));
                when(userRepository.findById("rm-001")).thenReturn(Optional.of(mockUser));

                // Act
                List<CreditAllDetails> result = creditService.getCredits("rm-001", false);

                // Assert
                assertEquals(1, result.size());
                assertEquals("credit-001", result.get(0).getId());
                verify(creditRepository, times(1)).findBySubmittedBy("rm-001");
        }

        @Test
        @DisplayName("Should get credit by ID successfully")
        void getCreditById_success() {
                // Arrange
                when(creditRepository.findById("credit-001")).thenReturn(Optional.of(mockCredit));

                // Act
                Credit result = creditService.getCreditById("credit-001");

                // Assert
                assertNotNull(result);
                assertEquals("credit-001", result.getId());
                assertEquals(CreditStatus.PENDING, result.getStatus());
                verify(creditRepository, times(1)).findById("credit-001");
        }

        @Test
        @DisplayName("Should throw CreditNotFoundException when credit not found")
        void getCreditById_notFound() {
                // Arrange
                when(creditRepository.findById("non-existent")).thenReturn(Optional.empty());

                // Act & Assert
                assertThrows(CreditNotFoundException.class, () -> creditService.getCreditById("non-existent"));
        }

        @Test
        @DisplayName("Should successfully update credit decision and publish Kafka event")
        void updateCreditDecision_success() {
                // Arrange
                CreditDecision decision = new CreditDecision();
                decision.setStatus("APPROVED");
                decision.setRemarks("All documents verified");

                when(creditRepository.findById("credit-001")).thenReturn(Optional.of(mockCredit));
                when(creditRepository.save(any(Credit.class))).thenReturn(mockCredit);

                // Act
                String result = creditService.updateCreditDecision("credit-001", decision);

                // Assert
                assertEquals("Updated credit successfully", result);
                assertEquals(CreditStatus.APPROVED, mockCredit.getStatus());
                assertEquals("All documents verified", mockCredit.getRemarks());

                // Verify credit was saved
                verify(creditRepository, times(1)).save(mockCredit);

                // Verify Kafka event was published
                ArgumentCaptor<CreditEvent> eventCaptor = ArgumentCaptor.forClass(CreditEvent.class);
                verify(kafkaEventProducer, times(1)).publishCreditEvent(eventCaptor.capture());

                CreditEvent capturedEvent = eventCaptor.getValue();
                assertEquals("STATUS_UPDATED", capturedEvent.getEventType());
                assertEquals("PENDING", capturedEvent.getPreviousStatus());
                assertEquals(CreditStatus.APPROVED, capturedEvent.getStatus());
                assertEquals("All documents verified", capturedEvent.getComments());
                assertNotNull(capturedEvent.getTimestamp());
        }

        @Test
        @DisplayName("Should reject credit request")
        void updateCreditDecision_reject() {
                // Arrange
                CreditDecision decision = new CreditDecision();
                decision.setStatus("REJECTED");
                decision.setRemarks("Insufficient documentation");

                when(creditRepository.findById("credit-001")).thenReturn(Optional.of(mockCredit));
                when(creditRepository.save(any(Credit.class))).thenReturn(mockCredit);

                // Act
                String result = creditService.updateCreditDecision("credit-001", decision);

                // Assert
                assertEquals("Updated credit successfully", result);
                assertEquals(CreditStatus.REJECTED, mockCredit.getStatus());
                assertEquals("Insufficient documentation", mockCredit.getRemarks());
                verify(creditRepository, times(1)).save(mockCredit);
                verify(kafkaEventProducer, times(1)).publishCreditEvent(any(CreditEvent.class));
        }

        @Test
        @DisplayName("Should throw exception when updating non-existent credit")
        void updateCreditDecision_notFound() {
                // Arrange
                CreditDecision decision = new CreditDecision();
                decision.setStatus("APPROVED");
                decision.setRemarks("Approved");

                when(creditRepository.findById("non-existent")).thenReturn(Optional.empty());

                // Act & Assert
                assertThrows(CreditNotFoundException.class,
                                () -> creditService.updateCreditDecision("non-existent", decision));
                verify(creditRepository, never()).save(any(Credit.class));
                verify(kafkaEventProducer, never()).publishCreditEvent(any(CreditEvent.class));
        }
}