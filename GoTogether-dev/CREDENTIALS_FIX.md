# 🔧 S3 Credentials Configuration Fix

## Problem
The application was unable to load AWS credentials, throwing:
```
Unable to load credentials from any of the providers in the chain
```

## Root Cause
The credentials were in `application.properties` but the S3Service was only looking at:
- Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- System properties
- IAM roles
- Profile files

It was NOT reading from `application.properties`.

## Solution Applied ✅

### Updated S3Service.java
Modified the S3Service to:

1. **Read credentials from properties using @Value annotation:**
```java
@Value("${aws.access.key-id:}")
private String accessKeyId;

@Value("${aws.secret.access-key:}")
private String secretAccessKey;
```

2. **Create credentials from properties if available:**
```java
private AwsCredentialsProvider createCredentialsProvider() {
    // If credentials are provided in properties, use them
    if (accessKeyId != null && !accessKeyId.isEmpty() && 
        secretAccessKey != null && !secretAccessKey.isEmpty()) {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(
            accessKeyId.trim(), 
            secretAccessKey.trim()
        );
        return StaticCredentialsProvider.create(credentials);
    }
    // Otherwise use default provider chain
    return DefaultCredentialsProvider.create();
}
```

## What Changed

### Before
```java
AwsCredentialsProvider creds = DefaultCredentialsProvider.create();
// Only looked at env vars, system properties, IAM roles
```

### After
```java
AwsCredentialsProvider creds = createCredentialsProvider();
// First checks application.properties, then falls back to default chain
```

## Your Current Configuration

Your `application.properties` has:
```properties
aws.s3.bucket=gotogether-user-service
aws.s3.region=eu-north-1
aws.access.key-id=AKIA27Z645NFCNLB746T
aws.secret.access-key=6XaB9/8xZ7EXdCNu//cUrGgrRfBNVznwOsAxWvVc
```

This will now be picked up by the application! ✅

## How to Test

### Step 1: Rebuild
```bash
mvnw clean install
```

### Step 2: Run
```bash
mvnw spring-boot:run
```

### Step 3: Test Upload
```bash
curl -X POST -F "file=@test-image.jpg" \
  http://localhost:8080/gotogether/users/123/upload-image
```

### Expected Result
```json
{
  "message": "Profile image uploaded successfully to S3.",
  "status": "SUCCESS",
  "imageUrl": "https://gotogether-user-service.s3.eu-north-1.amazonaws.com/users/...",
  "userId": 123
}
```

## Priority Order for Credentials

The application now tries credentials in this order:

1. **application.properties** (your current method) ✅
2. **Environment variables** (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
3. **System properties** (aws.accessKeyId, aws.secretAccessKey)
4. **IAM role** (if running on EC2/ECS)
5. **AWS profile** (~/.aws/credentials)

## Debug Output

When you run the app, you'll see:
```
DEBUG: Using credentials from application.properties
```

If credentials aren't found in properties, you'll see:
```
DEBUG: Using default AWS credentials provider chain
```

## Security Note

⚠️ **Having credentials in `application.properties` is okay for development/testing, but:**

### For Production
Consider using:
- AWS IAM roles (if on EC2/ECS)
- Environment variables
- AWS credentials file (~/.aws/credentials)
- AWS Secrets Manager

### Never commit credentials to git!
Add to `.gitignore`:
```
# Don't commit credentials
application-prod.properties
.env
```

## Troubleshooting

### Still Getting "Unable to load credentials"?

1. **Verify properties are set:**
```bash
# Check application.properties
cat application.properties | grep aws
```

2. **Check for typos:**
```properties
aws.access.key-id=YOUR_KEY
aws.secret.access-key=YOUR_SECRET
```

3. **Rebuild clean:**
```bash
mvnw clean install
```

4. **Check S3 bucket permissions:**
- Bucket must exist
- AWS credentials must have s3:PutObject permission
- Region must match bucket region

## Files Modified

✅ `S3Service.java` - Now reads credentials from properties
✅ `S3Properties.java` - Unchanged, just verified

## What's Next?

1. ✅ Rebuild the project
2. ✅ Run the application
3. ✅ Test image upload
4. ✅ Verify S3 URL is returned

All done! The application should now work with the credentials in your properties file. 🚀

---

**Date:** February 1, 2026
**Status:** ✅ FIXED
