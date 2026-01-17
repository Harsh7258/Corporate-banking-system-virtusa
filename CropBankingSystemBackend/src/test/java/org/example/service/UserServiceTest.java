package org.example.service;

import org.example.exception.UserNotFoundException;
import org.example.kafka.events.UserEvent;
import org.example.kafka.producer.KafkaEventProducer;
import org.example.model.Role;
import org.example.model.User;
import org.example.model.UserAdminList;
import org.example.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private KafkaEventProducer kafkaEventProducer;

    @InjectMocks
    private UserService userService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id("user-001")
                .username("john.doe")
                .email("john@example.com")
                .role(Role.RELATIONSHIP_MANAGER)
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Should get all users")
    void getAllUsers_success() {
        // Arrange
        User user2 = User.builder()
                .id("user-002")
                .username("jane.smith")
                .email("jane@example.com")
                .role(Role.ANALYST)
                .active(true)
                .build();

        List<User> mockUsers = Arrays.asList(mockUser, user2);
        when(userRepository.findAll()).thenReturn(mockUsers);

        // Act
        List<UserAdminList> result = userService.getAllUsers();

        // Assert
        assertEquals(2, result.size());
        assertEquals("john.doe", result.get(0).username());
        assertEquals("jane.smith", result.get(1).username());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should get current user by email")
    void getCurrentUser_success() {
        // Arrange
        when(userRepository.findUserByEmail("john@example.com"))
                .thenReturn(Optional.of(mockUser));

        // Act
        User result = userService.getCurrentUser("john@example.com");

        // Assert
        assertNotNull(result);
        assertEquals("john.doe", result.getUsername());
        assertEquals("john@example.com", result.getEmail());
        verify(userRepository, times(1)).findUserByEmail("john@example.com");
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when user not found by email")
    void getCurrentUser_notFound() {
        // Arrange
        when(userRepository.findUserByEmail("nonexistent@example.com"))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> userService.getCurrentUser("nonexistent@example.com"));
    }

    @Test
    @DisplayName("Should activate user and publish Kafka event")
    void updateStatus_activate() {
        // Arrange
        mockUser.setActive(false); // Initially inactive
        when(userRepository.findById("user-001")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // Act
        String result = userService.updateStatus("user-001", true);

        // Assert
        assertEquals("User activated successfully", result);
        assertTrue(mockUser.getActive());

        // Verify user was saved
        verify(userRepository, times(1)).save(mockUser);

        // Verify Kafka event was published
        ArgumentCaptor<UserEvent> eventCaptor = ArgumentCaptor.forClass(UserEvent.class);
        verify(kafkaEventProducer, times(1)).publishUserEvent(eventCaptor.capture());

        UserEvent capturedEvent = eventCaptor.getValue();
        assertEquals("USER_STATUS_UPDATED", capturedEvent.getEventType());
        assertEquals("user-001", capturedEvent.getUserId());
        assertEquals("john.doe", capturedEvent.getUsername());
        assertEquals(Role.RELATIONSHIP_MANAGER, capturedEvent.getRole());
        assertEquals("john@example.com", capturedEvent.getEmail());
        assertNotNull(capturedEvent.getTimestamp());
    }

    @Test
    @DisplayName("Should deactivate user and publish Kafka event")
    void updateStatus_deactivate() {
        // Arrange
        when(userRepository.findById("user-001")).thenReturn(Optional.of(mockUser));
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // Act
        String result = userService.updateStatus("user-001", false);

        // Assert
        assertEquals("User deactivated successfully", result);
        assertFalse(mockUser.getActive());

        // Verify user was saved
        verify(userRepository, times(1)).save(mockUser);

        // Verify Kafka event was published
        verify(kafkaEventProducer, times(1)).publishUserEvent(any(UserEvent.class));
    }

    @Test
    @DisplayName("Should throw UserNotFoundException when updating non-existent user")
    void updateStatus_userNotFound() {
        // Arrange
        when(userRepository.findById("non-existent")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> userService.updateStatus("non-existent", true));
        verify(userRepository, never()).save(any(User.class));
        verify(kafkaEventProducer, never()).publishUserEvent(any(UserEvent.class));
    }
}