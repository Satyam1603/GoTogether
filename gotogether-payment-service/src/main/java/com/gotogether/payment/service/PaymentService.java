package com.gotogether.payment.service;

import com.gotogether.payment.dto.*;
import java.util.List;

public interface PaymentService {
    String createOrder(PaymentOrderRequestDto orderRequest);
    void verifyPayment(PaymentVerificationDto verificationDto);
    PaymentStatusDto getPaymentStatus(String transactionId);
    List<PaymentHistoryDto> getUserPaymentHistory(Long userId);
    void initiateRefund(PaymentRefundRequestDto refundRequest);
    void handleWebhook(PaymentWebhookDto webhookDto);
}