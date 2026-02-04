# MapMyIndia API - Code Examples & Use Cases

## Frontend Integration Examples

### 1. React Component - Basic Place Search

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
        alert('Error searching places');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Search Places</h2>
      <input
        type="text"
        placeholder="Enter place name (e.g., Pune, Mumbai)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={handleSearch}
        style={{ width: '300px', padding: '8px' }}
      />
      
      {loading && <p>Loading...</p>}
      
      <ul style={{ marginTop: '20px' }}>
        {results.map((place) => (
          <li key={place.placeId} style={{ marginBottom: '15px' }}>
            <strong>{place.placeName}</strong>
            <p>{place.placeAddress}</p>
            <p>📍 Lat: {place.latitude.toFixed(4)}, Long: {place.longitude.toFixed(4)}</p>
            {place.phone && <p>📞 {place.phone}</p>}
            {place.website && <p><a href={place.website}>Visit Website</a></p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlaceSearch;
```

---

### 2. React Hook - Place Search with Debouncing

```jsx
import { useState, useCallback } from 'react';

const usePlaceSearch = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchPlaces = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, searchPlaces };
};

// Usage in component
function SearchComponent() {
  const { results, loading, searchPlaces } = usePlaceSearch();
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    // Debounce with 300ms delay
    setTimeout(() => searchPlaces(newQuery), 300);
  };

  return (
    <div>
      <input onChange={handleChange} placeholder="Search..." />
      {loading && <p>Searching...</p>}
      {results.length > 0 && (
        <ul>
          {results.map(r => (
            <li key={r.placeId}>{r.placeName}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

### 3. HTML/Vanilla JavaScript - AutoComplete Dropdown

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .search-container {
      position: relative;
      width: 400px;
    }
    
    .search-input {
      width: 100%;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
    }
    
    .suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ccc;
      border-top: none;
      max-height: 300px;
      overflow-y: auto;
      display: none;
    }
    
    .suggestion-item {
      padding: 10px;
      cursor: pointer;
      border-bottom: 1px solid #eee;
    }
    
    .suggestion-item:hover {
      background-color: #f5f5f5;
    }
  </style>
</head>
<body>

<div class="search-container">
  <input 
    type="text" 
    id="placeInput" 
    class="search-input"
    placeholder="Search places..."
    autocomplete="off"
  />
  <div id="suggestions" class="suggestions"></div>
</div>

<script>
const searchInput = document.getElementById('placeInput');
const suggestionsDiv = document.getElementById('suggestions');
let debounceTimer;

// Debounced search function
searchInput.addEventListener('input', (e) => {
  clearTimeout(debounceTimer);
  
  debounceTimer = setTimeout(() => {
    searchPlaces(e.target.value);
  }, 300);
});

async function searchPlaces(query) {
  if (!query || query.trim().length < 2) {
    suggestionsDiv.style.display = 'none';
    return;
  }

  try {
    const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
    const places = await response.json();
    
    if (!Array.isArray(places) || places.length === 0) {
      suggestionsDiv.innerHTML = '<div class="suggestion-item">No results found</div>';
      suggestionsDiv.style.display = 'block';
      return;
    }

    suggestionsDiv.innerHTML = places
      .map(place => `
        <div class="suggestion-item" onclick="selectPlace('${place.placeName}', ${place.latitude}, ${place.longitude})">
          <strong>${place.placeName}</strong>
          <br/>
          <small>${place.placeAddress}</small>
        </div>
      `)
      .join('');
    
    suggestionsDiv.style.display = 'block';
  } catch (error) {
    console.error('Search error:', error);
    suggestionsDiv.innerHTML = '<div class="suggestion-item">Error searching places</div>';
    suggestionsDiv.style.display = 'block';
  }
}

function selectPlace(name, lat, lng) {
  searchInput.value = name;
  suggestionsDiv.style.display = 'none';
  console.log(`Selected: ${name} (${lat}, ${lng})`);
  // Handle selection - e.g., update map, set pickup location, etc.
}

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
  if (e.target !== searchInput) {
    suggestionsDiv.style.display = 'none';
  }
});
</script>

</body>
</html>
```

---

### 4. Restaurant Search Component

```jsx
import React, { useState } from 'react';

function RestaurantSearch() {
  const [city, setCity] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRestaurants = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/places/search?q=${encodeURIComponent(city)}&type=restaurant`
      );
      const data = await response.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Find Restaurants</h2>
      <div>
        <input
          type="text"
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchRestaurants()}
          style={{ padding: '8px', marginRight: '10px', width: '200px' }}
        />
        <button onClick={searchRestaurants}>Search</button>
      </div>

      {loading && <p>Finding restaurants...</p>}

      <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
        {restaurants.map((restaurant) => (
          <div key={restaurant.placeId} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
            <h3>{restaurant.placeName}</h3>
            <p>{restaurant.placeAddress}</p>
            {restaurant.phone && <p>📞 {restaurant.phone}</p>}
            {restaurant.website && <p><a href={restaurant.website} target="_blank" rel="noopener noreferrer">Visit</a></p>}
            <p style={{ fontSize: '12px', color: '#666' }}>
              📍 {restaurant.latitude.toFixed(2)}, {restaurant.longitude.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestaurantSearch;
```

---

### 5. Map Integration with Google Maps

```jsx
import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

function MapWithPlaces() {
  const [places, setPlaces] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 18.5204, lng: 73.8567 }); // Default: Pune

  useEffect(() => {
    searchPlaces('Pune');
  }, []);

  const searchPlaces = async (query) => {
    try {
      const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setPlaces(data);
        // Center map on first result
        setMapCenter({
          lat: data[0].latitude,
          lng: data[0].longitude
        });
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    }
  };

  const mapStyles = {
    height: "400px",
    width: "100%"
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Search for a place..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              searchPlaces(e.target.value);
            }
          }}
          style={{ padding: '8px', width: '300px' }}
        />
      </div>

      <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
        <GoogleMap
          mapContainerStyle={mapStyles}
          center={mapCenter}
          zoom={12}
        >
          {places.map((place) => (
            <Marker
              key={place.placeId}
              position={{
                lat: place.latitude,
                lng: place.longitude
              }}
              title={place.placeName}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      <div>
        <h3>Found {places.length} places</h3>
        <ul>
          {places.map((place) => (
            <li key={place.placeId}>
              {place.placeName} - {place.placeAddress}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MapWithPlaces;
```

---

### 6. Hospital Finder (Emergency Use Case)

```jsx
import React, { useState } from 'react';

function HospitalFinder() {
  const [city, setCity] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);

  const findHospitals = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `/api/places/search?q=${encodeURIComponent(city)}&type=hospital`
      );
      const data = await response.json();
      // Sort by name for consistent display
      const sorted = Array.isArray(data) ? data.sort((a, b) => a.placeName.localeCompare(b.placeName)) : [];
      setHospitals(sorted);
    } catch (error) {
      alert('Error finding hospitals');
    } finally {
      setLoading(false);
    }
  };

  const callHospital = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h1>🏥 Emergency Hospital Finder</h1>
      <p style={{ color: '#d32f2f' }}>In case of emergency, dial 112</p>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter your city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && findHospitals()}
          style={{ padding: '10px', width: '250px', fontSize: '16px' }}
        />
        <button 
          onClick={findHospitals}
          style={{ 
            padding: '10px 20px', 
            marginLeft: '10px',
            backgroundColor: '#d32f2f',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          Find Hospitals
        </button>
      </div>

      {loading && <p>Searching for hospitals...</p>}

      <div style={{ display: 'grid', gap: '15px' }}>
        {hospitals.map((hospital) => (
          <div 
            key={hospital.placeId}
            style={{
              border: '2px solid #d32f2f',
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}
          >
            <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>
              {hospital.placeName}
            </h3>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              📍 {hospital.placeAddress}
            </p>
            {hospital.phone && (
              <button
                onClick={() => callHospital(hospital.phone)}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginTop: '10px'
                }}
              >
                📞 Call: {hospital.phone}
              </button>
            )}
            {hospital.website && (
              <a 
                href={hospital.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  marginLeft: '10px',
                  marginTop: '10px',
                  padding: '8px 15px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '4px'
                }}
              >
                🌐 Website
              </a>
            )}
          </div>
        ))}
      </div>

      {hospitals.length === 0 && !loading && city && (
        <p style={{ color: '#999' }}>No hospitals found. Try a different city.</p>
      )}
    </div>
  );
}

export default HospitalFinder;
```

---

### 7. Ride Pickup Location Selection

```jsx
import React, { useState } from 'react';

function PickupLocationSelect() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  let debounceTimer;

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    clearTimeout(debounceTimer);
    
    if (query.length > 2) {
      debounceTimer = setTimeout(() => {
        searchLocations(query);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const searchLocations = async (query) => {
    try {
      const response = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSuggestions(Array.isArray(data) ? data : []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const selectLocation = (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.placeName);
    setShowSuggestions(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Select Pickup Location</h2>
      
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Search location..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        />

        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderTop: 'none',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 1000,
            borderRadius: '0 0 4px 4px'
          }}>
            {suggestions.map((location) => (
              <div
                key={location.placeId}
                onClick={() => selectLocation(location)}
                style={{
                  padding: '12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  backgroundColor: '#fff'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
              >
                <div style={{ fontWeight: 'bold' }}>{location.placeName}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{location.placeAddress}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedLocation && (
        <div style={{
          padding: '15px',
          backgroundColor: '#e8f5e9',
          borderRadius: '4px',
          border: '1px solid #4CAF50'
        }}>
          <h3>Selected Location:</h3>
          <p><strong>{selectedLocation.placeName}</strong></p>
          <p>{selectedLocation.placeAddress}</p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Coordinates: {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
          </p>
          <button
            onClick={() => {
              console.log('Ride booked from:', selectedLocation);
              // Handle booking logic
            }}
            style={{
              marginTop: '10px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Continue to Booking
          </button>
        </div>
      )}
    </div>
  );
}

export default PickupLocationSelect;
```

---

## Backend Integration Examples

### Java - Using the Service Directly

```java
@RestController
@RequestMapping("/api/rides")
public class RideController {
    
    private final MapMyIndiaService mapMyIndiaService;
    
    public RideController(MapMyIndiaService mapMyIndiaService) {
        this.mapMyIndiaService = mapMyIndiaService;
    }
    
    @PostMapping("/estimate")
    public ResponseEntity<?> estimateRide(
            @RequestParam String pickupLocation,
            @RequestParam String dropoffLocation) {
        
        // Get coordinates for both locations
        List<MapMyIndiaPlaceDTO> pickupPlaces = 
            mapMyIndiaService.getSuggestedPlaces(pickupLocation);
        List<MapMyIndiaPlaceDTO> dropoffPlaces = 
            mapMyIndiaService.getSuggestedPlaces(dropoffLocation);
        
        if (pickupPlaces.isEmpty() || dropoffPlaces.isEmpty()) {
            return ResponseEntity.badRequest()
                .body("Invalid pickup or dropoff location");
        }
        
        MapMyIndiaPlaceDTO pickup = pickupPlaces.get(0);
        MapMyIndiaPlaceDTO dropoff = dropoffPlaces.get(0);
        
        // Calculate distance and estimate fare
        double distance = calculateDistance(
            pickup.getLatitude(), pickup.getLongitude(),
            dropoff.getLatitude(), dropoff.getLongitude()
        );
        
        double estimatedFare = distance * 15; // Example: ₹15 per km
        
        return ResponseEntity.ok(new RideEstimateDTO(
            pickup.getPlaceName(),
            dropoff.getPlaceName(),
            distance,
            estimatedFare
        ));
    }
    
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula
        double R = 6371; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.asin(Math.sqrt(a));
        return R * c;
    }
}
```

---

## cURL Testing Commands

```bash
# Test 1: Search for a city
curl -X GET "http://localhost:8080/api/places?q=Pune" \
  -H "Accept: application/json"

# Test 2: Search for restaurants
curl -X GET "http://localhost:8080/api/places/search?q=Pune&type=restaurant" \
  -H "Accept: application/json"

# Test 3: Search for hospitals
curl -X GET "http://localhost:8080/api/places/search?q=Mumbai&type=hospital" \
  -H "Accept: application/json"

# Test 4: Get all Bangalore locations
curl -X GET "http://localhost:8080/api/places?q=Bangalore" \
  -H "Accept: application/json"

# Test 5: Search with special characters
curl -X GET "http://localhost:8080/api/places?q=Mumbai%20Restaurant" \
  -H "Accept: application/json"
```

---

## More Resources

- See `MAPMYINDIA_INTEGRATION.md` for complete API documentation
- See `MAPMYINDIA_QUICK_START.md` for setup instructions
- Check `MAPMYINDIA_IMPLEMENTATION_COMPLETE.md` for full summary

---

Happy Coding! 🚀
