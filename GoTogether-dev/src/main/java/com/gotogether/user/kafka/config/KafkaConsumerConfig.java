package com.gotogether.user.kafka.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

/**
 * KAFKA CONSUMER CONFIGURATION
 * 
 * This class configures how the User Service consumes messages from Kafka
 * Spring will use these settings when receiving messages
 */
@Configuration
@EnableKafka  // Enable Kafka listening
public class KafkaConsumerConfig {
    
    /**
     * Read from application.properties
     * This is the Kafka server address
     */
    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;
    
    /**
     * Read from application.properties
     * This is the consumer group ID
     */
    @Value("${spring.kafka.consumer.group-id:user-service-group}")
    private String groupId;
    
    /**
     * CONSUMER FACTORY BEAN
     * 
     * This bean creates the ConsumerFactory which Spring uses to create Kafka consumers
     * It configures how messages should be deserialized (converted from bytes to objects)
     */
    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        // Create a map with all consumer configurations
        Map<String, Object> configs = new HashMap<>();
        
        // Kafka broker address - where to connect
        configs.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        
        // Consumer group ID - identifies this consumer group
        // All consumers in same group read same messages together
        configs.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        
        // Key deserializer - converts message key from bytes to String
        configs.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        
        // Value deserializer - converts message value from bytes to Java object
        configs.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        
        // Trust packages - allow JsonDeserializer to deserialize any package
        configs.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
        
        // Auto offset reset - where to start reading if no offset found
        // "earliest" = read from beginning of topic
        // "latest" = read only new messages
        configs.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        // Enable auto commit - automatically save offset after processing
        configs.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);
        
        // Auto commit interval - save offset every 100ms
        configs.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, 100);
        
        // Session timeout - if no heartbeat in 30 seconds, mark consumer as dead
        configs.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000);
        
        // Create and return the consumer factory with above configurations
        return new DefaultKafkaConsumerFactory<>(configs);
    }
    
    /**
     * KAFKA LISTENER CONTAINER FACTORY BEAN
     * 
     * This bean creates the container that listens to Kafka topics
     * Spring uses this when you use @KafkaListener annotation
     * 
     * The container:
     * 1. Connects to Kafka broker
     * 2. Listens to the topic
     * 3. Receives messages
     * 4. Calls your listener method
     * 5. Commits offset when done
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        // Create the container factory
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = 
            new ConcurrentKafkaListenerContainerFactory<>();
        
        // Set the consumer factory created above
        factory.setConsumerFactory(consumerFactory());
        
        // Number of threads to process messages concurrently
        factory.setConcurrency(3);
        
        // Return the configured factory
        return factory;
    }
}
