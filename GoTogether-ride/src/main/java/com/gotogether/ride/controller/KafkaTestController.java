package com.gotogether.ride.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gotogether.ride.kafka.SimpleMessage;
import com.gotogether.ride.kafka.SimpleProducer;

/**
 * TEST CONTROLLER - To test Kafka message sending
 * 
 * API endpoints to send messages through Kafka
 */
@RestController
@RequestMapping("/api/kafka")
public class KafkaTestController {
    
    // Inject SimpleProducer to send messages
    private final SimpleProducer simpleProducer;
    
    // Constructor injection
    public KafkaTestController(SimpleProducer simpleProducer) {
        this.simpleProducer = simpleProducer;
    }
    
    /**
     * TEST ENDPOINT 1 - Send simple test message
     * 
     * URL: GET http://localhost:8081/api/kafka/test
     * 
     * This will send a test message to Kafka
     */
    @GetMapping("/test")
    public String testMessage() {
        // Create a simple message
        SimpleMessage msg = new SimpleMessage();
        msg.setMessage("Hello from Ride Service!");
        msg.setRideId(1L);
        msg.setEventType("TEST");
        
        // Send to Kafka
        simpleProducer.sendMessage(msg);
        
        // Return response to user
        return "Message sent to Kafka!";
    }
    
    /**
     * TEST ENDPOINT 2 - Send custom message
     * 
     * URL: POST http://localhost:8081/api/kafka/send
     * Body: {
     *   "message": "Custom message",
     *   "rideId": 5,
     *   "eventType": "RIDE_UPDATED"
     * }
     * 
     * This will send custom message to Kafka
     */
    @PostMapping("/send")
    public String sendCustomMessage(@RequestBody SimpleMessage message) {
        simpleProducer.sendMessage(message);
        return "Custom message sent!";
    }
}
