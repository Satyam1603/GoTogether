package com.gotogether.ride.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCompactDTO {
    private Long id;
    private String username;
 // S3 image URL
    private String imageUrl;
    private String imageBase64;
}
