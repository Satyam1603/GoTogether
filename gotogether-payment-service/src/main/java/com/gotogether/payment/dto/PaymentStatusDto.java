package com.gotogether.payment.dto;

import com.gotogether.payment.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentStatusDto {
    private String transactionId;
    private PaymentStatus status;
}