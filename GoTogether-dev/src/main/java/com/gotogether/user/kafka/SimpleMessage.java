package com.gotogether.user.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * SIMPLE MESSAGE CLASS - Same as Ride Service
 * This is what Consumer (User Service) will receive from Kafka
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimpleMessage {
    private String message;      // The message text
    private Long rideId;         // Ride ID
    private String eventType;    // Type of event
}
