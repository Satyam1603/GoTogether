package com.gotogether.user.dto;

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
    // Legacy: Base64-encoded image string (nullable, for backward compatibility)
    private String imageBase64;
}

