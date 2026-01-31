package com.gotogether.payment.dto;

import lombok.Data;

@Data
public class PaymentRefundRequestDto {
    private String transactionId;
    private Double refundAmount;
}