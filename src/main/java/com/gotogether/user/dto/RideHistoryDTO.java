package com.gotogether.user.dto;

import lombok.Data;

@Data
public class RideHistoryDTO {
    private Long rideId;
    private String source;
    private String destination;
    private String date;
    private String time;
}