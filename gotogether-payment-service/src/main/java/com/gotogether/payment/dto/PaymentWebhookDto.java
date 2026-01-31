package com.gotogether.payment.dto;

import com.gotogether.payment.entity.PaymentStatus;
import lombok.Data;

@Data
public class PaymentWebhookDto {
    private String transactionId;
    private PaymentStatus status;
}