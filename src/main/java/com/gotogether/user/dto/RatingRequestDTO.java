package com.gotogether.user.dto;

import lombok.Data;

@Data
public class RatingRequestDTO {
    private int rating;
    private String review;
}