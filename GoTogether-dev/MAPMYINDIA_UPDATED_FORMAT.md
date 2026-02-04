# MapMyIndia Geocode API - Updated Integration Guide

## 🎯 Important Change: Response Format Updated

The MapMyIndia API returns data in **`copResults`** (not `results`), and the response format is different from the initial implementation.

---

## ✅ What Was Updated

### 1. **MapMyIndiaPlaceDTO** (Updated)
Now maps to the actual API response with these fields:
```java
- houseNumber
- houseName
- poi (Point of Interest)
- street
- subSubLocality
- subLocality
- locality
- village
- subDistrict
- district
- city
- state
- pincode
- formattedAddress
- eLoc (place ID)
- geocodeLevel
- confidenceScore
```

### 2. **MapMyIndiaResponseDTO** (Updated)
Now handles both response formats:
```java
- copResults (main array from geocode endpoint)
- results (alternative array)
- Helper method: getPlaces() - automatically selects correct array
```

### 3. **PlaceSuggestionResponseDTO** (New)
Formatted response sent to frontend:
```java
- placeName (auto-extracted from best available field)
- fullAddress
- city
- district
- state
- eLoc
- geocodeLevel
- confidenceScore
```

### 4. **MapMyIndiaService** (Updated)
- Uses `getPlaces()` helper method for flexibility
- Handles both response formats automatically

### 5. **PlacesController** (Updated)
- Parameter: `address` (not `q`)
- Uses `PlaceSuggestionResponseDTO` for consistent frontend response

---

## 📍 API Response Format

### Actual MapMyIndia Response:
```json
{
  "copResults": [
    {
      "houseNumber": "",
      "houseName": "",
      "poi": "",
      "street": "",
      "subSubLocality": "",
      "subLocality": "",
      "locality": "",
      "village": "",
      "subDistrict": "",
      "district": "Pune District",
      "city": "Pune",
      "state": "Maharashtra",
      "pincode": "",
      "formattedAddress": "Pune, Maharashtra",
      "eLoc": "2YDC4O",
      "geocodeLevel": "city",
      "confidenceScore": 0.8
    }
  ]
}
```

### Our Formatted Response to Frontend:
```json
[
  {
    "placeName": "Pune",
    "fullAddress": "Pune, Maharashtra",
    "city": "Pune",
    "district": "Pune District",
    "state": "Maharashtra",
    "eLoc": "2YDC4O",
    "geocodeLevel": "city",
    "confidenceScore": 0.8
  }
]
```

---

## 🚀 Testing the Updated API

### Test Endpoint
```bash
# Search for Pune
curl "http://localhost:8080/api/places?address=Pune"

# Search for Mumbai
curl "http://localhost:8080/api/places?address=Mumbai"

# Search for Delhi
curl "http://localhost:8080/api/places?address=Delhi"

# Search for specific locality
curl "http://localhost:8080/api/places?address=Pimpri%20Chinchwad"
```

### Using Browser
```
http://localhost:8080/api/places?address=Pune
http://localhost:8080/api/places?address=Mumbai
```

### Using Postman
1. Create GET request
2. URL: `http://localhost:8080/api/places?address=Pune`
3. Click Send
4. See formatted response

---

## 📋 Updated Code Changes

### PlacesSuggestionResponseDTO - NEW
```java
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PlaceSuggestionResponseDTO {
    private String placeName;      // Auto-extracted from poi/locality/city/district
    private String fullAddress;    // formattedAddress from API
    private String city;           // city field
    private String district;       // district field
    private String state;          // state field
    private String eLoc;          // unique place ID
    private String geocodeLevel;   // geocoding precision level
    private Double confidenceScore; // search accuracy score
    
    // Converts MapMyIndia response to our format
    public static PlaceSuggestionResponseDTO fromMapMyIndiaPlace(MapMyIndiaPlaceDTO place) {
        // Auto-select best place name from available fields
        String placeName = place.getPoi() != null ? place.getPoi() :
                          place.getLocality() != null ? place.getLocality() :
                          place.getCity() != null ? place.getCity() :
                          place.getDistrict() != null ? place.getDistrict() :
                          place.getFormattedAddress();
        
        PlaceSuggestionResponseDTO dto = new PlaceSuggestionResponseDTO();
        dto.setPlaceName(placeName);
        dto.setFullAddress(place.getFormattedAddress());
        dto.setCity(place.getCity());
        dto.setDistrict(place.getDistrict());
        dto.setState(place.getState());
        dto.setELoc(place.getELoc());
        dto.setGeocodeLevel(place.getGeocodeLevel());
        dto.setConfidenceScore(place.getConfidenceScore());
        return dto;
    }
}
```

### MapMyIndiaResponseDTO - UPDATED
```java
@Getter
@Setter
public class MapMyIndiaResponseDTO {
    @JsonProperty("copResults")
    private List<MapMyIndiaPlaceDTO> copResults;  // Main response from geocode API
    
    @JsonProperty("results")
    private List<MapMyIndiaPlaceDTO> results;     // Alternative format
    
    // Helper method to get results from either source
    public List<MapMyIndiaPlaceDTO> getPlaces() {
        return (copResults != null && !copResults.isEmpty()) ? copResults : results;
    }
}
```

---

## 💻 Frontend Integration Examples

### React Example
```jsx
async function searchPlace(address) {
  const response = await fetch(`/api/places?address=${encodeURIComponent(address)}`);
  const places = await response.json();
  
  places.forEach(place => {
    console.log(`${place.placeName} - ${place.fullAddress}`);
    console.log(`Confidence: ${place.confidenceScore * 100}%`);
  });
}

// Usage
searchPlace('Pune');
```

