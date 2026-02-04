package com.gotogether.controller;

import com.gotogether.entity.Driver;
import com.gotogether.repository.DriverRepository;
import com.gotogether.service.S3ImageService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * REST Controller for driver image upload
 * 
 * Endpoint:
 * POST /api/drivers/{id}/avatar
 * 
 * Body: multipart/form-data
 * - file: Image file (JPG or PNG, max 5MB)
 * 
 * Response:
 * {
 *   "message": "Avatar uploaded successfully",
 *   "avatarUrl": "https://bucket.s3.amazonaws.com/drivers/1/1234567890.jpg"
 * }
 */
@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DriverImageController {
    
    @Autowired
    private S3ImageService s3ImageService;
    
    @Autowired
    private DriverRepository driverRepository;
    
    /**
     * Upload driver avatar image
     * 
     * Flow:
     * 1. Verify driver exists
     * 2. Delete old avatar if exists
     * 3. Upload new avatar to S3
     * 4. Update driver record with new URL
     * 5. Return new URL
     * 
     * @param id Driver ID
     * @param file Image file (multipart)
     * @return Upload response with avatar URL or error message
     */
    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            // 1. Check if driver exists
            Driver driver = driverRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Driver not found with id: " + id));
            
            // 2. Delete old avatar if exists
            if (driver.getAvatarUrl() != null && !driver.getAvatarUrl().isEmpty()) {
                try {
                    s3ImageService.deleteImage(driver.getAvatarUrl());
                } catch (Exception e) {
                    // Log but continue - old image failure shouldn't block new upload
                    System.err.println("Failed to delete old avatar: " + e.getMessage());
                }
            }
            
            // 3. Upload new avatar
            String avatarUrl = s3ImageService.uploadDriverAvatar(file, id);
            
            // 4. Update driver record
            driver.setAvatarUrl(avatarUrl);
            driverRepository.save(driver);
            
            // 5. Return success response
            return ResponseEntity.ok(new UploadResponse(
                    "Avatar uploaded successfully",
                    avatarUrl
            ));
            
        } catch (IllegalArgumentException e) {
            // Invalid input (bad file format, driver not found, etc.)
            return ResponseEntity.badRequest().body(
                    new ErrorResponse(e.getMessage())
            );
        } catch (IOException e) {
            // IO error during image processing
            return ResponseEntity.status(400).body(
                    new ErrorResponse("Failed to process image: " + e.getMessage())
            );
        } catch (Exception e) {
            // Unexpected error
            return ResponseEntity.status(500).body(
                    new ErrorResponse("An unexpected error occurred: " + e.getMessage())
            );
        }
    }
    
    /**
     * Get driver avatar URL
     * 
     * @param id Driver ID
     * @return Driver object with avatarUrl
     */
    @GetMapping("/{id}/avatar")
    public ResponseEntity<?> getAvatar(@PathVariable Long id) {
        try {
            Driver driver = driverRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
            
            if (driver.getAvatarUrl() == null || driver.getAvatarUrl().isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(new AvatarResponse(driver.getAvatarUrl()));
            
        } catch (Exception e) {
            return ResponseEntity.status(404).body(
                    new ErrorResponse("Avatar not found")
            );
        }
    }
    
    /**
     * Delete driver avatar
     * 
     * @param id Driver ID
     * @return Success message
     */
    @DeleteMapping("/{id}/avatar")
    public ResponseEntity<?> deleteAvatar(@PathVariable Long id) {
        try {
            Driver driver = driverRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
            
            if (driver.getAvatarUrl() != null) {
                s3ImageService.deleteImage(driver.getAvatarUrl());
                driver.setAvatarUrl(null);
                driverRepository.save(driver);
            }
            
            return ResponseEntity.ok(new MessageResponse("Avatar deleted successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    new ErrorResponse("Failed to delete avatar: " + e.getMessage())
            );
        }
    }
    
    // ==================== Response DTOs ====================
    
    /**
     * Success response after upload
     */
    @Data
    @AllArgsConstructor
    public static class UploadResponse {
        private String message;
        private String avatarUrl;
    }
    
    /**
     * Response for avatar retrieval
     */
    @Data
    @AllArgsConstructor
    public static class AvatarResponse {
        private String avatarUrl;
    }
    
    /**
     * Generic message response
     */
    @Data
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
    
    /**
     * Error response
     */
    @Data
    @AllArgsConstructor
    public static class ErrorResponse {
        private String error;
    }
}
