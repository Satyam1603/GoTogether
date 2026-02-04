package com.gotogether.ride.kafka.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

/**
 * KAFKA PRODUCER CONFIGURATION
 * 
 * This class configures how the Ride Service sends messages to Kafka
 * Spring will use these settings when sending messages
 */
@Configuration
@EnableKafka  // Enable Kafka support
public class KafkaProducerConfig {
    
    /**
     * Read from application.properties
     * This is the Kafka server address
     */
    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;
    
    /**
     * PRODUCER FACTORY BEAN
     * 
     * This bean creates the ProducerFactory which Spring uses to create Kafka producers
     * It configures how messages should be serialized (converted from objects to bytes)
     */
    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        // Create a map with all producer configurations
        Map<String, Object> configProps = new HashMap<>();
        
        // Kafka broker address - where to send messages
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        
        // Key serializer - converts message key to bytes
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        
        // Value serializer - converts message value to JSON bytes
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        
        // Acknowledgment setting:
        // "all" = wait for all replicas to acknowledge before returning
        // This ensures reliability but slightly slower
        configProps.put(ProducerConfig.ACKS_CONFIG, "all");
        
        // Number of retries if message send fails
        // If Kafka server is temporarily down, retry 3 times
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);
        
        // Linger time - wait up to 10ms to batch messages together
        // This improves throughput by sending multiple messages at once
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 10);
        
        // Batch size - maximum bytes to batch before sending
        // 16KB batch size
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        
        // Compression - compress messages using snappy
        // Reduces network bandwidth
        configProps.put(ProducerConfig.COMPRESSION_TYPE_CONFIG, "snappy");
        
        // Request timeout - wait 30 seconds for response from broker
        configProps.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 30000);
        
        // Create and return the producer factory with above configurations
        return new DefaultKafkaProducerFactory<>(configProps);
    }
    
    /**
     * KAFKA TEMPLATE BEAN
     * 
     * This bean is the main interface for sending messages to Kafka
     * Inject this in your service and call send() method
     * 
     * Example usage:
     * @Autowired
     * private KafkaTemplate<String, Object> kafkaTemplate;
     * 
     * kafkaTemplate.send("topic-name", message);
     */
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