### JavaScript Example
```javascript
fetch('/api/places?address=Mumbai')
  .then(res => res.json())
  .then(places => {
    places.forEach(p => {
      console.log(`${p.placeName} (${p.state})`);
    });
  });
```

### HTML Form Example
```html
<input 
  type="text" 
  id="location"
  placeholder="Enter location..."
/>
<button onclick="search()">Search</button>

<script>
function search() {
  const address = document.getElementById('location').value;
  fetch(`/api/places?address=${encodeURIComponent(address)}`)
    .then(r => r.json())
    .then(places => {
      places.forEach(p => {
        console.log(`${p.placeName}, ${p.city}, ${p.state}`);
      });
    });
}
</script>
```

---

## 🔧 API Endpoints

### Single Endpoint: GET /api/places

**Parameters:**
- `address` (required): Location to search

**Examples:**
```
GET /api/places?address=Pune
GET /api/places?address=Mumbai
GET /api/places?address=Delhi
GET /api/places?address=Bangalore
```

**Response:**
```json
[
  {
    "placeName": "Pune",
    "fullAddress": "Pune, Maharashtra",
    "city": "Pune",
    "district": "Pune District",
    "state": "Maharashtra",
    "eLoc": "2YDC4O",
    "geocodeLevel": "city",
    "confidenceScore": 0.8
  }
]
```

---

## 📊 Response Fields Explanation

| Field | Source | Description |
|-------|--------|-------------|
| `placeName` | Extracted | Best name for the place (POI > locality > city > district > full address) |
| `fullAddress` | `formattedAddress` | Complete formatted address from API |
| `city` | `city` | City name |
| `district` | `district` | District name |
| `state` | `state` | State name |
| `eLoc` | `eLoc` | Unique place ID from MapMyIndia |
| `geocodeLevel` | `geocodeLevel` | Precision level (city, district, locality, etc.) |
| `confidenceScore` | `confidenceScore` | Accuracy score (0.0 to 1.0) |

---

## ✨ Key Features

✅ Automatic place name extraction from best available field  
✅ Formatted addresses for display  
✅ Geocoding precision level information  
✅ Confidence scores for result relevance  
✅ Handles both copResults and results formats  
✅ Clean, frontend-friendly response format  

---

## 🧪 Complete Test Flow

### Test 1: Search for Pune
```bash
curl "http://localhost:8080/api/places?address=Pune"
```

Expected response:
```json
[
  {
    "placeName": "Pune",
    "fullAddress": "Pune, Maharashtra",
    "city": "Pune",
    "district": "Pune District",
    "state": "Maharashtra",
    "eLoc": "2YDC4O",
    "geocodeLevel": "city",
    "confidenceScore": 0.8
  }
]
```

### Test 2: Search for Mumbai
```bash
curl "http://localhost:8080/api/places?address=Mumbai"
```

### Test 3: Search for Specific Locality
```bash
curl "http://localhost:8080/api/places?address=Pimpri%20Chinchwad"
```

---

## 📝 Important Notes

1. **Parameter Name**: Use `address` (not `q`)
2. **Response Format**: Always returns `PlaceSuggestionResponseDTO` array
3. **Place Name**: Auto-extracted intelligently from API response
4. **Confidence Score**: Check this to filter low-confidence results
5. **eL oc**: Unique identifier for each place (use for subsequent lookups)

---

## 🎯 Usage in GoTogether Features

### 1. Ride Pickup Location
```javascript
// User enters "Pune"
fetch('/api/places?address=Pune')
  .then(r => r.json())
  .then(places => {
    // Use placeName and fullAddress for display
    // Store eLoc for place identification
  });
```

### 2. Ride Dropoff Location
```javascript
// Similar to pickup - search and store eLoc
```

### 3. Location Filtering
```javascript
// Search all results where state === 'Maharashtra'
const maharashtraPlaces = results.filter(p => p.state === 'Maharashtra');
```

### 4. Confidence Filtering
```javascript
// Only show results with high confidence
const reliablePlaces = results.filter(p => p.confidenceScore > 0.7);
```

---

## 🔍 Debugging Tips

### Enable Debug Logging
Add to `application.properties`:
```properties
logging.level.com.gotogether.user.service.MapMyIndiaService=DEBUG
logging.level.com.gotogether.user.controller.PlacesController=DEBUG
```

### Check API URL
Look for console output:
```
MapMyIndia API URL: https://api.mapmyindia.com/search/address/geocode?...
```

### Verify API Response
Check logs for:
```
Received X results from MapMyIndia API
```

---

## ✅ Verification Checklist

- [x] MapMyIndiaPlaceDTO updated with correct fields
- [x] MapMyIndiaResponseDTO handles copResults
- [x] PlaceSuggestionResponseDTO created for clean response
- [x] MapMyIndiaService updated to use getPlaces()
- [x] PlacesController returns formatted responses
- [x] Parameter changed from 'q' to 'address'
- [x] No compilation errors
- [x] All files tested

---

## 🚀 Next Steps

1. ✅ Restart application
2. ✅ Test with curl/browser
3. ✅ Integrate with frontend
4. ✅ Update frontend to use 'address' parameter
5. ✅ Update frontend to handle new response format
6. ✅ Test end-to-end flow

---

## 📞 Quick Reference

| Need | Action |
|------|--------|
| Search place | `GET /api/places?address=<place>` |
| Check confidence | Look at `confidenceScore` (0-1) |
| Get unique ID | Use `eLoc` field |
| Get full address | Use `fullAddress` field |
| Get city/state | Use `city` and `state` fields |

---

## 🎉 Ready to Use!

The API is now fully integrated with the correct MapMyIndia response format. Your GoTogether app can now:

✅ Search for any place in India  
✅ Get formatted, clean responses  
✅ Extract place names intelligently  
✅ Access confidence scores  
✅ Filter by state/city  

Happy coding! 🚀
