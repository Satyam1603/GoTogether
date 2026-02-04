package com.gotogether.user.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

/**
 * SIMPLE CONSUMER - Listens to Kafka messages
 * 
 * This service listens to "ride-topic" topic
 * Whenever a message arrives, this method is automatically called
 */
@Service
public class SimpleConsumer {
    
    // Logger - to print messages to console
    private static final Logger logger = LoggerFactory.getLogger(SimpleConsumer.class);
    
    /**
     * LISTEN METHOD - Receives messages from Kafka
     * 
     * @KafkaListener - Spring annotation that listens to Kafka topic
     * @param message - Message received from Kafka
     * 
     * How it works:
     * 1. This method is automatically called when a message arrives in "ride-topic"
     * 2. Spring automatically converts the message from JSON to SimpleMessage object
     * 3. We process the message (print it)
     * 4. If no error, message is marked as "consumed" (processed successfully)
     * 5. If error occurs, message is re-consumed based on retry policy
     */
    @KafkaListener(
        topics = "ride-topic",                          // Listen to this topic
        groupId = "user-service-group",                 // This consumer group
        containerFactory = "kafkaListenerContainerFactory"  // Use default container
    )
    public void consumeMessage(SimpleMessage message) {
        try {
            // Log the received message
            logger.info("====================================");
            logger.info("MESSAGE RECEIVED FROM KAFKA!");
            logger.info("====================================");
            logger.info("Message: {}", message.getMessage());
            logger.info("Ride ID: {}", message.getRideId());
            logger.info("Event Type: {}", message.getEventType());
            logger.info("====================================");
            
            // HERE YOU CAN DO ANY TASK
            // Examples:
            // 1. Send email to user
            // 2. Update database
            // 3. Call another service
            // 4. Store in cache
            // 5. Trigger notification
            
            logger.info("Processing completed successfully!");
            
        } catch (Exception e) {
            // If error occurs, log it
            logger.error("Error processing message: {}", e.getMessage(), e);
            
            // In real application, you might:
            // 1. Send to Dead Letter Queue (DLQ)
            // 2. Retry the message
            // 3. Alert the team
            // 4. Store in error database
        }
    }
}
