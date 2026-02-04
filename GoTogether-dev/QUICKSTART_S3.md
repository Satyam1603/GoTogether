# Quick Start - S3 Image Upload

## 5-Minute Setup

### 1. Configure AWS Credentials
```bash
# Windows CMD
set AWS_ACCESS_KEY_ID=your_access_key
set AWS_SECRET_ACCESS_KEY=your_secret_key

# Linux/Mac
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
```

### 2. Update application.properties
```properties
aws.s3.bucket=your-bucket-name
aws.s3.region=us-east-1
```

### 3. Build & Run
```bash
mvnw clean install
mvnw spring-boot:run
```

### 4. Upload Image
```bash
curl -X POST \
  -F "file=@image.jpg" \
  http://localhost:8080/gotogether/users/123/upload-image
```

### 5. Get Response
```json
{
  "message": "Profile image uploaded successfully to S3.",
  "status": "SUCCESS",
  "imageUrl": "https://your-bucket.s3.us-east-1.amazonaws.com/users/abc123-timestamp-image.jpg",
  "userId": 123
}
```

## What Changed

| Item | Before | After |
|------|--------|-------|
| Image Storage | Database (byte[]) | AWS S3 |
| Image Field | `byte[] image` | `String imageUrl` |
| Upload Response | Simple message | ImageUploadResponseDTO with URL |
| File Size | Limited by DB | Limited by S3 quotas |
| Access | Base64 encoding | Direct S3 URL (faster) |

## Files Added
1. `src/main/java/com/gotogether/user/aws/S3Properties.java` - Config properties
2. `src/main/java/com/gotogether/user/aws/S3Service.java` - S3 upload service
3. `src/main/java/com/gotogether/user/dto/ImageUploadResponseDTO.java` - Response DTO
4. `S3_SETUP_GUIDE.md` - Detailed setup guide
5. `S3_IMPLEMENTATION_SUMMARY.md` - Implementation details

## Files Modified
1. `pom.xml` - Added AWS S3 SDK
2. `application.properties` - Added S3 config
3. `User.java` - Added imageUrl field
4. `UserResponseDTO.java` - Added imageUrl field
5. `UserCompactDTO.java` - Added imageUrl field
6. `UserServiceImpl.java` - Updated uploadProfileImage to use S3
7. `UserController.java` - Updated upload endpoint and public endpoints

## Frontend Integration

```javascript
// React/Vue example
const uploadImage = async (userId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(
    `http://localhost:8080/gotogether/users/${userId}/upload-image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  
  console.log('Image URL:', response.data.imageUrl);
  return response.data;
};

// Usage
const handleFileUpload = (event, userId) => {
  const file = event.target.files[0];
  uploadImage(userId, file)
    .then(data => {
      console.log('Success:', data.imageUrl);
      // Update user profile with new image URL
    })
    .catch(err => console.error('Upload failed:', err));
};
```

## Local Testing (No AWS Account Required)

```bash
# Start LocalStack
docker run -it -p 4566:4566 localstack/localstack

# Create bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://gotogether-user-images

# Update application.properties
aws.s3.bucket=gotogether-user-images
aws.s3.region=us-east-1
aws.s3.endpoint=http://localhost:4566

# Set dummy credentials
set AWS_ACCESS_KEY_ID=test
set AWS_SECRET_ACCESS_KEY=test

# Run app
mvnw spring-boot:run
```

## Troubleshooting

### Error: "The AWS Access Key Id you provided does not exist"
→ Check AWS_ACCESS_KEY_ID environment variable

### Error: "Access Denied"
→ Check IAM user has s3:PutObject permission

### Error: "NoSuchBucket"
→ Check bucket name and region match

### Image URL not returned
→ Verify S3Service is properly injected in UserServiceImpl

## Next Steps

1. ✅ Upload works → Move to production AWS account
2. ✅ Production setup → Add CloudFront CDN for caching
3. ✅ CDN working → Implement image resizing
4. ✅ All working → Set up lifecycle policies to auto-delete old images

## Support

- S3_SETUP_GUIDE.md - Complete configuration guide
- S3_IMPLEMENTATION_SUMMARY.md - Technical details
- AWS SDK Docs - https://docs.aws.amazon.com/sdk-for-java/latest/developer-guide/
