package org.example.service;

import org.example.exception.UserNotFoundException;
//import org.example.kafka.events.UserEvent;
//import org.example.kafka.producer.UserEventProducer;
import org.example.kafka.events.UserEvent;
import org.example.kafka.producer.KafkaEventProducer;
import org.example.model.User;
import org.example.model.UserAdminList;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private KafkaEventProducer kafkaEventProducer;

    public List<UserAdminList> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToUserAdminDTO).toList();
    }

    public User getCurrentUser(String email) {
        User user = userRepository.findUserByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found with this email"));
        return user;
    }

    public String updateStatus(String id, boolean active) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));
        user.setActive(active);

        userRepository.save(user);

        UserEvent event = UserEvent.builder()
                .eventType("USER_STATUS_UPDATED")
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .previousStatus(user.getActive())
                .email(user.getEmail())
                .timestamp(LocalDateTime.now())
                .build();

        kafkaEventProducer.publishUserEvent(event);

        return active ? "User activated successfully" : "User deactivated successfully";
    }

    private UserAdminList mapToUserAdminDTO(User user) {
        return new UserAdminList(user.getId(), // MongoDB _id
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getActive()
        );
    }
}

