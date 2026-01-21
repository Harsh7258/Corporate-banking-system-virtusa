package org.example.kafka.consumer;

import lombok.extern.slf4j.Slf4j;
import org.example.kafka.events.ClientEvent;
import org.example.kafka.events.CreditEvent;
import org.example.kafka.events.UserEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EventLoggingConsumer {

    // @desc Listen to credit events topic
    @KafkaListener(topics = "credit-events-top", groupId = "corporate-banking-group")
    public void consumeCreditEvent(CreditEvent event) {
        if ("CREATED".equals(event.getEventType())) {
            log.info("Credit Request Created: EventType={},ClientID={}, Amount={}, Status={}, By={}, CreatedAt{}",
                    event.getEventType(), event.getClientId(), event.getAmount(),
                    event.getStatus(), event.getRmId(), event.getTimestamp());
        } else if ("STATUS_UPDATED".equals(event.getEventType())) {
            log.info("Credit Status Updated: ClientID={}, {} -> {}, By={}, Comments={}, CreatedAt{}",
                    event.getRmId(), event.getPreviousStatus(),
                    event.getStatus(), event.getRmId(), event.getComments(), event.getTimestamp());
        }
    }

    // @desc Listen to client events topic
    @KafkaListener(topics = "client-events-top", groupId = "corporate-banking-group")
    public void consumeClientEvent(ClientEvent event) {
        log.info("Client Onboarded: EventType={}, ID={}, Name={}, Industry={}, By={}, CreatedAt{}",
                event.getEventType(),
                event.getClientId(), event.getClientName(),
                event.getIndustry(), event.getOnboardedBy(),
                event.getTimestamp());
    }

    // @desc Listen to user events topic
    @KafkaListener(topics = "user-events-top", groupId = "corporate-banking-group")
    public void consumeUserEvent(UserEvent event) {
        log.info("User Status Changed: EventType={}, ID={}, Username={}, Role={}, Active={}, Email={}, CreatedAt{}",
                event.getEventType(),
                event.getUserId(), event.getUsername(), event.getRole(),
                event.getPreviousStatus(), event.getEmail(), event.getTimestamp());
    }
}
