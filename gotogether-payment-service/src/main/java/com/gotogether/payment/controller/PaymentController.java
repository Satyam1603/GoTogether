package com.gotogether.payment.controller;

import com.gotogether.payment.dto.*;
import com.gotogether.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/orders")
    public ResponseEntity<String> createOrder(@RequestBody PaymentOrderRequestDto orderRequest) {
        String orderId = paymentService.createOrder(orderRequest);
        return ResponseEntity.ok(orderId);
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(@RequestBody PaymentVerificationDto verificationDto) {
        paymentService.verifyPayment(verificationDto);
        return ResponseEntity.ok("Payment verified successfully");
    }

    @GetMapping("/status/{transactionId}")
    public ResponseEntity<PaymentStatusDto> getPaymentStatus(@PathVariable String transactionId) {
        PaymentStatusDto status = paymentService.getPaymentStatus(transactionId);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/history/user/{userId}")
    public ResponseEntity<List<PaymentHistoryDto>> getUserPaymentHistory(@PathVariable Long userId) {
        List<PaymentHistoryDto> history = paymentService.getUserPaymentHistory(userId);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/refund")
    public ResponseEntity<String> initiateRefund(@RequestBody PaymentRefundRequestDto refundRequest) {
        paymentService.initiateRefund(refundRequest);
        return ResponseEntity.ok("Refund initiated successfully");
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody PaymentWebhookDto webhookDto) {
        paymentService.handleWebhook(webhookDto);
        return ResponseEntity.ok("Webhook processed successfully");
    }
}