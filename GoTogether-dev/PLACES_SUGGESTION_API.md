# Places Suggestion API Endpoints Documentation

## Overview
This API provides suggestions for Indian cities and towns based on various filters like starting letter, state, type, etc.

## New Endpoints Added

### 1. **Get Suggested Places by Type/Letter**
**Endpoint:** `GET /gotogether/users/places/suggest?type={type}`

**Description:** Returns all places matching the given type/letter. If a single letter is provided (e.g., 'P'), it returns all places starting with that letter. For other inputs, it searches by place name, region, or type.

**Parameters:**
- `type` (required): Single letter, place name, region, or type keyword

**Examples:**

```bash
# Get all places starting with 'P'
GET /gotogether/users/places/suggest?type=p

# Expected Response:
[
  {
    "id": 1,
    "placeName": "Pune",
    "state": "Maharashtra",
    "region": "Deccan",
    "type": "City",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "description": "Technology hub and educational center"
  },
  {
    "id": 2,
    "placeName": "Pimpri-Chinchwad",
    "state": "Maharashtra",
    "region": "Near Pune",
    "type": "City",
    "latitude": 18.6298,
    "longitude": 73.7997,
    "description": "Industrial city near Pune"
  },
  {
    "id": 69,
    "placeName": "Patiala",
    "state": "Punjab",
    "region": "North",
    "type": "City",
    "latitude": 30.3398,
    "longitude": 76.3869,
    "description": "Royal city"
  },
  // ... and more places starting with 'P'
]
```

```bash
# Get places matching 'mumbai'
GET /gotogether/users/places/suggest?type=mumbai

# Response: Returns Mumbai
```

```bash
# Get places of type 'city'
GET /gotogether/users/places/suggest?type=city

# Response: Returns all cities
```

**Response Codes:**
- `200 OK` - Places found
- `200 OK` - No places found (with message in response)
- `400 Bad Request` - Missing or empty type parameter

---

### 2. **Get All Places**
**Endpoint:** `GET /gotogether/users/places/all`

**Description:** Returns a complete list of all 96+ Indian cities and towns available in the database.

**Parameters:** None

**Example:**

```bash
GET /gotogether/users/places/all

# Response: Array of all PlacesSuggestionDTO objects
```

**Response Codes:**
- `200 OK` - Always returns the complete list

---

### 3. **Get Places by State**
**Endpoint:** `GET /gotogether/users/places/state/{state}`

**Description:** Returns all places located in a specific state.

**Parameters:**
- `state` (required, path parameter): Name of the state (case-insensitive)

**Examples:**

```bash
# Get all places in Maharashtra
GET /gotogether/users/places/state/Maharashtra

# Expected Response:
[
  {
    "id": 1,
    "placeName": "Pune",
    "state": "Maharashtra",
    "region": "Deccan",
    "type": "City",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "description": "Technology hub and educational center"
  },
  {
    "id": 2,
    "placeName": "Pimpri-Chinchwad",
    "state": "Maharashtra",
    // ... other fields
  },
  // ... more places in Maharashtra
]
```

```bash
# Get all places in Karnataka
GET /gotogether/users/places/state/Karnataka
```

**Response Codes:**
- `200 OK` - Places found
- `200 OK` - No places found (with message in response)

---

### 4. **Get Places by Exact Type**
**Endpoint:** `GET /gotogether/users/places/type/{type}`

**Description:** Returns all places with an exact type match (e.g., "City", "Hill Station", "Holy City").

**Parameters:**
- `type` (required, path parameter): Type of place (case-insensitive)

**Examples:**

```bash
# Get all hill stations
GET /gotogether/users/places/type/Hill%20Station

# Expected Response:
[
  {
    "id": 70,
    "placeName": "Shimla",
    "state": "Himachal Pradesh",
    "region": "Mountain",
    "type": "Hill Station",
    "latitude": 31.7775,
    "longitude": 77.1073,
    "description": "Queen of hill stations"
  },
  {
    "id": 71,
    "placeName": "Manali",
    "state": "Himachal Pradesh",
    "region": "Mountain",
    "type": "Hill Station",
    "latitude": 32.2432,
    "longitude": 77.1892,
    "description": "Honeymoon capital"
  },
  // ... more hill stations
]
```

```bash
# Get all metropolises
GET /gotogether/users/places/type/Metropolis

# Response: Returns Delhi, Mumbai, Bangalore, Hyderabad, Kolkata
```

**Response Codes:**
- `200 OK` - Places found
- `200 OK` - No places found (with message in response)

---

## Supported Types of Places

The database includes places with the following types:
- **City** - Regular cities
- **Metropolis** - Major metros (Delhi, Mumbai, Bangalore, etc.)
- **Hill Station** - Mountain towns (Shimla, Manali, etc.)
- **Holy City** - Religious cities (Varanasi, Mathura, Rishikesh, etc.)
- **Coastal** - Beach/port cities
- **Union Territory** - Special administrative units
- **Town** - Small towns

---

## Available States in Database

1. Maharashtra
2. Karnataka
3. Tamil Nadu
4. Telangana
5. Andhra Pradesh
6. Delhi
7. Uttar Pradesh
8. Bihar
9. West Bengal
10. Gujarat
11. Rajasthan
12. Madhya Pradesh
13. Punjab
14. Chandigarh
15. Himachal Pradesh
16. Uttarakhand
17. Kerala
18. Goa
19. Haryana
20. Jharkhand
21. Odisha
22. Assam

