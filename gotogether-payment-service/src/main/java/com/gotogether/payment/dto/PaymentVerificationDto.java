package com.gotogether.payment.dto;

import lombok.Data;

@Data
public class PaymentVerificationDto {
    private String transactionId;
    private String paymentSignature;
}