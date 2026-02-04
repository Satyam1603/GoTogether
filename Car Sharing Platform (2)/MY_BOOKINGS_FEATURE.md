# My Bookings Feature - Documentation

## Overview
Added a comprehensive **My Bookings** feature that allows authenticated users to view, manage, and track all their ride bookings in one centralized dashboard.

## Features Implemented

### 1. **View All User Bookings**
- Displays all bookings made by the logged-in user
- Automatic data loading on component mount
- Real-time fetching from backend API

### 2. **Filter by Booking Status**
Status filter tabs include:
- **All** - Shows all bookings
- **Pending** - Awaiting confirmation bookings
- **Confirmed** - Confirmed by driver
- **Completed** - Finished rides
- **Cancelled** - Cancelled bookings

### 3. **Detailed Booking Information**
Each booking card displays:
- **Route Information**: Pickup and dropoff locations with icons
- **Departure Details**: Date and time of ride
- **Duration**: Estimated trip duration
- **Pricing**: Total price per booking
- **Seats**: Number of passengers booked
- **Driver Information**: Driver name, avatar, and contact phone
- **Special Requests**: Any special notes/requirements
- **Status Badge**: Color-coded status indicator

### 4. **Interactive Actions**
Based on booking status:
- **Confirmed Bookings**: 
  - Contact Driver button
  - Cancel Booking button
- **Completed Bookings**: 
  - Leave Review button
- **Pending Bookings**: 
  - Cancel Request button

### 5. **User-Friendly UI**
- Clean, card-based layout
- Color-coded status badges
- Status icons for quick visual reference
- Responsive design (mobile & desktop)
- Loading states during data fetch
- Error handling with retry option
- Empty state messaging

### 6. **Navigation Integration**
- "My Bookings" link in navbar (desktop & mobile)
- Accessible only when user is logged in
- Bookmark icon for visual recognition

## Code Components

### File: `src/components/MyBookings.jsx`

**Main Features:**
```jsx
export function MyBookings({ onNavigate, onBack }) {
  // State management
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Fetch user's bookings
  const fetchUserBookings = async () => { ... }
  
  // Status styling
  const getStatusColor = (status) => { ... }
  const getStatusIcon = (status) => { ... }
  
  // Rendering methods for different UI states
}
```

### Integration Points

#### App.tsx Changes:
```jsx
import { MyBookings } from './components/MyBookings';

// In App component render:
if (currentPage === 'mybookings') {
  return (
    <MyBookings 
      onNavigate={handleNavigate}
      onBack={() => handleNavigate('home')}
    />
  );
}
```

#### Navbar.jsx Changes:
- Added `Bookmark` icon import
- Added "My Bookings" button in desktop navigation
- Added "My Bookings" option in mobile menu
- Conditionally shown only when user is logged in

## API Integration

### Endpoint Used:
**GET** `/gotogether/bookings/user/{userId}`

### Request:
```
Authorization: Bearer {accessToken}
```

### Response Format:
```json
[
  {
    "id": 123,
    "rideTitle": "Downtown to Airport",
    "status": "CONFIRMED",
    "pickupLocation": "123 Main St",
    "dropoffLocation": "Airport Terminal 2",
    "departureTime": "2024-02-02T10:30:00",
    "rideDate": "2024-02-02",
    "estimatedDuration": "45 mins",
    "numberOfPassengers": 1,
    "seatsBooked": 1,
    "totalPrice": 35.50,
    "price": 35.50,
    "driverName": "John Doe",
    "driverAvatar": "https://...",
    "driverPhone": "+1-555-0123",
    "specialRequests": "No music please",
    "rideId": 456
  }
]
```

## Status Color Coding

| Status | Color | Icon |
|--------|-------|------|
| Confirmed, Completed | Green | CheckCircle |
| Pending, Awaiting | Yellow | AlertCircle |
| Cancelled | Red | XCircle |
| In Progress | Blue | Clock |

## User Flow