---

## Places Starting With Each Letter

Currently, places are available for these starting letters:

- **A**: Ahmedabad, Amritsar, Asansol, Agra, Amravati, Ajmer, Alleppey, Asansol
- **B**: Bangalore, Belgaum, Bodh Gaya, Bikaner, Bhopal, Bhubaneswar
- **C**: Chennai, Coimbatore, Cuttack
- **D**: Darjeeling, Dehradun, Davangere, Dharamshala
- **E**: Erode
- **F**: Faridabad
- **G**: Gaya, Gwalior, Ghaziabad, Guwahati
- **H**: Hyderabad, Hubli, Hisar
- **J**: Jaipur, Jodhpur, Jamshedpur, Jabalpur, Jalandhar
- **K**: Kanpur, Kochi, Kozhikode, Kolhapur, Kolkata, Kanyakumari, Khajuraho, Kota
- **L**: Lucknow, Ludhiana
- **M**: Mumbai, Mysore, Madurai, Mangalore, Manali, Munnar, Margao, Mandi, Mathura, Mussoorie
- **N**: Nagpur, Nashik, Nainital, Nizamabad, New Delhi, Noida
- **O**: Ooty
- **P**: Pune, Pimpri-Chinchwad, Patna, Panaji, Ponda, Patiala, Pushkar, Puri
- **R**: Ranchi, Rohtak, Rishikesh, Rajkot
- **S**: Surat, Shimla, Secunderabad, Siliguri
- **T**: Thiruvananthapuram, Tiruppur, Tirupati, Tumkur, Trivandrum
- **U**: Udaipur
- **V**: Vijayawada, Visakhapatnam, Vishakapatnam, Varanasi
- **W**: Warangal

---

## Usage Examples in Frontend (JavaScript/React)

```javascript
// Example 1: Get places starting with 'P'
fetch('/gotogether/users/places/suggest?type=p')
  .then(res => res.json())
  .then(data => console.log(data));

// Example 2: Get all places in Maharashtra
fetch('/gotogether/users/places/state/Maharashtra')
  .then(res => res.json())
  .then(data => console.log(data));

// Example 3: Get all cities
fetch('/gotogether/users/places/type/City')
  .then(res => res.json())
  .then(data => console.log(data));

// Example 4: Get all places
fetch('/gotogether/users/places/all')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Response Format

### Successful Response with Data:
```json
[
  {
    "id": 1,
    "placeName": "Pune",
    "state": "Maharashtra",
    "region": "Deccan",
    "type": "City",
    "latitude": 18.5204,
    "longitude": 73.8567,
    "description": "Technology hub and educational center"
  }
]
```

### Empty Result Response:
```json
{
  "timeStamp": "2025-01-27T10:30:45.123456",
  "message": "No places found for: xyz",
  "status": "SUCCESS",
  "data": []
}
```

### Error Response:
```json
{
  "timeStamp": "2025-01-27T10:30:45.123456",
  "message": "Type parameter cannot be empty",
  "status": "FAILURE"
}
```

---

## Implementation Details

### Files Added/Modified:

1. **PlacesSuggestionDTO.java** (New)
   - Data Transfer Object for place suggestions
   - Contains: id, placeName, state, region, type, latitude, longitude, description

2. **PlacesSuggestionService.java** (New)
   - Business logic for place suggestions
   - Contains 96+ Indian places with coordinates and details
   - Methods: getSuggestedPlacesByType(), getAllPlaces(), getPlacesByState(), getPlacesByExactType()

3. **UserController.java** (Modified)
   - Added 3 new endpoints for places suggestion
   - Integrated PlacesSuggestionService

4. **ApiResponse.java** (Modified)
   - Added optional `data` field to support returning place data with messages

---

## Search Logic

The `getSuggestedPlacesByType()` method follows this logic:

1. If input is a single letter (e.g., 'P'):
   - Returns all places starting with that letter

2. If input is multiple characters:
   - Searches by place name (contains match)
   - Searches by region (contains match)
   - Searches by type (contains match)

3. Case-insensitive matching for all searches

---

## Future Enhancements

Possible improvements:
1. Add more places (villages, tourist sites, landmarks)
2. Add ratings/reviews for places
3. Add distance calculations between places
4. Add weather information for each place
5. Add seasonal information
6. Add nearby attractions/amenities
7. Database persistence (instead of in-memory list)
8. Pagination for large result sets
9. Geolocation-based nearby places
10. Place images and detailed descriptions

---

## Testing

### Using cURL:

```bash
# Test 1: Places starting with P
curl -X GET "http://localhost:8080/gotogether/users/places/suggest?type=p"

# Test 2: All places in Maharashtra
curl -X GET "http://localhost:8080/gotogether/users/places/state/Maharashtra"

# Test 3: All cities
curl -X GET "http://localhost:8080/gotogether/users/places/type/City"

# Test 4: All places
curl -X GET "http://localhost:8080/gotogether/users/places/all"

# Test 5: Places by partial name
curl -X GET "http://localhost:8080/gotogether/users/places/suggest?type=bengal"
```

---

## Notes

- The database is currently in-memory (hardcoded in the service)
- For production use, consider moving to a database
- All searches are case-insensitive
- Latitude and longitude are included for mapping functionality
- Total places: 96+ cities and towns across India
