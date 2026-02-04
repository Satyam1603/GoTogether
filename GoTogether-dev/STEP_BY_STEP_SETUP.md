# Step-by-Step Configuration Guide

## Prerequisites Check

Before starting, ensure you have:
- [ ] Java 21+ installed
- [ ] Maven installed
- [ ] AWS account (or LocalStack for testing)
- [ ] An S3 bucket created (or ready to create)
- [ ] Code editor/IDE (Eclipse, IntelliJ, VS Code)

---

## Part 1: AWS Setup (5 minutes)

### Option A: Using AWS Account

#### Step 1.1: Create S3 Bucket
1. Go to https://s3.console.aws.amazon.com
2. Click "Create Bucket"
3. Enter bucket name: `gotogether-user-images` (or your preferred name)
4. Choose region: `us-east-1` (or your preferred region)
5. Click "Create Bucket"
6. Note down the bucket name and region

#### Step 1.2: Create IAM User
1. Go to https://console.aws.amazon.com/iam
2. Click "Users" → "Create User"
3. Enter username: `gotogether-s3-user`
4. Click "Next"
5. Click "Attach Policies Directly"
6. Search for `AmazonS3FullAccess` and select it
7. Click "Next" → "Create User"
8. Click on the user you just created
9. Click "Security Credentials" tab
10. Click "Create Access Key"
11. Choose "Application running outside AWS"
12. Click "Next"
13. Copy and save:
    - Access Key ID
    - Secret Access Key
14. Click "Done"

**⚠️ Keep these credentials safe!**

### Option B: Using LocalStack (No AWS Account Needed)

```bash
# Step 1: Start LocalStack
docker run -it -p 4566:4566 localstack/localstack

# Step 2: In another terminal, create bucket
aws --endpoint-url=http://localhost:4566 s3 mb s3://gotogether-user-images

# Note: Use dummy credentials
# AWS_ACCESS_KEY_ID=test
# AWS_SECRET_ACCESS_KEY=test
```

---

## Part 2: Project Configuration (5 minutes)

### Step 2.1: Set AWS Credentials

#### Windows (CMD)
```batch
set AWS_ACCESS_KEY_ID=your_access_key_id_here
set AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
```

#### Windows (PowerShell)
```powershell
$env:AWS_ACCESS_KEY_ID="your_access_key_id_here"
$env:AWS_SECRET_ACCESS_KEY="your_secret_access_key_here"
```

#### Linux/Mac
```bash
export AWS_ACCESS_KEY_ID=your_access_key_id_here
export AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
```

#### Verify (All platforms)
```bash
# Windows CMD/PowerShell
echo %AWS_ACCESS_KEY_ID%
echo %AWS_SECRET_ACCESS_KEY%

# Linux/Mac
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
```

### Step 2.2: Update application.properties

Edit `src/main/resources/application.properties`:

```properties
# AWS S3 Configuration
aws.s3.bucket=gotogether-user-images
aws.s3.region=us-east-1
# aws.s3.endpoint=http://localhost:4566  # Uncomment if using LocalStack
```

**For AWS:** Keep endpoint commented
**For LocalStack:** Uncomment the endpoint line

---

## Part 3: Build Project (3 minutes)

### Step 3.1: Clean Build

```bash
# Navigate to project root
cd path\to\GoTogether-dev

# Clean and build
mvnw clean install

# Expected output: BUILD SUCCESS
```

### Step 3.2: Check for Errors

If build fails:
1. Check Java version: `java -version` (should be 21+)
2. Check Maven: `mvn -version`
3. Check internet connection (downloading dependencies)
4. Delete `target` folder and retry: `mvnw clean install`

---

## Part 4: Start Application (2 minutes)

### Step 4.1: Run Application

```bash
# Option 1: Run from Maven
mvnw spring-boot:run

# Option 2: Run from IDE (Eclipse/IntelliJ)
# Right-click project → Run As → Spring Boot App
```

### Step 4.2: Verify Startup

Look for these messages:
```
Tomcat started on port(s): 8080
Started GotogetherUserServiceApplication
```

If you see errors:
1. Check AWS credentials are set
2. Check S3 bucket exists
3. Check application.properties
4. Review error message carefully

---

## Part 5: Test Upload (5 minutes)

### Step 5.1: Create Test Image

Create a simple test image or use an existing one. We'll assume: `test-image.jpg`

### Step 5.2: Upload Using cURL

```bash
# Replace:
# - 123 with a real user ID from your database
# - test-image.jpg with your image path

curl -X POST \
  -F "file=@test-image.jpg" \
  http://localhost:8080/gotogether/users/123/upload-image
```

### Step 5.3: Expected Response

```json
{
  "message": "Profile image uploaded successfully to S3.",
  "status": "SUCCESS",
  "imageUrl": "https://gotogether-user-images.s3.us-east-1.amazonaws.com/users/abc123-1706825678901-test-image.jpg",
  "userId": 123
}
```

### Step 5.4: Verify Image

1. Copy the `imageUrl` from response
2. Open in browser
3. Should display the uploaded image
4. Try downloading to verify

### Step 5.5: Verify in Database

```sql
-- Connect to your database
-- Check if imageUrl was saved

SELECT id, image_url FROM users WHERE user_id = 123;

-- You should see the S3 URL
```

