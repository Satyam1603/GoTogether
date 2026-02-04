# My Rides Feature - Quick Reference Guide

## Feature Overview
The "My Rides" feature allows users to manage all rides they have created in one convenient location.

## Accessing the Feature

### Step 1: Navigate to User Profile
- Click on your profile avatar/icon
- Or navigate to your user profile page

### Step 2: Click "My Rides" Tab
The "My Rides" tab appears next to:
- About
- Reviews
- Vehicle
- Verification

## Features & Usage

### 📋 View Your Rides
**What you see:**
- Ride source and destination
- Date and available seats
- Price per seat
- Ride description (if provided)

**When empty:**
- Shows "You haven't posted any rides yet" message
- Provides quick button to post a new ride

### ✏️ Edit a Ride
1. Click the "Edit" button on any ride card
2. The card transforms into an edit form
3. Update any field you need:
   - Source location
   - Destination location
   - Date
   - Departure time
   - Available seats
   - Price per seat
   - Description
4. Click "Save Changes" to apply updates
5. Or click "Cancel" to discard changes

### 🗑️ Delete a Ride
1. Click the "Delete" button on any ride card
2. A confirmation dialog appears
3. Confirm deletion
4. Ride is immediately removed from your list

### ➕ Post a New Ride
- Click "Post New Ride" button in the tab header
- Or click "Post Your First Ride" in the empty state
- Navigates to the ride posting form

## What Data is Shown

| Field | Description |
|-------|------------|
| Source | Starting location of the ride |
| Destination | Ending location of the ride |
| Date | Date when the ride is scheduled |
| Time | Departure time (shown in edit mode) |
| Seats | Number of available seats |
| Price | Price per seat for passengers |
| Description | Additional details about the ride |

## Permissions

- **Only visible to**: The ride owner (logged-in user viewing their own profile)
- **Hidden from**: Other users viewing your profile
- **Admin access**: Backend validates ownership before allowing updates/deletes

## Real-time Updates

- Edits are saved immediately to the backend
- Deleted rides are removed from the list instantly
- All changes reflect across the platform

## Loading States

- When fetching rides: Shows a loading spinner
- When editing: Form appears inline
- No loading delay for edit/delete (handled by backend)

## Error Handling

- Required fields validation on edit/save
- Confirmation dialog prevents accidental deletion
- Server errors are displayed with helpful messages
- Invalid data (e.g., negative seats) is prevented by input constraints

## Best Practices

1. **Before editing:** Review all changes carefully
2. **When deleting:** Confirm you want to remove the ride (cannot be undone)
3. **Price setting:** Be competitive with other rides on the platform
4. **Description:** Include useful details (music preference, stops, etc.)
5. **Availability:** Keep seat count accurate to avoid overbooking

## Common Tasks

### How to change departure time?
1. Click Edit on the ride
2. Modify the "Departure Time" field
3. Click "Save Changes"

### How to reduce available seats after some bookings?
1. Click Edit on the ride
2. Reduce the "Available Seats" number
3. Click "Save Changes"

### How to completely remove a ride?
1. Click Delete on the ride
2. Confirm in the dialog
3. Ride is immediately removed

### How to add more details to a ride?
1. Click Edit on the ride
2. Fill in or update the "Description" field
3. Click "Save Changes"

## System Integration

This feature integrates with:
- **Backend API**: Manages ride data persistence
- **Authentication**: Ensures only logged-in users can manage their rides
- **Profile Page**: Sits alongside other user information
- **Ride Posting**: Quick navigation to create new rides
