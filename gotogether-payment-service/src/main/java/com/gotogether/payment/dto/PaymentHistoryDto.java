package com.gotogether.payment.dto;

import com.gotogether.payment.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PaymentHistoryDto {
    private String transactionId;
    private Double amount;
    private LocalDateTime paymentDate;
    private PaymentStatus status;
}