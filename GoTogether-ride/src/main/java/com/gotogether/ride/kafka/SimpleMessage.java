package com.gotogether.ride.kafka;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * SIMPLE MESSAGE CLASS
 * This is what we will send through Kafka
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimpleMessage {
    private String message;      // The message text
    private Long rideId;         // Ride ID
    private String eventType;    // Type of event
}
