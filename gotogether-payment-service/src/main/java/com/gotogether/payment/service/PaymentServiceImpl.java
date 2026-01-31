package com.gotogether.payment.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.gotogether.payment.dto.PaymentHistoryDto;
import com.gotogether.payment.dto.PaymentOrderRequestDto;
import com.gotogether.payment.dto.PaymentRefundRequestDto;
import com.gotogether.payment.dto.PaymentStatusDto;
import com.gotogether.payment.dto.PaymentVerificationDto;
import com.gotogether.payment.dto.PaymentWebhookDto;
import com.gotogether.payment.entity.Payment;
import com.gotogether.payment.entity.PaymentStatus;
import com.gotogether.payment.repository.PaymentRepository;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    public String createOrder(PaymentOrderRequestDto orderRequest) {
        Payment payment = new Payment();
        payment.setBookingId(orderRequest.getBookingId());
        payment.setUserId(orderRequest.getUserId());
        payment.setAmount(orderRequest.getAmount());
        payment.setPaymentMethod(orderRequest.getPaymentMethod());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setPaymentDate(LocalDateTime.now());
        paymentRepository.save(payment);
        return payment.getTransactionId();
    }

    @Override
    public void verifyPayment(PaymentVerificationDto verificationDto) {
        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(verificationDto.getTransactionId());
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus(PaymentStatus.SUCCESS);
            paymentRepository.save(payment);
        } else {
            throw new RuntimeException("Transaction not found");
        }
    }

    @Override
    public PaymentStatusDto getPaymentStatus(String transactionId) {
        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(transactionId);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            return new PaymentStatusDto(payment.getTransactionId(), payment.getStatus());
        } else {
            throw new RuntimeException("Transaction not found");
        }
    }

    @Override
    public List<PaymentHistoryDto> getUserPaymentHistory(Long userId) {
        List<Payment> payments = paymentRepository.findByUserId(userId);
        return payments.stream().map(payment -> new PaymentHistoryDto(payment.getTransactionId(), payment.getAmount(), payment.getPaymentDate(), payment.getStatus())).toList();
    }

    @Override
    public void initiateRefund(PaymentRefundRequestDto refundRequest) {
        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(refundRequest.getTransactionId());
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
        } else {
            throw new RuntimeException("Transaction not found");
        }
    }

    @Override
    public void handleWebhook(PaymentWebhookDto webhookDto) {
        Optional<Payment> paymentOpt = paymentRepository.findByTransactionId(webhookDto.getTransactionId());
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setStatus(webhookDto.getStatus());
            paymentRepository.save(payment);
        } else {
            throw new RuntimeException("Transaction not found");
        }
    }
}