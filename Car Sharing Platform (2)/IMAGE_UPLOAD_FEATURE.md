# Profile Image Upload to Amazon S3 - Feature Documentation

## Overview
Added a comprehensive **Image Upload** feature to the UserProfile component that allows users to upload their profile pictures directly to Amazon S3 with automatic URL conversion.

## Features Implemented

### 1. **Image Upload in Edit Mode**
- Camera icon button appears on the avatar when in edit mode
- Click to open file picker and select image
- Only image files accepted (image/* MIME type)
- Maximum file size: 5MB

### 2. **File Validation**
- **Type Check**: Only image files are accepted
- **Size Check**: Maximum 5MB file size limit
- **User Feedback**: Alert messages for validation errors

### 3. **Image Preview**
- Local preview before uploading
- Shows S3 URL after successful upload
- Preview displayed in avatar area during edit

### 4. **S3 Integration**
- Automatic upload to Amazon S3
- Receives S3 URL in response
- Stores URL in user profile
- No base64 encoding needed (direct S3 link)

### 5. **Upload Status Indicator**
- Loading spinner during upload
- Disabled state for upload button while uploading
- Success/error feedback to user

## Code Changes

### Frontend Changes

#### UserProfile.jsx Updates:

**New Icons:**
```jsx
import { Camera, Upload } from 'lucide-react';
```

**New State:**
```jsx
const [isUploadingImage, setIsUploadingImage] = useState(false);
const [previewImage, setPreviewImage] = useState(null);
```

**New Handler Function:**
```jsx
const handleImageUpload = async (e) => {
  // File validation (type & size)
  // Preview generation
  // S3 upload via API
  // Success/error handling
};
```

**Updated getImageUrl():**
```jsx
const getImageUrl = () => {
  if (previewImage) return previewImage;  // Use preview first
  if (user1?.image) { ... }               // Fallback to stored image
};
```

**Avatar UI Changes:**
- Added camera icon button in edit mode
- Added file input (hidden)
- Added upload status spinner
- Clickable to select image file

### Backend Changes

#### userservice.jsx (NEW API):
```jsx
// 16. UPLOAD PROFILE IMAGE (to S3)
export const uploadProfileImage = (userId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post(`${BASE_URL}/users/${userId}/upload-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
```

**API Endpoint:** `POST /gotogether/users/{userId}/upload-image`

**Request:**
- Multipart form data with file field
- Content-Type: multipart/form-data

**Response:**
```json
{
  "imageUrl": "https://car-sharing-platform-images.s3.amazonaws.com/drivers/1/1704067200000.jpg"
}
```

## User Flow

1. **Click Edit Profile** - User enters edit mode
2. **Camera Icon Appears** - On the avatar image
3. **Click Camera Icon** - Opens file picker
4. **Select Image** - Choose image file (max 5MB)
5. **Validation Check** - File type and size validated
6. **Preview Shows** - Local preview appears immediately
7. **Upload to S3** - Image uploaded to Amazon S3
8. **URL Received** - S3 URL replaces preview
9. **Save Profile** - When user clicks "Save Changes"
10. **Profile Updated** - Image URL stored in database

## Validation Rules

| Rule | Details |
|------|---------|
| **File Type** | image/* only (jpg, png, gif, webp, etc.) |
| **File Size** | Maximum 5MB |
| **Feedback** | User-friendly error messages |
| **Upload Status** | Visual indicator during upload |

## Error Handling

- **Invalid file type** → Alert: "Please select an image file"
- **File too large** → Alert: "Image size must be less than 5MB"
- **Upload failure** → Alert: "Failed to upload image"
- **Network error** → Handled by axios interceptor

## S3 Storage Structure

**Bucket:** `car-sharing-platform-images`

**URL Format:**
```
https://car-sharing-platform-images.s3.amazonaws.com/drivers/{userId}/{timestamp}.{ext}
```

**Example:**
```
https://car-sharing-platform-images.s3.amazonaws.com/drivers/1/1704067200000.jpg
```

## Integration Points

### Component Integration:
- Seamlessly integrated with existing edit mode
- Works with profile update flow
- Non-blocking (user can cancel anytime)

### API Integration:
- Uses axios FormData for multipart upload
- Compatible with existing auth interceptors
- Proper error handling chain

### State Management:
- Preview image managed locally
- Cleared on cancel
- Persisted on save

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support (with camera access)

## Performance Considerations

- **Client-side validation** - Instant feedback
- **Streaming upload** - Efficient for large files
- **Async operation** - Non-blocking UI
- **Compression ready** - Can add image optimization

## Future Enhancements

- [ ] Image cropping before upload
- [ ] Drag-and-drop upload
- [ ] Multiple format support (WebP)
- [ ] Automatic image compression
- [ ] Progress bar for upload
- [ ] Image gallery history
- [ ] Undo/replace functionality
- [ ] Image filters/effects
- [ ] Avatar shape options (circle, square, rounded)

## Testing Checklist

- [ ] Upload valid image file
- [ ] Validate file size limit (>5MB rejected)
- [ ] Validate file type (non-image rejected)
- [ ] Preview appears before upload
- [ ] Loading spinner shows during upload
- [ ] S3 URL received and displayed
- [ ] Cancel clears preview
- [ ] Save persists the image URL
- [ ] Profile displays new image on reload
- [ ] Works on mobile devices

## Security Considerations

- ✅ Client-side file validation
- ✅ Server-side validation required
- ✅ Multipart form data (standard)
- ✅ HTTPS encryption
- ✅ Authentication via JWT token
- ✅ File type whitelist recommended on backend

## API Contract

**Endpoint:** `POST /gotogether/users/{userId}/upload-image`

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Body:**
```
file: <binary image data>
```

**Success Response (200):**
```json
{
  "imageUrl": "https://car-sharing-platform-images.s3.amazonaws.com/drivers/1/1704067200000.jpg"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid file type",
  "message": "Only image files are allowed"
}
```

**Error Response (413):**
```json
{
  "error": "File too large",
  "message": "Maximum file size is 5MB"
}
```
