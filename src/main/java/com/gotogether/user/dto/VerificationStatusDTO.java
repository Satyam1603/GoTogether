package com.gotogether.user.dto;

import lombok.Data;

@Data
public class VerificationStatusDTO {
    private boolean phoneVerified;
    private boolean emailVerified;
    private boolean identityVerified;
}