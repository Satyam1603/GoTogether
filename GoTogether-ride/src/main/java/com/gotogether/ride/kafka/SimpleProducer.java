package com.gotogether.ride.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

/**
 * SIMPLE PRODUCER - Sends messages to Kafka
 * 
 * This service sends a simple message to Kafka topic "ride-topic"
 * Any service can listen to this topic and process the message
 */
@Service
public class SimpleProducer {
    
    // Logger - to print messages to console
    private static final Logger logger = LoggerFactory.getLogger(SimpleProducer.class);
    
    // KafkaTemplate - Spring provides this to send messages
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    // Topic name - messages will be sent to this topic
    private final String TOPIC = "ride-topic";
    
    // Constructor - Spring automatically injects KafkaTemplate
    public SimpleProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }
    
    /**
     * SEND MESSAGE METHOD
     * This method sends a message to Kafka
     * 
     * @param message - The message to send
     */
    public void sendMessage(SimpleMessage message) {
        logger.info("SENDING MESSAGE: {}", message.getMessage());
        
        // Send message to topic
        // First parameter: topic name
        // Second parameter: the message object
        kafkaTemplate.send(TOPIC, message);
        
        logger.info("MESSAGE SENT SUCCESSFULLY!");
    }
}
