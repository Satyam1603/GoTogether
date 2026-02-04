# My Rides Feature - Code Structure Reference

## Component Location
`src/components/UserProfile.jsx`

## State Variables

### Ride Management States
```jsx
// Store all rides created by the driver
const [myRides, setMyRides] = useState([]);

// Track loading state while fetching rides
const [loadingRides, setLoadingRides] = useState(false);

// Track which ride is currently being edited
const [editingRideId, setEditingRideId] = useState(null);

// Form data when editing a ride
const [editingRideData, setEditingRideData] = useState({
  source: '',
  destination: '',
  date: '',
  departureTime: '',
  availableSeats: '',
  pricePerSeat: '',
  description: ''
});
```

## Core Functions

### 1. fetchMyRides()
**Purpose**: Fetch all rides created by the driver from backend

**Usage**:
```jsx
const fetchMyRides = async () => {
  try {
    setLoadingRides(true);
    const result = await rideService.getDriverRides(user1?.id || userId);
    if (result.success) {
      setMyRides(result.data || []);
    }
  } catch (error) {
    console.error('Error fetching my rides:', error);
  } finally {
    setLoadingRides(false);
  }
};
```

**Called in**:
- `useEffect` hook when component mounts (for owner only)

---

### 2. handleEditRide(ride)
**Purpose**: Populate edit form with selected ride data

**Parameters**:
- `ride`: Ride object to edit

**Usage**:
```jsx
const handleEditRide = (ride) => {
  setEditingRideId(ride.id || ride.rideId);
  setEditingRideData({
    source: ride.source || '',
    destination: ride.destination || '',
    date: ride.date || '',
    departureTime: ride.departureTime || ride.time || '',
    availableSeats: ride.availableSeats || '',
    pricePerSeat: ride.pricePerSeat || '',
    description: ride.description || ''
  });
};
```

**Triggered by**: Click "Edit" button on ride card

---

### 3. handleCancelEdit()
**Purpose**: Clear edit form and exit edit mode

**Usage**:
```jsx
const handleCancelEdit = () => {
  setEditingRideId(null);
  setEditingRideData({
    source: '',
    destination: '',
    date: '',
    departureTime: '',
    availableSeats: '',
    pricePerSeat: '',
    description: ''
  });
};
```

**Triggered by**: Click "Cancel" button in edit form

---

### 4. handleUpdateRide()
**Purpose**: Send updated ride data to backend API

**Validation**:
- Checks: source, destination, date (required)

**Usage**:
```jsx
const handleUpdateRide = async () => {
  if (!editingRideData.source || !editingRideData.destination || !editingRideData.date) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    const updatePayload = {
      source: editingRideData.source,
      destination: editingRideData.destination,
      date: editingRideData.date,
      departureTime: editingRideData.departureTime,
      availableSeats: parseInt(editingRideData.availableSeats),
      pricePerSeat: parseFloat(editingRideData.pricePerSeat),
      description: editingRideData.description
    };

    const result = await rideService.updateRide(editingRideId, updatePayload);
    if (result.success) {
      // Update local list
      const updatedRides = myRides.map(ride => 
        (ride.id === editingRideId || ride.rideId === editingRideId) 
          ? { ...ride, ...updatePayload } 
          : ride
      );
      setMyRides(updatedRides);
      handleCancelEdit();
      alert('Ride updated successfully!');
    }
  } catch (error) {
    console.error('Error updating ride:', error);
    alert('Error updating ride');
  }
};
```

**Triggered by**: Click "Save Changes" button in edit form

---

### 5. handleDeleteRide(rideId)
**Purpose**: Delete a ride with confirmation

**Parameters**:
- `rideId`: ID of ride to delete

**Confirmation**: User must confirm before deletion

**Usage**:
```jsx
const handleDeleteRide = async (rideId) => {
  if (!confirm('Are you sure you want to delete this ride? This action cannot be undone.')) {
    return;
  }

  try {
    const result = await rideService.cancelRide(rideId);
    if (result.success) {
      setMyRides(myRides.filter(ride => (ride.id !== rideId && ride.rideId !== rideId)));
      alert('Ride deleted successfully!');
    }
  } catch (error) {
    console.error('Error deleting ride:', error);
    alert('Error deleting ride');
  }
};
```

**Triggered by**: Click "Delete" button on ride card

---

## UI Components

### Tab Trigger
```jsx
{isOwner && (
  <TabsTrigger 
    value="myrides"
    className="..." // styling classes
  >
    <Navigation className="h-5 w-5" />
    My Rides
  </TabsTrigger>
)}
```

### Tab Content
```jsx
{isOwner && (
  <TabsContent value="myrides" className="space-y-6">
    {/* Loading state */}
    {loadingRides ? <Spinner /> : null}

    {/* Rides list or empty state */}
    {myRides.length > 0 ? <RidesList /> : <EmptyState />}
  </TabsContent>
)}
```

