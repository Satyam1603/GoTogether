package com.gotogether.user.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gotogether.user.entity.User;
import com.gotogether.user.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Debug Controller - For troubleshooting and diagnostics
 * These endpoints help identify issues with the application
 */
@Slf4j
@RestController
@RequestMapping("/gotogether/debug")
@AllArgsConstructor
@CrossOrigin
public class DebugController {

    private final UserRepository userRepository;

    /**
     * Health Check - Verify server is running
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        response.put("message", "Server is running");
        return ResponseEntity.ok(response);
    }

    /**
     * Check if user exists and get details
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> checkUser(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        
        try {
            User user = userRepository.findById(userId).orElse(null);
            
            if (user == null) {
                response.put("status", "NOT_FOUND");
                response.put("message", "User with id " + userId + " does not exist");
                response.put("phoneNo", null);
                response.put("email", null);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            
            response.put("status", "FOUND");
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("phoneNo", user.getPhoneNo());
            response.put("phoneNoExists", user.getPhoneNo() != null && !user.getPhoneNo().isEmpty());
            response.put("role", user.getRole());
            response.put("emailVerified", user.isEmailVerified());
            response.put("phoneVerified", user.isPhoneVerified());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error checking user: ", e);
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Test database connection
     */
    @GetMapping("/database/test")
    public ResponseEntity<?> testDatabaseConnection() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            long userCount = userRepository.count();
            response.put("status", "CONNECTED");
            response.put("message", "Database connection successful");
            response.put("totalUsers", userCount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Database connection error: ", e);
            response.put("status", "FAILED");
            response.put("message", "Cannot connect to database");
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Simulate verify phone process (debug mode)
     * Shows step-by-step what happens
     */
    @GetMapping("/verify-phone-debug/{userId}")
    public ResponseEntity<?> verifyPhoneDebug(@PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        
        try {
            // Step 1: Check if user exists
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                response.put("step1_userExists", false);
                response.put("error", "User not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            response.put("step1_userExists", true);
            response.put("step1_userName", user.getFirstName() + " " + user.getLastName());
            
            // Step 2: Check phone number
            String phoneNo = user.getPhoneNo();
            response.put("step2_phoneNo", phoneNo);
            response.put("step2_phoneNoExists", phoneNo != null && !phoneNo.isEmpty());
            
            if (phoneNo == null || phoneNo.isEmpty()) {
                response.put("step2_error", "Phone number is missing");
                response.put("status", "FAILED");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Step 3: OTP would be generated
            response.put("step3_otpGenerated", "Would generate random 6-digit OTP");
            response.put("step3_otpExample", "123456");
            
            // Step 4: OTP would be saved to Redis
            response.put("step4_redisSave", "OTP would be saved to Redis with key: OTP:" + userId);
            response.put("step4_redisTTL", "5 minutes");
            
            // Step 5: SMS would be sent
            response.put("step5_smsSend", "SMS would be sent to " + phoneNo);
            response.put("step5_smsStatus", "Depends on Twilio configuration");
            
            response.put("status", "SUCCESS");
            response.put("message", "All checks passed - OTP process can proceed");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Debug verify phone error: ", e);
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get all users (for debugging - should be removed in production)
     */
    @GetMapping("/users/all")
    public ResponseEntity<?> getAllUsers() {
        Map<String, Object> response = new HashMap<>();
        try {
            response.put("users", userRepository.findAll()
                .stream()
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("firstName", user.getFirstName());
                    userMap.put("email", user.getEmail());
                    userMap.put("phoneNo", user.getPhoneNo());
                    userMap.put("hasPhone", user.getPhoneNo() != null && !user.getPhoneNo().isEmpty());
                    return userMap;
                })
                .toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting users: ", e);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Test configuration values
     */
    @GetMapping("/config/test")
    public ResponseEntity<?> testConfiguration() {
        Map<String, Object> response = new HashMap<>();
        
        response.put("redisHost", "${REDIS_HOST:localhost}");
        response.put("redisPort", "${REDIS_PORT:6379}");
        response.put("twilioConfigured", "Check application.properties");
        response.put("databaseUrl", "Check application.properties");
        response.put("message", "Verify these values in application.properties");
        
        return ResponseEntity.ok(response);
    }
}
