package com.gotogether.ride.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
    @ElementCollection(targetClass = String.class, fetch = FetchType.EAGER)  // Use EAGER for testing
    @CollectionTable(name = "ride_pickup_points", joinColumns = @JoinColumn(name = "ride_id"))
    @Column(name = "pickup_point")
    private List<String> pickupPoints = new ArrayList<>();

    @ElementCollection(targetClass = String.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "ride_dropoff_points", joinColumns = @JoinColumn(name = "ride_id"))
    @Column(name = "dropoff_point")
    private List<String> dropoffPoints = new ArrayList<>();
	
}