package org.example.service;

import org.example.exception.ClientNotFoundException;
import org.example.exception.UnauthAccessDeniedException;
import org.example.kafka.events.ClientEvent;
import org.example.kafka.producer.KafkaEventProducer;
import org.example.model.Role;
import org.example.model.User;
import org.example.model.client.ClientOn;
import org.example.model.client.ClientRequest;
import org.example.model.client.PrimaryContact;
import org.example.repository.ClientRepository;
import org.example.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private KafkaEventProducer kafkaEventProducer;

    @Mock
    private Authentication authentication;

    @Mock
    private CustomUserDetails customUserDetails;

    @InjectMocks
    private ClientService clientService;

    private User mockUser;
    private ClientOn mockClient;
    private ClientRequest mockClientRequest;

    @BeforeEach
    void setUp() {
        // Setup mock user
        mockUser = User.builder()
                .id("rm-001")
                .username("john.doe")
                .email("john@example.com")
                .role(Role.RELATIONSHIP_MANAGER)
                .active(true)
                .build();

        // Setup mock client
        mockClient = ClientOn.builder()
                .id("client-001")
                .companyName("ABC Corp")
                .industry("Technology")
                .address("123 Tech Street")
                .primaryContact(PrimaryContact.builder()
                        .name("Alice Smith")
                        .email("alice@example.com")
                        .phone("1234567890")
                        .build())
                .annualTurnover(1000000.0)
                .documentsSubmitted(true)
                .rmId("rm-001")
                .build();

        // Setup mock client request
        mockClientRequest = new ClientRequest();
        mockClientRequest.setCompanyName("XYZ Industries");
        mockClientRequest.setIndustry("Manufacturing");
        mockClientRequest.setAddress("456 Factory Road");
        mockClientRequest.setPrimaryContact(PrimaryContact.builder()
                .name("Alice Smith")
                .email("alice@example.com")
                .phone("1234567890")
                .build());
        mockClientRequest.setAnnualTurnover(2000000.0);
        mockClientRequest.setDocumentsSubmitted(true);

        // Mock authentication
        when(authentication.getPrincipal()).thenReturn(customUserDetails);
        when(customUserDetails.getUser()).thenReturn(mockUser);
    }

    @Test
    @DisplayName("Should successfully add a new client and publish Kafka event")
    void addClient_success() {
        // Arrange
        when(clientRepository.save(any(ClientOn.class))).thenAnswer(invocation -> {
            ClientOn client = invocation.getArgument(0);
            client.setId("client-new-001");
            return client;
        });

        // Act
        String result = clientService.addClient(mockClientRequest, authentication);

        // Assert
        assertEquals("Client Created successfully", result);

        // Verify client was saved
        verify(clientRepository, times(1)).save(any(ClientOn.class));

        // Verify Kafka event was published
        ArgumentCaptor<ClientEvent> eventCaptor = ArgumentCaptor.forClass(ClientEvent.class);
        verify(kafkaEventProducer, times(1)).publishClientEvent(eventCaptor.capture());

        ClientEvent capturedEvent = eventCaptor.getValue();
        assertEquals("CLIENT_CREATED", capturedEvent.getEventType());
        assertEquals("XYZ Industries", capturedEvent.getClientName());
        assertEquals("Manufacturing", capturedEvent.getIndustry());
        assertEquals("rm-001", capturedEvent.getOnboardedBy());
        assertNotNull(capturedEvent.getTimestamp());
    }

    @Test
    @DisplayName("Should get all clients for RM")
    void getMyClients_success() {
        // Arrange
        List<ClientOn> expectedClients = Arrays.asList(mockClient);
        when(clientRepository.findByRmId("rm-001")).thenReturn(expectedClients);

        // Act
        List<ClientOn> result = clientService.getMyClients(authentication);

        // Assert
        assertEquals(1, result.size());
        assertEquals("ABC Corp", result.get(0).getCompanyName());
        verify(clientRepository, times(1)).findByRmId("rm-001");
    }

    @Test
    @DisplayName("Should get client by ID when RM owns the client")
    void getClientById_success() {
        // Arrange
        when(clientRepository.findById("client-001")).thenReturn(Optional.of(mockClient));

        // Act
        ClientOn result = clientService.getClientById("client-001", authentication);

        // Assert
        assertNotNull(result);
        assertEquals("ABC Corp", result.getCompanyName());
        assertEquals("rm-001", result.getRmId());
        verify(clientRepository, times(1)).findById("client-001");
    }

    @Test
    @DisplayName("Should throw ClientNotFoundException when client not found")
    void getClientById_notFound() {
        // Arrange
        when(clientRepository.findById("non-existent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ClientNotFoundException.class, () -> clientService.getClientById("non-existent", authentication));
        verify(clientRepository, times(1)).findById("non-existent");
    }

    @Test
    @DisplayName("Should throw UnauthAccessDeniedException when RM doesn't own the client")
    void getClientById_unauthorizedAccess() {
        // Arrange
        ClientOn otherRmClient = ClientOn.builder()
                .id("client-002")
                .companyName("Other Corp")
                .rmId("rm-002") // Different RM
                .build();

        when(clientRepository.findById("client-002")).thenReturn(Optional.of(otherRmClient));

        // Act & Assert
        assertThrows(UnauthAccessDeniedException.class,
                () -> clientService.getClientById("client-002", authentication));
    }

    @Test
    @DisplayName("Should successfully update client")
    void updateClient_success() {
        // Arrange
        when(clientRepository.findById("client-001")).thenReturn(Optional.of(mockClient));
        when(clientRepository.save(any(ClientOn.class))).thenReturn(mockClient);

        // Act
        String result = clientService.updateClient("client-001", mockClientRequest, authentication);

        // Assert
        assertEquals("Updated Client successfully", result);
        verify(clientRepository, times(1)).save(any(ClientOn.class));
        assertEquals("XYZ Industries", mockClient.getCompanyName());
        assertEquals("Manufacturing", mockClient.getIndustry());
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent client")
    void updateClient_notFound() {
        // Arrange
        when(clientRepository.findById("non-existent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ClientNotFoundException.class,
                () -> clientService.updateClient("non-existent", mockClientRequest, authentication));
    }

    @Test
    @DisplayName("Should search clients by company name")
    void searchClients_byCompanyName() {
        // Arrange
        List<ClientOn> expectedClients = Arrays.asList(mockClient);
        when(clientRepository.findByRmIdAndCompanyNameContainingIgnoreCase("rm-001", "ABC"))
                .thenReturn(expectedClients);

        // Act
        List<ClientOn> result = clientService.searchClients("ABC", null, authentication);

        // Assert
        assertEquals(1, result.size());
        verify(clientRepository, times(1))
                .findByRmIdAndCompanyNameContainingIgnoreCase("rm-001", "ABC");
    }

    @Test
    @DisplayName("Should search clients by industry")
    void searchClients_byIndustry() {
        // Arrange
        List<ClientOn> expectedClients = Arrays.asList(mockClient);
        when(clientRepository.findByRmIdAndIndustryIgnoreCase("rm-001", "Technology"))
                .thenReturn(expectedClients);

        // Act
        List<ClientOn> result = clientService.searchClients(null, "Technology", authentication);

        // Assert
        assertEquals(1, result.size());
        verify(clientRepository, times(1))
                .findByRmIdAndIndustryIgnoreCase("rm-001", "Technology");
    }

    @Test
    @DisplayName("Should get all clients when no search criteria")
    void searchClients_noFilter() {
        // Arrange
        List<ClientOn> expectedClients = Arrays.asList(mockClient);
        when(clientRepository.findByRmId("rm-001")).thenReturn(expectedClients);

        // Act
        List<ClientOn> result = clientService.searchClients(null, null, authentication);

        // Assert
        assertEquals(1, result.size());
        verify(clientRepository, times(1)).findByRmId("rm-001");
    }

    @Test
    @DisplayName("Should get distinct industries for RM")
    void getIndustriesDistinct_success() {
        // Arrange
        List<String> expectedIndustries = Arrays.asList("Technology", "Manufacturing", "Finance");
        when(clientRepository.findDistinctIndustriesByRmId("rm-001")).thenReturn(expectedIndustries);

        // Act
        List<String> result = clientService.getIndustriesDistinct(authentication);

        // Assert
        assertEquals(3, result.size());
        assertTrue(result.contains("Technology"));
        verify(clientRepository, times(1)).findDistinctIndustriesByRmId("rm-001");
    }
}
