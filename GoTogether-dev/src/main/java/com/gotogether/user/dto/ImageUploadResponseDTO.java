package com.gotogether.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadResponseDTO {
    private String message;
    private String status;
    private String imageUrl;
    private Long userId;
}
