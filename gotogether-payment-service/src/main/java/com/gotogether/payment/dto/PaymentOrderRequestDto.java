package com.gotogether.payment.dto;

import com.gotogether.payment.entity.PaymentMethod;
import lombok.Data;

@Data
public class PaymentOrderRequestDto {
    private Long bookingId;
    private Long userId;
    private Double amount;
    private PaymentMethod paymentMethod;
}