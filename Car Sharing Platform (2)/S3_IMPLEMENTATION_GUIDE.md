# S3-Based Image Storage Implementation Guide

## Overview
This guide shows how to migrate from base64-encoded images stored in the database to S3-hosted image URLs. This approach is more scalable, efficient, and is the industry standard for production applications.

---

## Benefits of S3 Storage

✅ **Reduced Database Size** - No base64 bloat in database  
✅ **Faster Performance** - Images served from CDN  
✅ **Scalability** - Unlimited image storage  
✅ **Cost Effective** - S3 is cheaper than database storage  
✅ **Production Ready** - Industry standard approach  
✅ **Easy Management** - S3 console for image management  

---

## Step 1: AWS Setup

### 1.1 Create AWS Account
- Go to [AWS Console](https://aws.amazon.com/)
- Create an account or sign in

### 1.2 Create S3 Bucket
```
1. In AWS Console, navigate to S3
2. Click "Create Bucket"
3. Bucket Name: car-sharing-platform-images
4. Region: us-east-1 (or your preferred region)
5. Block Public Access: UNCHECK "Block all public access"
   (needed for public image URLs)
6. Create Bucket
```

### 1.3 Enable Public Read Access
```
1. Go to bucket > Permissions > Bucket Policy
2. Add this policy:

{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::car-sharing-platform-images/*"
    }
  ]
}
```

### 1.4 Create IAM User (For Backend Access)
```
1. Go to IAM > Users > Add User
2. Username: car-sharing-app
3. Select: "Access key - Programmatic access"
4. Attach Permissions: 
   - AmazonS3FullAccess (or custom S3 policy)
5. Create Access Key and save:
   - Access Key ID
   - Secret Access Key
```

---

## Step 2: Backend Implementation

### 2.1 Add Dependencies to pom.xml

```xml
<!-- AWS S3 SDK -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.20.0</version>
</dependency>

<!-- Image Resizing/Processing -->
<dependency>
    <groupId>net.coobird</groupId>
    <artifactId>thumbnailator</artifactId>
    <version>0.4.20</version>
</dependency>
```

### 2.2 Update application.properties

```properties
# AWS Configuration
aws.access-key-id=YOUR_ACCESS_KEY_HERE
aws.secret-access-key=YOUR_SECRET_KEY_HERE
aws.region=us-east-1
aws.s3.bucket-name=car-sharing-platform-images
aws.s3.base-url=https://car-sharing-platform-images.s3.amazonaws.com
```

### 2.3 Create S3 Configuration Class

```java
// src/main/java/com/gotogether/config/AmazonS3Config.java

package com.gotogether.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AmazonS3Config {
    
    @Value("${aws.access-key-id}")
    private String accessKey;
    
    @Value("${aws.secret-access-key}")
    private String secretKey;
    
    @Value("${aws.region}")
    private String region;
    
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .build();
    }
}
```

### 2.4 Update Driver Entity

Replace `imageBase64` with `avatarUrl`:

```java
// src/main/java/com/gotogether/entity/Driver.java

package com.gotogether.entity;

import javax.persistence.*;
import lombok.Data;

@Entity
@Table(name = "drivers")
@Data
public class Driver {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;
    
    @Column(name = "email", unique = true)
    private String email;
    
    @Column(name = "phone_number")
    private String phoneNumber;
    
    // NEW: Store S3 URL instead of base64
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;
    
    @Column(name = "rating")
    private Double rating = 4.5;
    
    @Column(name = "review_count")
    private Integer reviewCount = 0;
    
    @Column(name = "verified")
    private Boolean verified = false;
    
    // ... other fields
    
    // Getters and Setters
    public String getAvatarUrl() {
        return avatarUrl;
    }
    
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
```

### 2.5 Create Image Upload Service

```java
// src/main/java/com/gotogether/service/S3ImageService.java

package com.gotogether.service;

import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class S3ImageService {
    
    private final S3Client s3Client;
    
    @Value("${aws.s3.bucket-name}")
    private String bucketName;
    
    @Value("${aws.s3.base-url}")
    private String baseUrl;
    
    public S3ImageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }
    
    /**
     * Upload and resize an image to S3
     * 
     * @param file Image file to upload
     * @param driverId Driver ID for organizing files
     * @return Public S3 URL of the uploaded image
     */
    public String uploadDriverAvatar(MultipartFile file, Long driverId) throws IOException {
        // Validate file
        if (file.isEmpty() || !isValidImageType(file)) {
            throw new IllegalArgumentException("Invalid image file. Only JPG and PNG allowed.");
        }
        
        // Read image
        BufferedImage originalImage = ImageIO.read(file.getInputStream());
        if (originalImage == null) {
            throw new IllegalArgumentException("Unable to read image file");
        }
        
        // Resize to 200x200 (optimal for avatars)
        BufferedImage resizedImage = Thumbnails.of(originalImage)
                .size(200, 200)
                .keepAspectRatio(true)
                .asBufferedImage();
        
        // Convert to bytes
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(resizedImage, "jpg", outputStream);
        byte[] imageBytes = outputStream.toByteArray();
        
        // Generate S3 key with timestamp for uniqueness
        String fileName = "drivers/" + driverId + "/" + System.currentTimeMillis() + ".jpg";
        
        // Upload to S3
        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType("image/jpeg")
                .acl(ObjectCannedACL.PUBLIC_READ)
                .contentLength((long) imageBytes.length)
                .build();
        
        s3Client.putObject(putRequest, RequestBody.fromBytes(imageBytes));
        
        // Return public URL
        return baseUrl + "/" + fileName;
    }
    
    /**
     * Delete an image from S3
     */
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains(bucketName)) {
            return;
        }
        
        // Extract key from URL
        String key = imageUrl.replace(baseUrl + "/", "");
        s3Client.deleteObject(d -> d.bucket(bucketName).key(key));
    }
    
    private boolean isValidImageType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && 
               (contentType.equals("image/jpeg") || 
                contentType.equals("image/png") || 
                contentType.equals("image/jpg"));
    }
}
```

### 2.6 Create Image Upload Controller

```java
// src/main/java/com/gotogether/controller/DriverImageController.java

package com.gotogether.controller;

import com.gotogether.entity.Driver;
import com.gotogether.repository.DriverRepository;
import com.gotogether.service.S3ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "http://localhost:5173")
public class DriverImageController {
    
    @Autowired
    private S3ImageService s3ImageService;
    
    @Autowired
    private DriverRepository driverRepository;
    
    /**
     * Upload driver avatar image
     * POST /api/drivers/{id}/avatar
     */
    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            // Check if driver exists
            Driver driver = driverRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Driver not found"));
            
            // Delete old avatar if exists
            if (driver.getAvatarUrl() != null) {
                s3ImageService.deleteImage(driver.getAvatarUrl());
            }
            
            // Upload new avatar
            String avatarUrl = s3ImageService.uploadDriverAvatar(file, id);
            
            // Update driver
            driver.setAvatarUrl(avatarUrl);
            driverRepository.save(driver);
            
            return ResponseEntity.ok(new UploadResponse(
                    "Avatar uploaded successfully",
                    avatarUrl
            ));
            
        } catch (IOException e) {
            return ResponseEntity.status(500).body(
                    new ErrorResponse("Upload failed: " + e.getMessage())
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    new ErrorResponse(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    new ErrorResponse("An error occurred: " + e.getMessage())
            );
        }
    }
    
    // Response DTOs
    static class UploadResponse {
        public String message;
        public String avatarUrl;
        
        public UploadResponse(String message, String avatarUrl) {
            this.message = message;
            this.avatarUrl = avatarUrl;
        }
    }
    
    static class ErrorResponse {
        public String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
    }
}
```

### 2.7 Update Compact Rides Endpoint

Update your existing endpoint to return `avatarUrl` instead of `imageBase64`:

```java
// In your RideController or similar

@GetMapping("/users/compact/all")
public ResponseEntity<List<CompactDriverDTO>> getAllDriversCompact() {
    List<Driver> drivers = driverRepository.findAll();
    List<CompactDriverDTO> result = drivers.stream()
            .map(driver -> new CompactDriverDTO(
                    driver.getId(),
                    driver.getAvatarUrl()  // Returns S3 URL
            ))
            .collect(Collectors.toList());
    return ResponseEntity.ok(result);
}

// DTO
@Data
@AllArgsConstructor
public class CompactDriverDTO {
    private Long id;
    private String avatarUrl;  // Changed from imageBase64
}
```

---

## Step 3: Database Migration

### 3.1 Update Driver Table Schema

```sql
-- Update existing column
ALTER TABLE drivers MODIFY COLUMN avatar_url VARCHAR(500);

-- Or create migration file for JPA
-- src/main/resources/db/migration/V1__AddAvatarUrl.sql

CREATE TABLE IF NOT EXISTS drivers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20),
    avatar_url VARCHAR(500),  -- S3 URL
    rating DECIMAL(2,1),
    review_count INT,
    verified BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## Step 4: Frontend Updates (Already Done)

Your frontend code already supports both base64 and URLs:

### 4.1 Updated rideApi.js

The `transformRideResponse` function now uses S3 URLs directly:

```javascript
// Check if we have S3 URL image for this driver
if (driverImagesMap[driverId] && driverImagesMap[driverId].avatarUrl) {
    driverAvatar = driverImagesMap[driverId].avatarUrl;  // Use URL directly
}
```

### 4.2 UserProfile.jsx Already Handles URLs

```javascript
const getImageUrl = () => {
    if (user1?.image) {
        // If image starts with http, it's already a URL (S3)
        if (user1.image.startsWith('http')) {
            return user1.image;
        }
        // If image is base64, convert to data URL (fallback)
        if (!user1.image.startsWith('data:')) {
            return `data:image/jpeg;base64,${user1.image}`;
        }
        return user1.image;
    }
    return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop';
};
```

---

## Step 5: Testing the Implementation

### 5.1 Test Image Upload

```bash
# Using curl
curl -X POST http://localhost:8081/api/drivers/1/avatar \
  -F "file=@/path/to/image.jpg"

# Expected response:
# {
#   "message": "Avatar uploaded successfully",
#   "avatarUrl": "https://car-sharing-platform-images.s3.amazonaws.com/drivers/1/1234567890.jpg"
# }
```

### 5.2 Verify in Frontend

1. Start your React app
2. A driver's avatar should display directly from S3 URL
3. No base64 conversion needed

### 5.3 Check in AWS Console

```
1. Go to S3 > car-sharing-platform-images
2. Navigate to drivers/ folder
3. You should see folders like drivers/1/, drivers/2/, etc.
4. Inside each folder are the uploaded images with timestamps
```

---

## Deployment Checklist

- [ ] AWS S3 bucket created
- [ ] IAM user created with S3 access
- [ ] Environment variables configured in production
- [ ] S3Config bean created
- [ ] Driver entity updated with avatarUrl
- [ ] S3ImageService implemented
- [ ] DriverImageController endpoints working
- [ ] Compact rides endpoint returns avatarUrl
- [ ] Database schema updated or migration created
- [ ] Frontend code updated (already done)
- [ ] Images uploading and displaying correctly
- [ ] Old base64 images removed from database (optional cleanup)

---

## Cost Estimation (AWS S3)

- **Storage**: ~$0.023 per GB/month
  - 1000 driver images @ 100KB each = ~0.1 GB = $0.002/month
- **Data Transfer Out**: ~$0.09 per GB/month (with CloudFront CDN: ~$0.085/GB)
- **Requests**: GET $0.0000004 per request, PUT $0.000005 per request
  - 10,000 image views/month ≈ $0.004

**Estimated monthly cost for 1,000 drivers**: $0.02-0.05

---

## Troubleshooting

### Images not displaying?
- Check S3 bucket public access policy
- Verify avatarUrl is correct in database
- Check CORS settings if frontend is different domain

### Upload failing with 403?
- Verify IAM credentials
- Check bucket name matches configuration
- Ensure bucket exists in correct region

### Images too large?
- Thumbnailator resizing is enabled (200x200px)
- Adjust size in S3ImageService if needed

### Want to delete old S3 images?
```java
// S3ImageService has deleteImage() method
s3ImageService.deleteImage(oldAvatarUrl);
```

---

## Next Steps

1. **CloudFront CDN** (Optional): Add CloudFront for faster global image delivery
2. **Image Optimization**: Add WebP format support
3. **Batch Upload**: Admin panel to bulk upload driver images
4. **Image Caching**: Browser cache headers for better performance
5. **Backup**: Set S3 versioning for image history

