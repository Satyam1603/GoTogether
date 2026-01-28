package com.gotogether.ride.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class RideRequestDTO {
    private Long driverId;
    private Long vehicleId;
    private String source;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Double farePerSeat;
    private int totalSeats;
}
