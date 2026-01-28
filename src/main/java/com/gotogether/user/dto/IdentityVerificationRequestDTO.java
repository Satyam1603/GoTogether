package com.gotogether.user.dto;

import lombok.Data;

@Data
public class IdentityVerificationRequestDTO {
    private String documentType;
    private String documentUrl;
}