# S3 Integration - Code Examples

## Frontend Examples

### React with Axios
```jsx
import axios from 'axios';
import React, { useState } from 'react';

function ProfileImageUpload({ userId }) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `http://localhost:8080/gotogether/users/${userId}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setImageUrl(response.data.imageUrl);
      console.log('Upload successful:', response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="profile-image-upload">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {imageUrl && (
        <div>
          <p>✅ Image uploaded successfully!</p>
          <img src={imageUrl} alt="Profile" style={{ maxWidth: '200px' }} />
          <p>URL: {imageUrl}</p>
        </div>
      )}
    </div>
  );
}

export default ProfileImageUpload;
```

### Vue.js with Axios
```vue
<template>
  <div class="profile-image-upload">
    <input 
      type="file" 
      accept="image/*" 
      @change="handleUpload"
      :disabled="uploading"
    />
    <p v-if="uploading">Uploading...</p>
    <p v-if="error" style="color: red;">Error: {{ error }}</p>
    <div v-if="imageUrl">
      <p>✅ Image uploaded successfully!</p>
      <img :src="imageUrl" alt="Profile" style="max-width: 200px;" />
      <p>URL: {{ imageUrl }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: {
    userId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      uploading: false,
      imageUrl: null,
      error: null
    };
  },
  methods: {
    async handleUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.uploading = true;
      this.error = null;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(
          `http://localhost:8080/gotogether/users/${this.userId}/upload-image`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        this.imageUrl = response.data.imageUrl;
        console.log('Upload successful:', response.data);
      } catch (err) {
        this.error = err.response?.data?.message || 'Upload failed';
        console.error('Upload error:', err);
      } finally {
        this.uploading = false;
      }
    }
  }
};
</script>
```

### Plain JavaScript
```javascript
function uploadProfileImage(userId, fileInputElement) {
  const file = fileInputElement.files[0];
  if (!file) {
    alert('Please select a file');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  fetch(`http://localhost:8080/gotogether/users/${userId}/upload-image`, {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  })
  .then(data => {
    console.log('Success:', data);
    document.getElementById('profile-image').src = data.imageUrl;
    document.getElementById('image-url').textContent = data.imageUrl;
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Upload failed: ' + error.message);
  });
}

// Usage in HTML
// <input type="file" id="imageInput" accept="image/*" />
// <button onclick="uploadProfileImage(123, document.getElementById('imageInput'))">Upload</button>
// <img id="profile-image" alt="Profile" />
// <p id="image-url"></p>
```

## Backend Examples

### Java - Direct S3 Upload
```java
@RestController
@RequestMapping("/api/direct-upload")
@AllArgsConstructor
public class DirectUploadController {
    
    private final S3Service s3Service;
    private final UserRepository userRepository;
    
    @PostMapping("/prepare")
    public ResponseEntity<?> prepareDirectUpload(
            @RequestParam Long userId,
            @RequestParam String filename) {
        
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Generate S3 key
            String key = "users/" + UUID.randomUUID() + "-" + filename;
            
            // Generate pre-signed URL (15 minutes valid)
            // Note: Would need additional method in S3Service
            String presignedUrl = s3Service.generatePresignedUploadUrl(key, 15);
            
            return ResponseEntity.ok(new PreSignedUrlResponse(presignedUrl, key));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
```

### Java - Batch User Image Retrieval
```java
@RestController
@AllArgsConstructor
public class UserBatchController {
    
    private final UserService userService;
    
    @PostMapping("/api/users/batch-images")
    public ResponseEntity<?> getUserImages(@RequestBody List<Long> userIds) {
        List<UserImageDTO> results = new ArrayList<>();
        
        for (Long userId : userIds) {
            try {
                UserResponseDTO user = userService.getUserDetailsById(userId);
                UserImageDTO dto = new UserImageDTO(
                    userId,
                    user.getImageUrl(),
                    user.getFirstName() + " " + user.getLastName()
                );
                results.add(dto);
            } catch (Exception e) {
                // Skip users not found
            }
        }
        
        return ResponseEntity.ok(results);
    }
}

// DTO
@Data
@AllArgsConstructor
class UserImageDTO {
    private Long userId;
    private String imageUrl;
    private String userName;
}
```

### Java - Image Upload with Validation
```java
@Service
@Slf4j
public class ValidatedImageUploadService {
    
    private final S3Service s3Service;
    private final UserRepository userRepository;
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final Set<String> ALLOWED_TYPES = 
        Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    
    public String uploadProfileImageWithValidation(
            Long userId, 
            MultipartFile file) throws ValidationException {
        
        // Validate file exists
        if (file == null || file.isEmpty()) {
            throw new ValidationException("File is empty");
        }
        
        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("File size exceeds 10MB limit");
        }
        
        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ValidationException("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
        }
        
        // Validate filename
        String filename = file.getOriginalFilename();
        if (filename == null || filename.contains("..")) {
            throw new ValidationException("Invalid filename");
        }
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        try {
            byte[] fileBytes = file.getBytes();
            String s3Url = s3Service.uploadBytes(fileBytes, filename, contentType);
            user.setImageUrl(s3Url);
            userRepository.save(user);
            
            log.info("Image uploaded for user {}: {}", userId, s3Url);
            return s3Url;
        } catch (IOException e) {
            log.error("Failed to read file", e);
            throw new ValidationException("Failed to read uploaded file");
        }
    }
}
```

### Java - Async Image Upload
```java
@Service
@Slf4j
public class AsyncImageUploadService {
    
    private final S3Service s3Service;
    private final UserRepository userRepository;
    private final AsyncExecutor asyncExecutor;
    
    @Async
    public CompletableFuture<String> uploadProfileImageAsync(
            Long userId,
            MultipartFile file) {
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
                byte[] fileBytes = file.getBytes();
                String s3Url = s3Service.uploadBytes(
                    fileBytes, 
                    file.getOriginalFilename(), 
                    file.getContentType()
                );
                
                user.setImageUrl(s3Url);
                userRepository.save(user);
                
                log.info("Image uploaded async for user {}: {}", userId, s3Url);
                return s3Url;
            } catch (Exception e) {
                log.error("Async upload failed for user {}", userId, e);
                throw new RuntimeException("Upload failed: " + e.getMessage());
            }
        });
    }
}

