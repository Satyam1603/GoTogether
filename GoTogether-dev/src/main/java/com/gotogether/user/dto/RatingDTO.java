package com.gotogether.user.dto;

import lombok.Data;

@Data
public class RatingDTO {
    private Long userId;
    private int rating;
    private String review;
}