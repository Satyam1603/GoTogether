package com.gotogether.ride.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class RideResponseDTO {
    private Long rideId;
    private Long driverId;
    private Long vehicleId;
    private String source;
    private String destination;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Double farePerSeat;
    private int totalSeats;
    private int availableSeats;
    private String Description;
    private boolean airConditioning;
    private String chatty;
    private boolean  wifi;
    private boolean  music1;
    private boolean  phoneCharger;
    private boolean  music;
    private boolean smoking;
    private boolean pets;
    private boolean termsAccepted;
    private boolean insuranceUnderstood;
    private boolean safetyGuidelines;
    private com.gotogether.ride.entities.RideStatus status;
    private List<String> PickupPoints;
    private List<String> dropoffPoints;
}