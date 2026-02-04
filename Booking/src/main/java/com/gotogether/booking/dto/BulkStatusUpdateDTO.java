package com.gotogether.booking.dto;

import lombok.*;

import java.util.List;
import com.gotogether.booking.Entity.BookingStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkStatusUpdateDTO {
    private List<Long> ids;
    private BookingStatus status;
}