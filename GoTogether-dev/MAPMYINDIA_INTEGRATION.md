# MapMyIndia API Integration - Complete Documentation

## Overview

This implementation integrates MapMyIndia's place search API into the GoTogether application, allowing users to search for places, locations, and points of interest across India.

## Setup Instructions

### 1. Get MapMyIndia API Key

1. Visit [MapMyIndia Developer Console](https://www.mapmyindia.com/developers/)
2. Sign up for a free account
3. Create a new application
4. Copy your REST API Key

### 2. Configure API Key

Add your MapMyIndia API key to `application.properties`:

```properties
mapmyindia.api.key=YOUR_ACTUAL_API_KEY_HERE
mapmyindia.api.base-url=https://api.mapmyindia.com
```

## Endpoints

### 1. **Basic Place Search**
**Endpoint:** `GET /api/places?q={query}`

**Description:** Search for places by name, address, or type

**Parameters:**
- `q` (required): Search query

**Examples:**

```bash
# Search for a city
curl "http://localhost:8080/api/places?q=Pune"

# Search for a place type
curl "http://localhost:8080/api/places?q=restaurants%20Pune"

# Search for landmarks
curl "http://localhost:8080/api/places?q=Taj%20Mahal"

# Search for hospitals
curl "http://localhost:8080/api/places?q=hospitals%20Mumbai"
```

**Response:**
```json
[
  {
    "placeName": "Pune",
    "placeAddress": "Pune, Maharashtra, India",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "placeId": "pune_id_12345",
    "typeX": "City",
    "email": null,
    "phone": null,
    "website": null,
    "description": "Pune is a major city in Maharashtra"
  },
  {
    "placeName": "Pimpri-Chinchwad",
    "placeAddress": "Pimpri, Pune, Maharashtra, India",
    "latitude": 18.6298,
    "longitude": 73.7997,
    "placeId": "pimpri_id_12346",
    "typeX": "City",
    "email": null,
    "phone": null,
    "website": null,
    "description": "Industrial city near Pune"
  }
]
```

**Response Codes:**
- `200 OK` - Places found
- `400 Bad Request` - Missing or invalid query parameter
- `500 Internal Server Error` - API error

---

### 2. **Get Place Details by ID**
**Endpoint:** `GET /api/places/{placeId}`

**Description:** Get detailed information about a specific place

**Parameters:**
- `placeId` (required, path): Unique place identifier

**Example:**
```bash
curl "http://localhost:8080/api/places/pune_id_12345"
```

**Response:**
```json
{
  "placeName": "Pune",
  "placeAddress": "Pune, Maharashtra, India",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "placeId": "pune_id_12345",
  "typeX": "City",
  "email": "info@pune.gov.in",
  "phone": "+91-20-1234-5678",
  "website": "https://www.pune.gov.in",
  "description": "Pune is a major city in Maharashtra"
}
```

**Response Codes:**
- `200 OK` - Place found
- `404 Not Found` - Place not found
- `400 Bad Request` - Invalid place ID
- `500 Internal Server Error` - API error

---

### 3. **Advanced Place Search**
**Endpoint:** `GET /api/places/search?q={query}&type={type}`

**Description:** Search for places with optional type filter

**Parameters:**
- `q` (required): Search query
- `type` (optional): Type of place (restaurant, hospital, ATM, hotel, school, etc.)

**Examples:**

```bash
# Search for restaurants in Pune
curl "http://localhost:8080/api/places/search?q=Pune&type=restaurant"

# Search for hospitals in Mumbai
curl "http://localhost:8080/api/places/search?q=Mumbai&type=hospital"

# Search for ATMs
curl "http://localhost:8080/api/places/search?q=Bangalore&type=ATM"

# Search for hotels
curl "http://localhost:8080/api/places/search?q=Delhi&type=hotel"

# Search for schools
curl "http://localhost:8080/api/places/search?q=Hyderabad&type=school"
```

**Response:**
```json
[
  {
    "placeName": "Restaurant Name 1",
    "placeAddress": "Address, Pune, Maharashtra, India",
    "latitude": 18.5254,
    "longitude": 73.8617,
    "placeId": "restaurant_id_1",
    "typeX": "Restaurant",
    "email": "info@restaurant1.com",
    "phone": "+91-20-XXXX-XXXX",
    "website": "https://www.restaurant1.com",
    "description": "Fine dining restaurant"
  }
]
```

**Response Codes:**
- `200 OK` - Results found
- `400 Bad Request` - Missing query parameter
- `500 Internal Server Error` - API error

---

## Use Cases

### 1. **Ride Pickup/Dropoff Location Search**
```javascript
// User searching for pickup location
fetch('/api/places?q=Pune')
  .then(res => res.json())
  .then(places => {
    // Display places as dropdown suggestions
    places.forEach(place => {
      console.log(`${place.placeName} (${place.latitude}, ${place.longitude})`);
    });
  });
```

### 2. **Search Nearby Restaurants**
```javascript
// User looking for restaurants to meet before ride
fetch('/api/places/search?q=Pune&type=restaurant')
  .then(res => res.json())
  .then(restaurants => {
    // Display restaurant options
    restaurants.forEach(restaurant => {
      console.log(`${restaurant.placeName} - ${restaurant.placeAddress}`);
    });
  });
```

### 3. **Find Hospitals on Route**
```javascript
// Emergency case - find nearest hospitals
fetch('/api/places/search?q=Mumbai&type=hospital')
  .then(res => res.json())
  .then(hospitals => {
    // Show hospital locations
    hospitals.forEach(hospital => {
      console.log(`${hospital.placeName} - Phone: ${hospital.phone}`);
    });
  });
```

### 4. **Auto-complete Address Bar**
```javascript
// User typing in pickup location box
function autoCompleteLocation(userInput) {
  fetch(`/api/places?q=${encodeURIComponent(userInput)}`)
    .then(res => res.json())
    .then(suggestions => {
      // Show dropdown with place suggestions
      updateAutocompleteSuggestions(suggestions);
    });
}
```

### 5. **Map Display with Coordinates**
```javascript
// Display search results on map
fetch('/api/places?q=Delhi')
  .then(res => res.json())
  .then(places => {
    // Use coordinates for map display
    places.forEach(place => {
      addMarkerToMap({
        lat: place.latitude,
        lng: place.longitude,
        title: place.placeName
      });
    });
  });
```

## Implementation Details

### Architecture

```
PlacesController
    ↓
MapMyIndiaService
    ↓
RestTemplate
    ↓
MapMyIndia API
```

### Key Classes

1. **PlacesController** (`/api/places`)
   - Handles HTTP requests for place searches
   - Three main endpoints for different search types
   - Comprehensive error handling and logging

2. **MapMyIndiaService**
   - Communicates with MapMyIndia API
   - Builds API URLs with proper parameters
   - Handles API responses and errors
   - Returns parsed place data

3. **MapMyIndiaConfig**
   - Manages API configuration
   - Reads API key from application.properties
   - Provides base URL for API calls

4. **RestClientConfig**
   - Bean configuration for RestTemplate
   - Used for making HTTP calls to MapMyIndia API

### DTOs

1. **MapMyIndiaPlaceDTO**
   - Represents a single place
   - Fields: placeName, placeAddress, latitude, longitude, placeId, typeX, email, phone, website, description

2. **MapMyIndiaResponseDTO**
   - Wrapper for API response
   - Fields: results (List of places), responseCode, version

## Features

✅ Full text search for places  
✅ Filtering by place type (restaurant, hospital, ATM, etc.)  
✅ Get detailed place information (coordinates, contact, website)  
✅ Error handling and logging  
✅ Case-insensitive search  
✅ Supports queries in English and regional languages  
✅ Returns GPS coordinates for mapping  

## Error Handling

### Empty Query
```json
{
  "timeStamp": "2025-01-27T10:30:45.123456",
  "message": "Search query cannot be empty",
  "status": "FAILURE"
}
```

### No Results Found
```json
{
  "timeStamp": "2025-01-27T10:30:45.123456",
  "message": "No places found for: invalid_place",
  "status": "SUCCESS",
  "data": []
}
```

### API Error
```json
{
  "timeStamp": "2025-01-27T10:30:45.123456",
  "message": "Error searching places: Connection timeout",
  "status": "FAILURE"
}
```

## Testing

### Using Postman

1. **Set up Request:**
   - Method: GET
   - URL: `http://localhost:8080/api/places?q=Pune`

2. **Basic Search Test:**
```
GET http://localhost:8080/api/places?q=Pune
```

3. **Advanced Search Test:**
```
GET http://localhost:8080/api/places/search?q=Pune&type=restaurant
```

4. **Get Place Details Test:**
```
GET http://localhost:8080/api/places/pune_id_12345
```

### Using cURL

```bash
# Test 1: Basic search
curl "http://localhost:8080/api/places?q=Mumbai"

# Test 2: Restaurant search
curl "http://localhost:8080/api/places/search?q=Bangalore&type=restaurant"

# Test 3: Hospital search
curl "http://localhost:8080/api/places/search?q=Delhi&type=hospital"

# Test 4: Empty query (error test)
curl "http://localhost:8080/api/places?q="
```

## Frontend Integration Examples

### React Component Example

```jsx
import React, { useState } from 'react';

function PlaceSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/places?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search for a place..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleSearch}
      />
      
      {loading && <p>Loading...</p>}
      
      <ul>
        {results.map((place) => (
          <li key={place.placeId}>
            <strong>{place.placeName}</strong>
            <p>{place.placeAddress}</p>
            <p>Coordinates: {place.latitude}, {place.longitude}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlaceSearch;
```

### HTML/JavaScript Example

```html
<form id="placeSearchForm">
  <input 
    type="text" 
    id="searchInput" 
    placeholder="Enter place name"
  />
  <button type="submit">Search</button>
</form>

<div id="results"></div>

<script>
document.getElementById('placeSearchForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const query = document.getElementById('searchInput').value;
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '<p>Loading...</p>';
  
  try {
    const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
    const places = await response.json();
    
    if (places.length === 0) {
      resultsDiv.innerHTML = '<p>No places found</p>';
      return;
    }
    
    resultsDiv.innerHTML = places
      .map(place => `
        <div class="place-result">
          <h3>${place.placeName}</h3>
          <p>${place.placeAddress}</p>
          <p>📍 ${place.latitude}, ${place.longitude}</p>
          ${place.phone ? `<p>📞 ${place.phone}</p>` : ''}
          ${place.website ? `<p><a href="${place.website}">Visit Website</a></p>` : ''}
        </div>
      `)
      .join('');
  } catch (error) {
    resultsDiv.innerHTML = '<p>Error searching places</p>';
    console.error(error);
  }
});
</script>
```

## API Response Fields

| Field | Type | Description |
|-------|------|-------------|
| placeName | String | Name of the place |
| placeAddress | String | Full address of the place |
| latitude | Double | GPS latitude coordinate |
| longitude | Double | GPS longitude coordinate |
| placeId | String | Unique identifier for the place |
| typeX | String | Type of place (City, Restaurant, etc.) |
| email | String | Email contact (if available) |
| phone | String | Phone number (if available) |
| website | String | Website URL (if available) |
| description | String | Brief description of the place |

## Rate Limiting

MapMyIndia API has rate limits depending on your subscription plan:
- Free tier: Limited requests per day
- Paid tiers: Higher limits

Check your MapMyIndia account dashboard for current limits.

## Troubleshooting

### Issue: "API key not valid"
**Solution:** Verify your API key in `application.properties` is correct

### Issue: "No results found" for valid places
**Solution:** Try different search terms or check MapMyIndia API status

### Issue: Connection timeout
**Solution:** Check internet connection and MapMyIndia API availability

### Issue: CORS errors
**Solution:** Ensure `@CrossOrigin` annotation is present on controller

## Future Enhancements

1. **Caching:** Implement Redis caching for frequent searches
2. **Pagination:** Add pagination for large result sets
3. **Filtering:** Add more advanced filtering options
4. **Reverse Geocoding:** Get place names from coordinates
5. **Nearby Search:** Find places within radius of coordinates
6. **Route Optimization:** Suggest optimal pickup/dropoff locations
7. **Availability Status:** Show real-time business hours/availability

## Files Modified/Created

- **PlacesController.java** - REST endpoints for place search
- **MapMyIndiaService.java** - Business logic for API calls
- **MapMyIndiaConfig.java** - Configuration management
- **RestClientConfig.java** - RestTemplate bean configuration
- **MapMyIndiaPlaceDTO.java** - DTO for place data
- **MapMyIndiaResponseDTO.java** - DTO for API response
- **application.properties** - Configuration properties

## Support & Resources

- [MapMyIndia Developer Docs](https://www.mapmyindia.com/api/advanced-maps/doc/web-api/doc.php)
- [MapMyIndia REST API Reference](https://www.mapmyindia.com/api/maps-api/)
- [Contact MapMyIndia Support](https://www.mapmyindia.com/support/)