---

## Part 6: Test All Endpoints (5 minutes)

### Test 6.1: Get User Profile

```bash
curl http://localhost:8080/gotogether/users/123
```

**Expected:** Response includes `"imageUrl": "https://..."`

### Test 6.2: Get Compact User

```bash
curl http://localhost:8080/gotogether/users/public/123/compact
```

**Expected:** Response includes imageUrl

### Test 6.3: Batch Compact Users

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d "[123, 124, 125]" \
  http://localhost:8080/gotogether/users/public/compact/batch
```

**Expected:** Array of users with imageUrls

---

## Part 7: Frontend Testing (10 minutes)

### Test 7.1: React Example

```jsx
import axios from 'axios';

function UploadImage() {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(
        `http://localhost:8080/gotogether/users/123/upload-image`,
        formData
      );
      console.log('Success:', response.data.imageUrl);
      // Display image
      document.getElementById('image').src = response.data.imageUrl;
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <div>
      <input type="file" onChange={handleUpload} />
      <img id="image" alt="Profile" />
    </div>
  );
}
```

### Test 7.2: Postman

1. Open Postman
2. Create POST request
3. URL: `http://localhost:8080/gotogether/users/123/upload-image`
4. Body → form-data
5. Key: `file` → Value: select image file
6. Click Send
7. Response should show imageUrl

---

## Troubleshooting Guide

### Problem: "NoSuchBucket"

**Cause:** Bucket name doesn't exist or region is wrong

**Solution:**
```bash
# Verify bucket exists
aws s3 ls

# If using LocalStack
aws --endpoint-url=http://localhost:4566 s3 ls
```

### Problem: "Access Denied"

**Cause:** IAM user doesn't have S3 permissions

**Solution:**
1. Go to IAM Console
2. Find your user
3. Click "Attach Policies"
4. Attach "AmazonS3FullAccess"

### Problem: "The AWS Access Key Id does not exist"

**Cause:** AWS credentials not set or wrong

**Solution:**
```bash
# Verify credentials are set
echo %AWS_ACCESS_KEY_ID%  # Windows
echo $AWS_ACCESS_KEY_ID  # Linux/Mac

# If not set, set them again (use actual values)
set AWS_ACCESS_KEY_ID=your_actual_key
set AWS_SECRET_ACCESS_KEY=your_actual_secret
```

### Problem: Upload returns null imageUrl

**Cause:** S3Service not properly injected

**Solution:**
1. Check UserServiceImpl has S3Service injected
2. Verify S3Properties is annotated with @Component
3. Rebuild: `mvnw clean install`
4. Restart application

### Problem: Can't connect to LocalStack

**Cause:** Container not running

**Solution:**
```bash
# Check if running
docker ps

# Start if needed
docker run -it -p 4566:4566 localstack/localstack

# Verify connection
curl http://localhost:4566
```

---

## Complete Test Checklist

After completing all steps, verify:

- [ ] AWS credentials set and verified
- [ ] application.properties updated correctly
- [ ] Project builds without errors
- [ ] Application starts successfully
- [ ] Image upload endpoint works (cURL test)
- [ ] Response includes imageUrl
- [ ] Image is accessible at S3 URL
- [ ] User profile returns imageUrl
- [ ] Compact endpoints return imageUrl
- [ ] Database stores S3 URL (not bytes)
- [ ] Frontend can upload and display image

---

## Quick Reference: Environment Variables

### Windows CMD
```batch
set AWS_ACCESS_KEY_ID=your_key
set AWS_SECRET_ACCESS_KEY=your_secret
```

### Windows PowerShell
```powershell
$env:AWS_ACCESS_KEY_ID="your_key"
$env:AWS_SECRET_ACCESS_KEY="your_secret"
```

### Linux/Mac
```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
```

### Verify
```bash
# All platforms
curl http://localhost:8080/gotogether/users/1
```

---

## Quick Reference: Key Files

```
GoTogether-dev/
├── pom.xml                         (AWS SDK added)
├── src/main/resources/
│   └── application.properties      (S3 config here)
├── src/main/java/com/gotogether/user/
│   ├── aws/
│   │   ├── S3Properties.java
│   │   └── S3Service.java
│   ├── controller/
│   │   └── UserController.java    (endpoints)
│   └── service/
│       └── UserServiceImpl.java    (upload logic)
```

---

## Support & Help

**Still stuck?**

1. Check logs: Look for error messages in console
2. Read documentation: S3_SETUP_GUIDE.md
3. Review examples: S3_CODE_EXAMPLES.md
4. Check AWS: Verify bucket and credentials in AWS Console
5. Test LocalStack: Use LocalStack instead of AWS for testing

---

## Summary

You should now have:
1. ✅ AWS S3 bucket or LocalStack
2. ✅ Credentials configured
3. ✅ Project built and running
4. ✅ Image upload working
5. ✅ S3 URLs being stored
6. ✅ All endpoints returning image URLs

**Congratulations! 🎉 S3 integration is complete!**

For production deployment:
- Use AWS credentials file instead of environment variables
- Add CloudFront CDN
- Enable S3 encryption
- Set up lifecycle policies
- Monitor S3 costs

---

**Next Steps:** See S3_SETUP_GUIDE.md for production configuration