// Controller
@RestController
@AllArgsConstructor
public class AsyncUploadController {
    
    private final AsyncImageUploadService asyncService;
    
    @PostMapping("/{userId}/upload-image-async")
    public ResponseEntity<?> uploadAsync(
            @PathVariable Long userId,
            @RequestPart("file") MultipartFile file) {
        
        asyncService.uploadProfileImageAsync(userId, file)
            .thenAccept(url -> {
                log.info("Upload completed: {}", url);
                // Could send notification or event
            })
            .exceptionally(ex -> {
                log.error("Upload failed", ex);
                return null;
            });
        
        return ResponseEntity.accepted()
            .body(new UploadAcceptedResponse("Upload in progress", userId));
    }
}
```

## Testing Examples

### JUnit 5 Test
```java
@SpringBootTest
@Transactional
class ImageUploadServiceTest {
    
    @Autowired
    private UserService userService;
    
    @MockBean
    private S3Service s3Service;
    
    @Test
    void testUploadProfileImage() throws IOException {
        // Arrange
        Long userId = 1L;
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "image.jpg",
            "image/jpeg",
            "test image content".getBytes()
        );
        
        String expectedUrl = "https://bucket.s3.region.amazonaws.com/users/abc123.jpg";
        when(s3Service.uploadBytes(
            any(byte[].class),
            eq("image.jpg"),
            eq("image/jpeg")
        )).thenReturn(expectedUrl);
        
        // Act
        userService.uploadProfileImage(userId, file);
        
        // Assert
        UserResponseDTO user = userService.getUserDetailsById(userId);
        assertEquals(expectedUrl, user.getImageUrl());
        
        verify(s3Service, times(1)).uploadBytes(
            any(byte[].class),
            eq("image.jpg"),
            eq("image/jpeg")
        );
    }
}
```

### cURL Test
```bash
#!/bin/bash

# Set variables
USER_ID=123
FILE_PATH="./test-image.jpg"
API_URL="http://localhost:8080/gotogether/users"

# Upload image
echo "Uploading image..."
RESPONSE=$(curl -s -X POST \
  -F "file=@${FILE_PATH}" \
  "${API_URL}/${USER_ID}/upload-image")

echo "Response:"
echo $RESPONSE | jq .

# Extract image URL
IMAGE_URL=$(echo $RESPONSE | jq -r '.imageUrl')
echo "Image URL: $IMAGE_URL"

# Get user and verify
echo "Verifying upload..."
curl -s "${API_URL}/${USER_ID}" | jq '.imageUrl'
```

## Environment Configuration

### Docker Compose with LocalStack
```yaml
version: '3.8'
services:
  localstack:
    image: localstack/localstack
    ports:
      - "4566:4566"
    environment:
      SERVICES: s3
      DOCKER_HOST: unix:///var/run/docker.sock
      AWS_DEFAULT_REGION: us-east-1
    volumes:
      - ./localstack-init.sh:/docker-entrypoint-initaws.d/init.sh

  app:
    build: .
    ports:
      - "8080:8080"
    depends_on:
      - localstack
    environment:
      AWS_S3_BUCKET: gotogether-user-images
      AWS_S3_REGION: us-east-1
      AWS_S3_ENDPOINT: http://localstack:4566
      AWS_ACCESS_KEY_ID: test
      AWS_SECRET_ACCESS_KEY: test
```

### LocalStack Init Script
```bash
#!/bin/bash
echo "Creating S3 bucket..."
awslocal s3 mb s3://gotogether-user-images
echo "S3 bucket created!"
```
