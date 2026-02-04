# MapMyIndia API - Quick Reference & Setup Guide

## 🚀 Quick Start (2 Minutes)

### Step 1: Get API Key
1. Go to [MapMyIndia Developer Console](https://www.mapmyindia.com/developers/)
2. Sign up for free account
3. Create new app and copy your REST API Key

### Step 2: Add API Key
Edit `application.properties`:
```properties
mapmyindia.api.key=YOUR_API_KEY_HERE
```

### Step 3: Test the API
```bash
curl "http://localhost:8080/api/places?q=Pune"
```

---

## 📍 Endpoints Quick Reference

| Endpoint | Method | Parameter | Example |
|----------|--------|-----------|---------|
| `/api/places` | GET | `q=query` | `?q=Mumbai` |
| `/api/places/{placeId}` | GET | `placeId` | `/pune_id_123` |
| `/api/places/search` | GET | `q=query&type=type` | `?q=Pune&type=restaurant` |

---

## 💡 Common Examples

### Find Cities
```bash
curl "http://localhost:8080/api/places?q=Pune"
curl "http://localhost:8080/api/places?q=Mumbai"
curl "http://localhost:8080/api/places?q=Delhi"
```

### Find Restaurants
```bash
curl "http://localhost:8080/api/places/search?q=Pune&type=restaurant"
curl "http://localhost:8080/api/places/search?q=Mumbai&type=restaurant"
```

### Find Hospitals
```bash
curl "http://localhost:8080/api/places/search?q=Delhi&type=hospital"
```

### Find Hotels
```bash
curl "http://localhost:8080/api/places/search?q=Bangalore&type=hotel"
```

### Find ATMs
```bash
curl "http://localhost:8080/api/places/search?q=Hyderabad&type=ATM"
```

---

## 📋 Response Example

```json
[
  {
    "placeName": "Pune",
    "placeAddress": "Pune, Maharashtra, India",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "placeId": "pune_123",
    "typeX": "City",
    "email": null,
    "phone": null,
    "website": null,
    "description": "Technology hub"
  }
]
```

---

## 🎯 Use Cases

### 1. Pickup Location Auto-complete
```javascript
// User typing pickup location
fetch('/api/places?q=pune')
  .then(r => r.json())
  .then(places => showSuggestions(places));
```

### 2. Find Nearby Restaurants
```javascript
// Find restaurants for meeting point
fetch('/api/places/search?q=Pune&type=restaurant')
  .then(r => r.json())
  .then(restaurants => displayMap(restaurants));
```

### 3. Emergency Hospital Search
```javascript
// Find nearest hospitals
fetch('/api/places/search?q=Mumbai&type=hospital')
  .then(r => r.json())
  .then(hospitals => showHospitals(hospitals));
```

### 4. Map Markers
```javascript
// Display place coordinates on map
fetch('/api/places?q=Delhi')
  .then(r => r.json())
  .then(places => {
    places.forEach(p => {
      map.addMarker(p.latitude, p.longitude, p.placeName);
    });
  });
```

---

## 🔧 Implementation Files

Created/Modified:
- ✅ `PlacesController.java` - REST endpoints
- ✅ `MapMyIndiaService.java` - API logic
- ✅ `MapMyIndiaConfig.java` - Configuration
- ✅ `RestClientConfig.java` - RestTemplate bean
- ✅ `MapMyIndiaPlaceDTO.java` - Place data model
- ✅ `MapMyIndiaResponseDTO.java` - API response model
- ✅ `application.properties` - API key config

---

## ✨ Features

✅ Full text search  
✅ Filter by place type  
✅ Get coordinates (latitude/longitude)  
✅ Contact info (phone, email, website)  
✅ Error handling & logging  
✅ Works across all of India  

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "API key not valid" | Check API key in `application.properties` |
| "No results" | Try different search term |
| Connection error | Check internet & MapMyIndia status |
| CORS error | Controller has @CrossOrigin annotation |

---

## 📚 Testing Scenarios

### Test 1: Basic City Search
```bash
GET /api/places?q=Mumbai
# Expected: Mumbai location with coordinates
```

### Test 2: Business Search
```bash
GET /api/places/search?q=Pune&type=hospital
# Expected: Hospitals in Pune
```

### Test 3: Error Handling
```bash
GET /api/places?q=
# Expected: "Search query cannot be empty"
```

### Test 4: Multiple Results
```bash
GET /api/places?q=Delhi
# Expected: All Delhi locations
```

---

## 🗺️ Frontend Integration (React Example)

```jsx
import { useState } from 'react';

function PlaceSearch() {
  const [results, setResults] = useState([]);
  
  const search = async (query) => {
    const res = await fetch(`/api/places?q=${query}`);
    const places = await res.json();
    setResults(places);
  };
  
  return (
    <div>
      <input 
        placeholder="Search place..." 
        onChange={(e) => search(e.target.value)}
      />
      <ul>
        {results.map(p => (
          <li key={p.placeId}>
            {p.placeName} - {p.latitude}, {p.longitude}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 📞 Place Types

Common types you can search:
- City
- Restaurant
- Hospital
- Hotel
- Bank
- ATM
- School
- Market
- Railway Station
- Airport
- Park
- Temple
- Mosque
- Church
- And more...

---

## 🔐 Security Note

**Never commit your API key to Git!**

Use environment variables:
```bash
export MAPMYINDIA_API_KEY=your_key_here
```

Then update `application.properties`:
```properties
mapmyindia.api.key=${MAPMYINDIA_API_KEY}
```

---

## ⚡ Performance Tips

1. **Caching:** Cache frequent searches
2. **Pagination:** Limit results to 10-20 per request
3. **Debouncing:** Debounce auto-complete searches
4. **Timeout:** Set reasonable request timeouts

---

## 📖 Learn More

- [MapMyIndia Docs](https://www.mapmyindia.com/api/)
- [API Reference](https://www.mapmyindia.com/api/advanced-maps/)
- [Sign Up Free](https://www.mapmyindia.com/developers/)

---

## ✅ Checklist Before Using

- [ ] MapMyIndia account created
- [ ] API key generated
- [ ] API key added to `application.properties`
- [ ] Application restarted
- [ ] Test endpoint with curl/Postman
- [ ] Frontend integration tested

---

## 🎉 You're Ready!

Your GoTogether app can now:
✅ Search for pickup/dropoff locations  
✅ Find nearby restaurants, hospitals, hotels  
✅ Display locations on maps  
✅ Provide auto-complete suggestions  
✅ Get GPS coordinates for all places  

Start integrating today! 🚀
