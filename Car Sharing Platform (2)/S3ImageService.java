package com.gotogether.service;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

/**
 * Service for uploading and managing images in AWS S3
 * 
 * Features:
 * - Validate image format (JPG, PNG)
 * - Resize images to optimal size (200x200 for avatars)
 * - Upload to S3 with public read access
 * - Generate public URLs
 * - Delete old images
 */
@Service
public class S3ImageService {
    
    private final S3Client s3Client;
    
    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    
    @Value("${aws.s3.base-url}")
    private String baseUrl;
    
    // Avatar dimensions (square for consistency)
    private static final int AVATAR_SIZE = 200;
    
    public S3ImageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }
    
    /**
     * Upload and resize a driver avatar image to S3
     * 
     * Process:
     * 1. Validate file format (must be JPG or PNG)
     * 2. Read image and check it's valid
     * 3. Resize to 200x200 pixels (maintains aspect ratio)
     * 4. Compress to JPG format
     * 5. Upload to S3 with public read access
     * 6. Return public URL
     * 
     * @param file Image file from user upload
     * @param driverId Driver ID for organizing files (creates folder: drivers/{driverId}/)
     * @return Public S3 URL of the uploaded image
     *         Format: https://bucket-name.s3.amazonaws.com/drivers/1/1234567890.jpg
     * @throws IOException if image processing fails
     * @throws IllegalArgumentException if file is invalid
     */
    public String uploadDriverAvatar(MultipartFile file, Long driverId) throws IOException {
        // Step 1: Validate file
        validateImageFile(file);
        
        // Step 2: Read and validate image
        BufferedImage originalImage = ImageIO.read(file.getInputStream());
        if (originalImage == null) {
            throw new IllegalArgumentException("Unable to read image. File may be corrupted.");
        }
        
        // Step 3: Resize to 200x200 pixels
        BufferedImage resizedImage = Thumbnails.of(originalImage)
                .size(AVATAR_SIZE, AVATAR_SIZE)
                .keepAspectRatio(true)
                .asBufferedImage();
        
        // Step 4: Convert BufferedImage to byte array (JPG format)
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(resizedImage, "jpg", outputStream);
        byte[] imageBytes = outputStream.toByteArray();
        
        // Step 5: Generate unique filename using timestamp
        // Format: drivers/{driverId}/{timestamp}.jpg
        // Example: drivers/1/1704067200000.jpg
        String fileName = String.format("drivers/%d/%d.jpg", driverId, System.currentTimeMillis());
        
        // Step 6: Upload to S3
        uploadToS3(fileName, imageBytes);
        
        // Step 7: Return public URL
        return baseUrl + "/" + fileName;
    }
    
    /**
     * Delete an image from S3
     * Safe operation - doesn't throw if image doesn't exist
     * 
     * @param imageUrl Full S3 URL to delete
     *                 Example: https://bucket.s3.amazonaws.com/drivers/1/1234567890.jpg
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }
        
        // Only delete if URL belongs to our bucket
        if (!imageUrl.contains(bucketName)) {
            return;
        }
        
        try {
            // Extract key from URL
            // From: https://bucket.s3.amazonaws.com/drivers/1/1234567890.jpg
            // To: drivers/1/1234567890.jpg
            String key = imageUrl.replace(baseUrl + "/", "");
            
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            
            s3Client.deleteObject(deleteRequest);
        } catch (Exception e) {
            // Log but don't throw - old image deletion shouldn't block operations
            System.err.println("Failed to delete image from S3: " + e.getMessage());
        }
    }
    
    /**
     * Upload bytes to S3 with public read access
     */
    private void uploadToS3(String key, byte[] imageBytes) {
        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType("image/jpeg")
                .acl(ObjectCannedACL.PUBLIC_READ)  // Make publicly readable
                .contentLength((long) imageBytes.length)
                .build();
        
        s3Client.putObject(putRequest, RequestBody.fromBytes(imageBytes));
    }
    
    /**
     * Validate image file
     * - Must not be empty
     * - Must be JPG or PNG format
     */
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("Unable to determine file type");
        }
        
        boolean isValidType = contentType.equals("image/jpeg") || 
                             contentType.equals("image/png") || 
                             contentType.equals("image/jpg");
        
        if (!isValidType) {
            throw new IllegalArgumentException(
                String.format("Invalid image format: %s. Only JPG and PNG allowed.", contentType)
            );
        }
        
        // Check file size (max 5MB)
        long maxSize = 5 * 1024 * 1024; // 5MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException(
                String.format("File too large: %d bytes. Maximum is 5MB.", file.getSize())
            );
        }
    }
}
