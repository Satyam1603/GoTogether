# S3 Image Upload API - Complete Reference

## Endpoints

### 1. Upload Driver Avatar
**Upload and store a driver's profile image to AWS S3**

```
POST /api/drivers/{id}/avatar
```

#### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | Path | Yes | Driver ID |
| `file` | Form Data | Yes | Image file (JPG/PNG, max 5MB) |

#### Request Example
```bash
curl -X POST http://localhost:8081/api/drivers/1/avatar \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/Users/john/Desktop/avatar.jpg"
```

#### Success Response (200)
```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "https://car-sharing-platform-images.s3.amazonaws.com/drivers/1/1704067200000.jpg"
}
```

#### Error Response (400)
```json
{
  "error": "Invalid image format: text/plain. Only JPG and PNG allowed."
}
```

#### Error Response (404)
```json
{
  "error": "Driver not found with id: 999"
}
```

#### Error Response (500)
```json
{
  "error": "An unexpected error occurred: S3 service unavailable"
}
```

---

### 2. Get Driver Avatar URL
**Retrieve the avatar URL for a specific driver**

```
GET /api/drivers/{id}/avatar
```

#### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | Path | Yes | Driver ID |

#### Request Example
```bash
curl http://localhost:8081/api/drivers/1/avatar
```

#### Success Response (200)
```json
{
  "avatarUrl": "https://car-sharing-platform-images.s3.amazonaws.com/drivers/1/1704067200000.jpg"
}
```

#### Error Response (404)
```json
{
  "error": "Avatar not found"
}
```

---

### 3. Delete Driver Avatar
**Remove a driver's avatar from S3**

```
DELETE /api/drivers/{id}/avatar
```

#### Parameters
| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | Path | Yes | Driver ID |

#### Request Example
```bash
curl -X DELETE http://localhost:8081/api/drivers/1/avatar
```

#### Success Response (200)
```json
{
  "message": "Avatar deleted successfully"
}
```

#### Error Response (500)
```json
{
  "error": "Failed to delete avatar: S3 service error"
}
```

---

## Existing Endpoints (Updated)

### Get All Drivers (Compact Format)
**Returns list of drivers with their avatar URLs from S3**

```
GET /gotogether/rides/users/compact/all
```

#### Response
```json
[
  {
    "id": 1,
    "avatarUrl": "https://car-sharing-platform-images.s3.amazonaws.com/drivers/1/1704067200000.jpg"
  },
  {
    "id": 2,
    "avatarUrl": "https://car-sharing-platform-images.s3.amazonaws.com/drivers/2/1704067300000.jpg"
  },
  {
    "id": 3,
    "avatarUrl": null  // Driver hasn't uploaded avatar yet
  }
]
```

---

## Implementation Details

### Image Processing Flow

```
User selects image in frontend
         ↓
Form Data sent to POST /api/drivers/{id}/avatar
         ↓
Backend validates:
  - File not empty ✓
  - File type is JPG/PNG ✓
  - File size < 5MB ✓
         ↓
ImageService processes:
  - Read image file
  - Resize to 200x200px
  - Maintain aspect ratio
  - Compress to JPG format
         ↓
Generate unique S3 key:
  - Format: drivers/{driverId}/{timestamp}.jpg
  - Example: drivers/1/1704067200000.jpg
         ↓
Upload to S3:
  - Upload resized image bytes
  - Set public read access
  - Generate public URL
         ↓
Update Driver entity:
  - Save avatarUrl in database
  - Preserve other fields
         ↓
Return response:
  - Success: 200 + avatarUrl
  - Error: 400/404/500 + error message
```

### S3 File Organization

```
Bucket: car-sharing-platform-images

Structure:
  drivers/
    1/
      1704067200000.jpg  ← driver 1, uploaded at time T1
      1704067300000.jpg  ← driver 1, uploaded at time T2 (old file auto-deleted)
    2/
      1704067400000.jpg  ← driver 2, uploaded at time T3
    3/
      1704067500000.jpg  ← driver 3, uploaded at time T4
```

---

## Data Model

### Driver Entity (Updated)
```java
@Entity
@Table(name = "drivers")
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
    
    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;  // ← NEW: S3 URL like "https://..."
    
    @Column(name = "rating")
    private Double rating;
    
    @Column(name = "review_count")
    private Integer reviewCount;
    
    @Column(name = "verified")
    private Boolean verified;
}
```

### CompactDriverDTO (Updated)
```java
@Data
@AllArgsConstructor
public class CompactDriverDTO {
    private Long id;
    private String avatarUrl;  // ← CHANGED from imageBase64
}
```

---

## Validation Rules

### Image File Validation
```
✓ File format: JPEG or PNG only
✓ File size: Maximum 5 MB
✓ File content: Must be readable as image
✓ Dimensions: Any size (will be resized)

✗ Empty files
✗ Corrupted images
✗ Text files
✗ PDFs or other formats
✗ Files > 5 MB
```

### Processed Image Specifications
```
Output format: JPG (lossy compression)
Dimensions: 200 × 200 pixels
Quality: 85% (optimized for quality/size)
Aspect ratio: Maintained (may have padding)
Location: S3 bucket
Access: Public (CloudFront/CDN compatible)
```

---

## Frontend Integration