1. **Login** - User authenticates
2. **Navigate to My Bookings** - Click "My Bookings" in navbar
3. **View Bookings** - All user bookings load automatically
4. **Filter Results** - Use status tabs to filter bookings
5. **View Details** - Click on booking to see full information
6. **Take Action** - Contact driver, cancel, or leave review
7. **Back Home** - Click "Back" button to return

## Loading States

- **Loading**: Shows spinner with "Loading your bookings..." message
- **Error**: Shows error alert with retry button
- **Empty**: Shows helpful message to browse available rides
- **Data**: Shows all bookings with status filters

## Responsive Design

- **Desktop**: Full layout with all details visible
- **Tablet**: Optimized grid layout
- **Mobile**: Stacked layout, touch-friendly buttons
- **Status Badges**: Always visible for quick identification

## Error Handling

- Try/catch blocks for API calls
- User-friendly error messages
- Retry functionality when fetch fails
- Graceful fallbacks for missing data
- Loading state management

## Data Fields Handled

```javascript
// Booking object structure
{
  id,                    // Unique booking ID
  rideTitle,             // Display name
  status,                // PENDING, CONFIRMED, COMPLETED, CANCELLED
  pickupLocation,        // Starting point
  dropoffLocation,       // Destination
  departureTime,         // When ride starts
  rideDate,              // Date of ride
  estimatedDuration,     // Trip duration
  numberOfPassengers,    // Passenger count
  seatsBooked,           // Seats reserved
  totalPrice,            // Cost
  price,                 // Alternative price field
  driverName,            // Driver's full name
  driverAvatar,          // Driver's profile image
  driverPhone,           // Driver's contact number
  specialRequests        // Special notes
}
```

## Future Enhancements

- [ ] Real-time booking status updates (WebSocket)
- [ ] Booking history with past rides archive
- [ ] Download receipt/invoice as PDF
- [ ] Share ride details with others
- [ ] Sos/emergency contact feature
- [ ] Rate and review drivers
- [ ] Save favorite routes
- [ ] Repeat booking with same route
- [ ] Booking statistics (total trips, money saved, etc.)
- [ ] Integration with payment history
- [ ] Rebooking cancelled trips
- [ ] Automatic retry for pending bookings
- [ ] Push notifications for status updates

## Security Considerations

✅ **Authentication Required** - Only authenticated users can view  
✅ **User-Specific Data** - Each user sees only their bookings  
✅ **JWT Token** - Uses existing auth interceptor  
✅ **Error Messages** - No sensitive data exposed in errors  

## Testing Checklist

- [ ] Navigate to My Bookings when logged in
- [ ] Verify all bookings display correctly
- [ ] Test each status filter
- [ ] Check error handling (network down)
- [ ] Verify empty state message
- [ ] Test on mobile/tablet/desktop
- [ ] Click action buttons (contact, cancel, review)
- [ ] Back button returns to home
- [ ] Logout removes access to My Bookings
- [ ] Loading state appears during fetch

## Performance Considerations

- Efficient state management with hooks
- Single fetch on mount (not on every re-render)
- Proper cleanup in useEffect
- Optimized list rendering with keys
- Filter applied client-side (fast)

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies Used

- React hooks (useState, useEffect)
- lucide-react (Icons)
- Custom UI components (Button, Badge)
- Booking API (bookingApi.js)
- Auth context (useAuth)

## File Structure

```
src/
├── components/
│   ├── MyBookings.jsx          (NEW - Main component)
│   ├── Navbar.jsx              (UPDATED - Added My Bookings link)
│   └── ui/
│       ├── button.tsx
│       └── badge.tsx
├── api/
│   └── bookingApi.js           (Existing - Used for data fetching)
├── context/
│   └── AuthContext.jsx         (Existing - Used for user auth)
└── App.tsx                     (UPDATED - Added MyBookings route)
```

## Migration Guide

If migrating from existing booking views:

1. Replace old booking list component with `MyBookings`
2. Update navigation to use 'mybookings' page name
3. Ensure backend API endpoint `/bookings/user/{userId}` exists
4. Test with real booking data
5. Update tests and documentation
