package com.gotogether.booking.dto;

import lombok.*;

import java.time.LocalDate;
import java.math.BigDecimal;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBookingRequestDTO {
    private Integer passengerSeats;
    private String pickupPoint;
    private String dropoffPoint;
    private BigDecimal totalAmount;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate rideDate;
}