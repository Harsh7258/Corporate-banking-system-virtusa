package org.example.kafka.producer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.kafka.events.ClientEvent;
import org.example.kafka.events.CreditEvent;
import org.example.kafka.events.UserEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishCreditEvent(CreditEvent event) {
        kafkaTemplate.send("credit-events-top", event.getClientId(), event);
    }

    public void publishClientEvent(ClientEvent event) {
        kafkaTemplate.send("client-events-top", event.getClientId(), event);
    }

    public void publishUserEvent(UserEvent event) {
        kafkaTemplate.send("user-events-top", event.getUserId(), event);
    }
}
