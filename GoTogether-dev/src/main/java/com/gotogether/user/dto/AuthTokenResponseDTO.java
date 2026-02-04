package com.gotogether.user.dto;

import com.gotogether.user.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthTokenResponseDTO {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long expiresIn;  // in milliseconds
    private Long userId;
    private String email;
    private String role;
    private String message;
    private String status;
    private User user;

    public AuthTokenResponseDTO(String accessToken, String refreshToken, Long expiresIn, Long userId, String email, String role,User user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.tokenType = "Bearer";
        this.user = user;
    }
}
