# Quick S3 Migration Guide - Step by Step

## 5-Minute Setup

### Step 1: AWS Credentials (2 minutes)

1. Open [AWS Console](https://console.aws.amazon.com)
2. Navigate to **S3** → **Create Bucket**
3. Bucket name: `car-sharing-platform-images`
4. Region: `us-east-1`
5. Uncheck "Block all public access"
6. Create bucket

### Step 2: Get AWS Access Keys (2 minutes)

1. Go to **IAM** → **Users** → **Create User**
2. Username: `car-sharing-app`
3. Select "Programmatic access"
4. Attach policy: **AmazonS3FullAccess**
5. Create and save:
   - Access Key ID
   - Secret Access Key

### Step 3: Backend Configuration (1 minute)

Update `application.properties`:

```properties
aws.access-key-id=XXXXXXXXXXXXXXXXXXXX
aws.secret-access-key=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
aws.region=us-east-1
aws.s3.bucket-name=car-sharing-platform-images
aws.s3.base-url=https://car-sharing-platform-images.s3.amazonaws.com
```

### Step 4: Add Files to Backend

Copy these 3 Java files to your Spring Boot project:

1. **AmazonS3Config.java** → `src/main/java/com/gotogether/config/`
2. **S3ImageService.java** → `src/main/java/com/gotogether/service/`
3. **DriverImageController.java** → `src/main/java/com/gotogether/controller/`

### Step 5: Update Dependencies

Add to `pom.xml`:

```xml
<!-- AWS S3 SDK -->
<dependency>
    <groupId>software.amazon.awssdk</groupId>
    <artifactId>s3</artifactId>
    <version>2.20.0</version>
</dependency>

<!-- Image Resizing -->
<dependency>
    <groupId>net.coobird</groupId>
    <artifactId>thumbnailator</artifactId>
    <version>0.4.20</version>
</dependency>
```

Run: `mvn clean install`

### Step 6: Update Driver Entity

In your `Driver.java` entity:

```java
// REMOVE this line:
// private String imageBase64;

// ADD this line:
@Column(name = "avatar_url", length = 500)
private String avatarUrl;

// Add getter/setter:
public String getAvatarUrl() {
    return avatarUrl;
}

public void setAvatarUrl(String avatarUrl) {
    this.avatarUrl = avatarUrl;
}
```

### Step 7: Update API Endpoint

Update your compact all drivers endpoint:

```java
// FROM:
.map(driver -> new CompactDriverDTO(driver.getId(), driver.getImageBase64()))

// TO:
.map(driver -> new CompactDriverDTO(driver.getId(), driver.getAvatarUrl()))
```

Update DTO:

```java
@Data
public class CompactDriverDTO {
    private Long id;
    private String avatarUrl;  // Changed from imageBase64
}
```

### Step 8: Frontend Already Updated ✅

Your `rideApi.js` is already updated to use `avatarUrl` directly.

---

## Testing

### Test 1: Upload an Image

```bash
curl -X POST http://localhost:8081/api/drivers/1/avatar \
  -F "file=@image.jpg"
```

Expected response:
```json
{
  "message": "Avatar uploaded successfully",
  "avatarUrl": "https://car-sharing-platform-images.s3.amazonaws.com/drivers/1/1704067200000.jpg"
}
```

### Test 2: Check in Frontend

1. Start React app
2. Load home page
3. Driver avatars should display from S3 URLs

### Test 3: Verify in AWS

1. AWS Console → S3
2. Open `car-sharing-platform-images`
3. Navigate to `drivers/1/`
4. You should see the uploaded image

---

## Troubleshooting

### "Access Denied" error when uploading?
- Check AWS credentials are correct
- Verify IAM user has S3 permissions
- Ensure bucket name is correct

### Images not displaying?
- Check S3 bucket public access policy
- Verify avatarUrl is saved in database
- Check image URL in browser (should load)

### "Bucket does not exist" error?
- Verify bucket name matches in properties
- Check bucket is in the correct region
- Bucket name is case-sensitive

---

## Database Schema Update (Optional)

If using SQL database directly:

```sql
-- Update driver table
ALTER TABLE drivers ADD COLUMN avatar_url VARCHAR(500);

-- Migrate data (if you have existing base64 images, skip this)
-- For new drivers, avatarUrl will be set via upload endpoint
```

---

## Production Checklist

- [ ] Created S3 bucket
- [ ] Created IAM user with S3 access
- [ ] Added AWS credentials to environment
- [ ] Added Java files to backend
- [ ] Updated pom.xml dependencies
- [ ] Updated Driver entity
- [ ] Updated API endpoint
- [ ] Tested image upload
- [ ] Tested image display
- [ ] Updated database schema
- [ ] Deployed to production

---

## What Changed

| Aspect | Before | After |
|--------|--------|-------|
| Image Storage | Database (base64) | AWS S3 |
| Image Size | Full image in DB | Resized to 200x200 in S3 |
| Image Type | base64 string | HTTPS URL |
| Frontend Processing | Convert base64 to data URL | Use URL directly |
| Database Size | Large (100KB+ per image) | Small (just URL) |
| Load Time | Slower (data in DB) | Faster (CDN) |

---

## Example Frontend Code (No Changes Needed)

```javascript
// This already works with S3 URLs!
<AvatarImage src={trip.driver.avatar} alt={trip.driver.name} />

// S3 URL format:
// https://car-sharing-platform-images.s3.amazonaws.com/drivers/1/1704067200000.jpg
```

---

## Next Steps (Optional Enhancements)

1. **CloudFront**: Add CDN for global faster delivery
2. **Lifecycle Policy**: Auto-delete old unused images after 30 days
3. **Image Optimization**: Support WebP format
4. **Batch Upload**: Admin panel to upload multiple driver images
5. **Image Analytics**: Track which drivers' images are viewed most

