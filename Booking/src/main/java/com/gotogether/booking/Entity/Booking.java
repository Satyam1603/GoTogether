package com.gotogether.booking.Entity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;


@Entity
@Table(name = "bookings", indexes = {
    @Index(columnList = "ride_id"),
    @Index(columnList = "passenger_id"), 
    @Index(columnList = "status, booked_at")
})



@Data
@AllArgsConstructor	
@NoArgsConstructor
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long rideId;
    
    @Column(nullable = false)
    private Long passengerId;
    
    @Column(nullable = false)
    private Integer passengerSeats;
    
    @Column(nullable = false, length = 100)
    private String pickupPoint;
    
    @Column(length = 100)
    private String dropoffPoint;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;
    
    // SEPARATE COLUMNS - No JSON
    @Column(name = "passenger_name", length = 100)
    private String passengerName;
    
    @Column(name = "passenger_email", length = 255)
    private String passengerEmail;
    
    @Column(name = "passenger_phone", length = 20)
    private String passengerPhone;
    
    @Column(name = "card_number", length = 19)
    private String cardNumber;
    
    private LocalDateTime bookedAt = LocalDateTime.now();
    private LocalDateTime rideDate;
    
    @Version
    private Integer version;
}