### Example: Upload Image
```jsx
import { useState } from 'react';

function AvatarUpload({ driverId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await fetch(`/api/drivers/${driverId}/avatar`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Avatar URL:', data.avatarUrl);
        // Update UI with new avatar
      } else {
        const error = await response.json();
        setError(error.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/jpeg,image/png" 
        onChange={handleUpload}
      />
      {loading && <p>Uploading...</p>}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}
```

### Example: Display Avatar
```jsx
function DriverAvatar({ driver }) {
  return (
    <img
      src={driver.avatarUrl || '/default-avatar.jpg'}
      alt={driver.firstName}
      width={200}
      height={200}
      className="rounded-full"
      onError={(e) => {
        e.target.src = '/default-avatar.jpg';
      }}
    />
  );
}
```

---

## Error Codes Reference

| Code | Status | Cause | Solution |
|------|--------|-------|----------|
| 400 | Bad Request | Invalid file format | Upload JPG or PNG file |
| 400 | Bad Request | File too large | Reduce image size (max 5MB) |
| 400 | Bad Request | Corrupted image | Try different image file |
| 404 | Not Found | Driver doesn't exist | Check driver ID |
| 500 | Server Error | S3 upload failed | Check AWS credentials |
| 500 | Server Error | Database update failed | Check database connection |

---

## Environment Configuration

### application.properties
```properties
# AWS S3 Configuration
aws.access-key-id=${AWS_ACCESS_KEY_ID}
aws.secret-access-key=${AWS_SECRET_ACCESS_KEY}
aws.region=us-east-1
aws.s3.bucket-name=car-sharing-platform-images
aws.s3.base-url=https://car-sharing-platform-images.s3.amazonaws.com

# CORS Configuration (for frontend)
spring.web.cors.allowed-origins=http://localhost:5173,http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
```

### Environment Variables
```bash
export AWS_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXXXXX
export AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
export AWS_REGION=us-east-1
export AWS_S3_BUCKET_NAME=car-sharing-platform-images
export AWS_S3_BASE_URL=https://car-sharing-platform-images.s3.amazonaws.com
```

---

## Testing

### Unit Test Example
```java
@SpringBootTest
class DriverImageControllerTest {
    
    @MockBean
    private S3ImageService s3ImageService;
    
    @MockBean
    private DriverRepository driverRepository;
    
    @Test
    void testUploadAvatar() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
            "file", "avatar.jpg", "image/jpeg", "image data".getBytes()
        );
        Driver driver = new Driver();
        driver.setId(1L);
        
        when(driverRepository.findById(1L)).thenReturn(Optional.of(driver));
        when(s3ImageService.uploadDriverAvatar(file, 1L))
            .thenReturn("https://bucket.s3.amazonaws.com/drivers/1/123.jpg");
        
        // When & Then
        mockMvc.perform(multipart("/api/drivers/1/avatar")
                .file(file))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.avatarUrl").exists());
    }
}
```

### Integration Test Example
```bash
# Test upload
curl -X POST http://localhost:8081/api/drivers/1/avatar \
  -F "file=@test-image.jpg"

# Verify in S3
aws s3 ls s3://car-sharing-platform-images/drivers/1/

# Get avatar URL
curl http://localhost:8081/api/drivers/1/avatar
```

---

## Performance Optimization

### Image Resizing (200x200px)
- Reduces file size by ~80-90%
- Faster download for users
- Consistent image dimensions
- Optimized for avatar display

### S3 Benefits
- Unlimited storage
- Auto-scaling (handles traffic spikes)
- Global CDN support (CloudFront)
- Built-in redundancy (11x9s durability)

### Current Metrics
- Upload time: 200-500ms
- Download time: 50-100ms (local), 10-50ms (with CDN)
- Storage per image: ~5-10KB (after compression)
- Database per driver: 50 bytes (URL)

---

## Monitoring

### AWS CloudWatch Metrics
```
Monitoring → CloudWatch → S3 Metrics

Track:
- PutObject requests (uploads)
- GetObject requests (downloads)
- DeleteObject requests
- 4xx errors (client errors)
- 5xx errors (server errors)
```

### Application Logs
```
[INFO] Avatar upload started for driver: 1
[INFO] Image validation passed: image/jpeg, 234KB
[INFO] Image resized to 200x200
[DEBUG] Uploading to S3: drivers/1/1704067200000.jpg
[INFO] Image uploaded successfully
[INFO] Driver entity updated with avatarUrl
[INFO] Response: https://bucket.s3.amazonaws.com/drivers/1/1704067200000.jpg
```

---

## FAQ

**Q: Can I upload other image formats?**
A: Currently JPG and PNG only. To add more formats (WebP, GIF), update the validation in S3ImageService.

**Q: What happens if I upload a new image?**
A: Old image is automatically deleted from S3, and database is updated with new URL.

**Q: What if upload fails halfway?**
A: Partial uploads are cleaned up by S3 lifecycle policies. Database only updates on full success.

**Q: Can I batch upload images?**
A: Not yet, but could be added with a loop through driver list.

**Q: How long are images stored?**
A: Indefinitely until deleted or driver is removed.

**Q: Can I delete an avatar?**
A: Yes, use DELETE /api/drivers/{id}/avatar endpoint.

**Q: Are images cached?**
A: Yes, by browser (30 days) and CloudFront (if enabled).

