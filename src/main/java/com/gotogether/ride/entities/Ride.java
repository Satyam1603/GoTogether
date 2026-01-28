package com.gotogether.ride.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "rides")
@NoArgsConstructor
@Getter
@Setter
@ToString
public class Ride {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long rideId;
	private Long driverId;   
    private Long vehicleId; // Changed from int to Long
    private String source;       
    private String destination;  
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Double farePerSeat;
    private int totalSeats;      // Fetched from Vehicle Service initially
    private int availableSeats;  // Decreases when bookings happen

    // State Management
    @Enumerated(EnumType.STRING)
    private RideStatus status;
	
}