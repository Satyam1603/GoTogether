# Update Profile Feature Documentation

## Overview
Added a comprehensive **Update Profile** feature to the UserProfile component that allows users to edit their profile information in real-time.

## Features Implemented

### 1. **Edit Mode Toggle**
- Users can click "Edit Profile" button to enter edit mode
- Edit and Cancel buttons replace action buttons in edit mode
- Save changes functionality with loading state

### 2. **Editable Fields**
The following user fields are now editable:
- **First Name** - User's first name
- **Last Name** - User's last name
- **Location** - Current location (e.g., "Indore MP")
- **Phone Number** - Contact phone number
- **Bio** - User biography/about text (textarea)
- **Travel Preferences**:
  - Chattiness (I love to chat / I prefer quiet rides / No preference)
  - Music (Silence is golden / I love music / Podcasts only)
  - Smoking (No smoking / Smoking allowed)
  - Pets (Pets allowed / No pets)

### 3. **UI Components Used**
- `Input` - For text fields (name, location, phone)
- `Textarea` - For bio/description
- `select` - For preference dropdowns
- `Button` - Edit, Save, Cancel buttons
- Icons: `Edit2`, `Save`, `X` from lucide-react

### 4. **Backend Integration**
- Uses `updateProfile()` from AuthContext
- Calls `updateUserProfile()` API from userService
- Endpoint: `PUT /gotogether/users/{userId}`
- Updates localStorage with new user data
- Shows success/error feedback to user

## Code Changes

### Imports Added
```jsx
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useAuth } from '../context/AuthContext';
import * as userService from '../Service/userservice';
import { Edit2, Save, X } from 'lucide-react';
```

### State Management
```jsx
const [isEditMode, setIsEditMode] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [editData, setEditData] = useState({...});
```

### Key Functions
1. **handleFieldChange()** - Updates edit data for text fields
2. **handlePreferenceChange()** - Updates preference selections
3. **handleSave()** - Saves changes to backend
4. **handleCancel()** - Discards changes and exits edit mode

## User Flow

1. User clicks **"Edit Profile"** button
2. Fields become editable (input fields, textarea, dropdowns)
3. User modifies desired fields
4. User clicks **"Save Changes"** or **"Cancel"**
5. If Save:
   - Data is validated and sent to backend
   - User receives success confirmation
   - Profile refreshes with new data
6. If Cancel:
   - Changes are discarded
   - Returns to view mode

## API Integration

The feature integrates with existing API:

**Endpoint:** `PUT /gotogether/users/{userId}`

**Request Payload:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "bio": "string",
  "location": "string",
  "phoneNumber": "string",
  "languages": ["array"],
  "preferences": {
    "chattiness": "string",
    "music": "string",
    "smoking": "string",
    "pets": "string"
  }
}
```

**Response:**
```json
{
  "user": { ...updated user object }
}
```

## Styling
- Edit mode uses consistent styling with existing UI
- Form fields have proper spacing and labels
- Dropdown selects match the application theme
- Success/error messages provide user feedback

## Future Enhancements
- Add image upload capability
- Add validation for phone numbers
- Add confirmation dialog before saving
- Add real-time field validation
- Add success toast notifications instead of alerts
- Add ability to edit language preferences (add/remove languages)
- Add character count for bio field
- Add form dirty state detection

## Testing Checklist
- [ ] Edit button shows/hides correctly
- [ ] All fields populate with current data
- [ ] Field changes are tracked
- [ ] Save sends correct payload to API
- [ ] Cancel reverts all changes
- [ ] Success message displays after save
- [ ] Profile updates reflect in UI
- [ ] localStorage updates with new data
