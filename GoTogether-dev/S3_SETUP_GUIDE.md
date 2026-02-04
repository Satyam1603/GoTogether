# S3 Integration Setup Guide

## Overview
The GoTogether User Service now supports uploading profile images to AWS S3 instead of storing them as large BLOB fields in the database. This improves performance, scalability, and cost efficiency.

## Prerequisites
- AWS Account with S3 bucket created
- AWS Access Key ID and Secret Access Key
- Maven and Java 21+

## Step 1: Create AWS S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com)
2. Click "Create Bucket"
3. Enter bucket name (e.g., `gotogether-user-images`)
4. Choose region (e.g., `us-east-1`)
5. Block public access if you want private bucket (you can use pre-signed URLs)
6. Create bucket

## Step 2: Create IAM User with S3 Permissions

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam)
2. Create new user or use existing
3. Attach policy: `AmazonS3FullAccess` or create custom policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::gotogether-user-images/*"
        }
    ]
}
```
4. Generate Access Key ID and Secret Access Key

## Step 3: Configure AWS Credentials

Choose one of the following methods:

### Option A: Environment Variables (Recommended for Production)
```bash
# Windows CMD
set AWS_ACCESS_KEY_ID=your_access_key_id
set AWS_SECRET_ACCESS_KEY=your_secret_access_key

# Linux/Mac
export AWS_ACCESS_KEY_ID=your_access_key_id
export AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

### Option B: AWS Credentials File (~/.aws/credentials)
```
[default]
aws_access_key_id = your_access_key_id
aws_secret_access_key = your_secret_access_key
```

### Option C: application.properties (Development Only - NOT for Production)
Add to `application.properties`:
```properties
aws.s3.bucket=gotogether-user-images
aws.s3.region=us-east-1
```

## Step 4: Update application.properties

Edit `src/main/resources/application.properties`:

```properties
# AWS S3 Configuration
aws.s3.bucket=gotogether-user-images
aws.s3.region=us-east-1
# aws.s3.endpoint=http://localhost:4566  # Uncomment for LocalStack testing
```

Replace:
- `gotogether-user-images` with your actual bucket name
- `us-east-1` with your bucket region

## Step 5: Build and Run

```bash
# Build the project
mvnw clean install

# Run the application
mvnw spring-boot:run
```

## API Usage

### Upload Profile Image

**Endpoint:** `POST /gotogether/users/{userId}/upload-image`

**Request:**
- Content-Type: `multipart/form-data`
- Body: file (form field named `file`)

**Example using curl:**
```bash
curl -X POST \
  -F "file=@/path/to/image.jpg" \
  http://localhost:8080/gotogether/users/123/upload-image
```

**Example using frontend (JavaScript/React):**
```javascript
const uploadProfileImage = (userId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post(`http://localhost:8080/gotogether/users/${userId}/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
```

**Response:**
```json
{
  "message": "Profile image uploaded successfully to S3.",
  "status": "SUCCESS",
  "imageUrl": "https://gotogether-user-images.s3.us-east-1.amazonaws.com/users/abc123-1706825678901-image.jpg",
  "userId": 123
}
```

### Get User with Image URL

**Endpoint:** `GET /gotogether/users/{userId}`

**Response includes:**
```json
{
  "id": 123,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNo": "+1234567890",
  "role": "DRIVER",
  "imageUrl": "https://gotogether-user-images.s3.us-east-1.amazonaws.com/users/abc123-1706825678901-image.jpg",
  "emailVerified": true,
  "phoneVerified": true
}
```

### Get Compact User (with Image URL)

**Endpoint:** `GET /gotogether/users/public/{userId}/compact`

**Response:**
```json
{
  "id": 123,
  "imageUrl": "https://gotogether-user-images.s3.us-east-1.amazonaws.com/users/abc123-1706825678901-image.jpg",
  "imageBase64": null
}
```

## Testing with LocalStack (Local S3 Mock)

For local development without AWS account:

### Step 1: Start LocalStack
```bash
docker run -it -p 4566:4566 localstack/localstack
```

### Step 2: Create S3 bucket
```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://gotogether-user-images
```

### Step 3: Update application.properties
```properties
aws.s3.bucket=gotogether-user-images
aws.s3.region=us-east-1
aws.s3.endpoint=http://localhost:4566
```

### Step 4: Set dummy AWS credentials
```bash
set AWS_ACCESS_KEY_ID=test
set AWS_SECRET_ACCESS_KEY=test
```

## Database Migration

The system maintains backward compatibility:
- Old images stored as `byte[] image` (MEDIUMBLOB) in DB still work
- New images are stored as S3 URLs in `imageUrl` column
- API prioritizes S3 URL if available, falls back to base64 encoding of bytes

If migrating existing images:
1. Implement a migration script to upload existing images to S3
2. Update imageUrl field for each user
3. Optionally delete the bytes field to free storage

## File Size Limits

Default: 10 MB (configurable in pom.xml)

To change add to `application.properties`:
```properties
spring.servlet.multipart.max-file-size=50MB
spring.servlet.multipart.max-request-size=50MB
```

## Security Considerations

1. **Bucket Policy:** Ensure bucket is not public unless needed
2. **IAM User:** Use specific IAM user with minimal permissions
3. **Credentials:** Never commit credentials to version control
4. **Pre-signed URLs:** For private buckets, use pre-signed URLs for public access
5. **Encryption:** Enable S3 default encryption for bucket

## Troubleshooting

### "The AWS Access Key Id you provided does not exist"
- Verify AWS_ACCESS_KEY_ID environment variable is set correctly
- Check IAM user has S3 permissions

### "Access Denied" error
- Verify IAM user has `s3:PutObject` permission on bucket
- Check bucket policy doesn't block uploads

### "NoSuchBucket" error
- Verify bucket name in application.properties matches AWS bucket name
- Verify bucket exists in specified region

### LocalStack connection refused
- Ensure LocalStack Docker container is running
- Verify endpoint URL is correct: `http://localhost:4566`

## Performance Tips

1. **Use CloudFront CDN** to cache and deliver images globally
2. **Image Optimization:** Compress images before upload on frontend
3. **Async Upload:** Consider async S3 uploads for large files
4. **Presigned URLs:** Use for direct S3 uploads from frontend (bypassing backend)

## Next Steps

1. Test with sample image upload
2. Monitor S3 costs and set lifecycle policies
3. Implement image resizing (thumbnail generation)
4. Add CloudFront CDN for faster image delivery
5. Set up S3 lifecycle rules to delete old uploads after X days
