package com.gotogether.ride.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class RideResponseDTO {
    private int rideId;
    private Long driverId;
    private int vehicleId;
    private String source;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Double farePerSeat;
    private int totalSeats;
    private int availableSeats;
    private com.gotogether.ride.entities.RideStatus status;
}