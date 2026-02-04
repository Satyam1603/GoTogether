package com.gotogether.booking.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import com.gotogether.booking.Entity.BookingStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {
    private Long id;
    private Long rideId;
    private Long passengerId;
    private Integer passengerSeats;
    private String pickupPoint;
    private String dropoffPoint;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private LocalDateTime bookedAt;
    private LocalDateTime rideDate;
}