### Ride Card (View Mode)
```jsx
<div className="border rounded-lg p-4">
  <div>
    <MapPin /> {ride.source} → {ride.destination}
  </div>
  <div>
    <Calendar /> {ride.date}
    <Car /> {ride.availableSeats} seats
    <span>₹{ride.pricePerSeat}</span>
  </div>
  {ride.description && <div className="bg-gray-50">{ride.description}</div>}
  <Button onClick={() => handleEditRide(ride)}>Edit</Button>
  <Button onClick={() => handleDeleteRide(ride.id)}>Delete</Button>
</div>
```

### Edit Form
```jsx
<div className="space-y-4">
  <Input 
    value={editingRideData.source}
    onChange={(e) => setEditingRideData({...editingRideData, source: e.target.value})}
    placeholder="Source location"
  />
  <Input 
    value={editingRideData.destination}
    onChange={(e) => setEditingRideData({...editingRideData, destination: e.target.value})}
    placeholder="Destination"
  />
  <Input type="date" value={editingRideData.date} onChange={...} />
  <Input type="time" value={editingRideData.departureTime} onChange={...} />
  <Input type="number" value={editingRideData.availableSeats} onChange={...} />
  <Input type="number" value={editingRideData.pricePerSeat} onChange={...} />
  <Textarea value={editingRideData.description} onChange={...} />
  <Button onClick={handleUpdateRide}>Save Changes</Button>
  <Button onClick={handleCancelEdit}>Cancel</Button>
</div>
```

## Data Flow Diagram

```
User navigates to profile
         ↓
isOwner === true?
         ↓ YES
useEffect runs
         ↓
fetchMyRides() called
         ↓
rideService.getDriverRides(userId)
         ↓
Backend API returns rides
         ↓
setMyRides(rides)
         ↓
Render ride cards
         ↓
User clicks Edit/Delete
         ↓
handleEditRide() / handleDeleteRide()
         ↓
API call (update/delete)
         ↓
Update state
         ↓
Re-render UI
```

## Error Handling

### Fetch Errors
```jsx
catch (error) {
  console.error('Error fetching my rides:', error);
  setMyRides([]); // Set empty array
  // Loading spinner disappears
}
```

### Update Errors
```jsx
catch (error) {
  console.error('Error updating ride:', error);
  alert('Error updating ride'); // User sees message
}
```

### Delete Errors
```jsx
catch (error) {
  console.error('Error deleting ride:', error);
  alert('Error deleting ride'); // User sees message
}
```

## Conditional Rendering

### My Rides Tab (Only for Owner)
```jsx
{isOwner && <TabsTrigger value="myrides">...</TabsTrigger>}
```

### My Rides Content (Only for Owner)
```jsx
{isOwner && <TabsContent value="myrides">...</TabsContent>}
```

### Loading State
```jsx
{loadingRides ? <Spinner /> : (
  myRides.length > 0 ? <RidesList /> : <EmptyState />
)}
```

### Edit Mode vs View Mode
```jsx
{editingRideId === (ride.id || ride.rideId) 
  ? <EditForm />  // Show edit form
  : <ViewCard />  // Show ride card
}
```

## Integration Points

### Service Layer
```jsx
import { rideService } from '../Service/rideservice';
```

Provides:
- `getDriverRides(driverId)` - Fetch rides
- `updateRide(rideId, data)` - Update ride
- `cancelRide(rideId)` - Delete ride

### Component Props
```jsx
function UserProfile({ 
  userId, 
  user1, 
  onNavigate, 
  onBack 
})
```

Uses `onNavigate('postride')` to navigate to ride posting page

### useAuth Hook
```jsx
const { user: authUser, updateProfile } = useAuth();
```

Uses `authUser.id` to determine if viewing own profile

---

## Performance Considerations

1. **Lazy Loading**: Rides only fetched when owner views their profile
2. **Controlled Re-renders**: Only affected components re-render on state changes
3. **Efficient Filtering**: Uses array methods for updates/deletes
4. **Conditional Rendering**: Tab only renders for owner

## Security Considerations

1. **Frontend Validation**: Checks required fields before sending
2. **Backend Validation**: Server validates user ownership
3. **Confirmation Dialogs**: Prevents accidental deletion
4. **Access Control**: Tab hidden for other users

---

## Testing Tips

### Manual Testing
1. Create a user account
2. Post some test rides
3. View profile → My Rides tab
4. Test Edit functionality
5. Test Delete with confirmation
6. Test empty state
7. Test loading state

### Edge Cases
- Empty rides list
- Very long ride descriptions
- Special characters in location names
- Same source and destination
- Past dates
- High price values

### Browser Console
Monitor for:
- Console errors
- API calls in Network tab
- State changes in React DevTools
