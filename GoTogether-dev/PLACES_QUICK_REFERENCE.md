# Places Suggestion API - Quick Reference

## Quick Start

Add this to your `pom.xml` (already included in project):
```xml
<!-- No additional dependencies needed - uses Spring REST -->
```

## Test Right Away!

```bash
# 1. Get all places starting with 'P'
curl "http://localhost:8080/gotogether/users/places/suggest?type=p"

# 2. Get all places in Maharashtra
curl "http://localhost:8080/gotogether/users/places/state/Maharashtra"

# 3. Get all places of type "City"
curl "http://localhost:8080/gotogether/users/places/type/City"

# 4. Get all 96+ places
curl "http://localhost:8080/gotogether/users/places/all"
```

## Endpoints Summary

| Endpoint | Method | Parameter | Example |
|----------|--------|-----------|---------|
| `/places/suggest` | GET | `type` (letter/name/region/type) | `?type=p` or `?type=maharashtra` |
| `/places/all` | GET | None | - |
| `/places/state/{state}` | GET | `state` (path) | `/state/Maharashtra` |
| `/places/type/{type}` | GET | `type` (path) | `/type/City` |

## Response Example

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
  }
]
```

## Use Cases

### 1. Auto-complete Search
```javascript
// User types 'p' in a place search box
fetch('/gotogether/users/places/suggest?type=p')
  .then(res => res.json())
  .then(places => updateSuggestions(places));
```

### 2. Filter by State
```javascript
// User selects Maharashtra state
fetch('/gotogether/users/places/state/Maharashtra')
  .then(res => res.json())
  .then(places => displayPlaces(places));
```

### 3. Find All Cities
```javascript
// Show only cities, not hill stations or holy cities
fetch('/gotogether/users/places/type/City')
  .then(res => res.json())
  .then(cities => displayCities(cities));
```

### 4. Display Nearby Pickup Points
```javascript
// Show all places in user's area
const userState = "Maharashtra";
fetch(`/gotogether/users/places/state/${userState}`)
  .then(res => res.json())
  .then(places => showPickupPoints(places));
```

## Features

✅ 96+ Indian cities and towns  
✅ Search by starting letter (e.g., 'P' for Pune, Pimpri, Patiala)  
✅ Search by place name (partial or full)  
✅ Filter by state  
✅ Filter by type (City, Hill Station, Metropolis, Holy City, etc.)  
✅ Includes GPS coordinates for mapping  
✅ Includes descriptions for each place  

## Database Content

**States Covered:** 22 states + Union Territories
- Maharashtra (8 places)
- Karnataka (7 places)
- Tamil Nadu (7 places)
- Telangana (4 places)
- Andhra Pradesh (4 places)
- Delhi (4 places)
- Uttar Pradesh (6 places)
- And 14 more states...

**Types Available:**
- City
- Metropolis
- Hill Station
- Holy City
- Coastal
- Town
- Union Territory

**Starting Letters:** A-W (all major Indian cities)

## HTML Form Example

```html
<form>
  <input type="text" id="placeSearch" placeholder="Enter place name or letter (P, C, etc)">
  <button onclick="searchPlaces()">Search</button>
  <ul id="results"></ul>
</form>

<script>
function searchPlaces() {
  const type = document.getElementById('placeSearch').value;
  
  fetch(`/gotogether/users/places/suggest?type=${type}`)
    .then(res => res.json())
    .then(places => {
      const resultsList = document.getElementById('results');
      resultsList.innerHTML = '';
      places.forEach(place => {
        const li = document.createElement('li');
        li.textContent = `${place.placeName}, ${place.state}`;
        resultsList.appendChild(li);
      });
    });
}
</script>
```

## Integration Points

This API is perfect for:

1. **Ride Booking** - Allow users to select pickup/dropoff locations
2. **Driver Registration** - Pre-fill available cities/zones
3. **Location Filtering** - Filter rides by origin/destination
4. **Map Display** - Show all places with coordinates
5. **Auto-complete** - Suggest places as user types
6. **City-based Offers** - Customize offers for specific cities

## Notes

- All searches are **case-insensitive**
- Coordinates can be used with map APIs (Google Maps, Leaflet, etc.)
- No authentication required for these endpoints
- Returns empty list if no matches found
- Very fast response times (in-memory data)

## For More Details

See `PLACES_SUGGESTION_API.md` for complete documentation.
