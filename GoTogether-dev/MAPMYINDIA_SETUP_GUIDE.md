# MapMyIndia Implementation - Step-by-Step Guide

## 📋 Complete Setup Guide

Follow these steps to get MapMyIndia working in your GoTogether application.

---

## Step 1️⃣: Get MapMyIndia API Key (5 minutes)

### 1.1 Visit MapMyIndia Developer Portal
```
1. Go to: https://www.mapmyindia.com/developers/
2. Click on "Sign Up" (or "Login" if you have an account)
```

### 1.2 Create Free Account
```
- Email: your_email@example.com
- Password: Create a strong password
- Click "Sign Up"
- Verify email (check inbox)
```

### 1.3 Create New Application
```
1. Log in to your account
2. Go to "My Applications" or "Developer Dashboard"
3. Click "Create New Application"
4. Fill in:
   - Application Name: "GoTogether Ride Sharing"
   - Application Type: "Web Application"
   - Website URL: "http://localhost:8080"
5. Click "Create"
```

### 1.4 Copy Your API Key
```
1. Find your newly created application
2. Look for "REST API Key" or similar
3. Copy the entire key (looks like: xxx_xxxx_xxxx_xxxx)
4. Keep it safe - you'll need this
```

---

## Step 2️⃣: Add API Key to Application (2 minutes)

### 2.1 Open application.properties
```
File: src/main/resources/application.properties
```

### 2.2 Find the MapMyIndia Configuration Section
```properties
# Look for these lines:
mapmyindia.api.key=YOUR_MAPMYINDIA_API_KEY_HERE
mapmyindia.api.base-url=https://api.mapmyindia.com
```

### 2.3 Replace the Placeholder
```properties
# BEFORE:
mapmyindia.api.key=YOUR_MAPMYINDIA_API_KEY_HERE

# AFTER:
mapmyindia.api.key=abc123def456ghi789jkl012mno345pqr
```

### 2.4 Save the File
```
Press Ctrl+S (or Cmd+S on Mac)
```

---

## Step 3️⃣: Restart Your Application (2 minutes)

### 3.1 Stop Current Application
```
In IDE:
- Click the red "Stop" button
- Or press Ctrl+F2
```

### 3.2 Wait for Shutdown
```
- Wait for console to show "Stopped" or "Terminated"
- Usually takes 5-10 seconds
```

### 3.3 Start Application Again
```
In IDE:
- Click the green "Run" or "Play" button
- Or press Shift+F10 (Windows) / Ctrl+R (Mac)
- Wait for "Started GoTogetherUserServiceApplication in X seconds"
```

---

## Step 4️⃣: Test the API (3 minutes)

### Option A: Using Browser

#### 4.1 Open Browser
```
Go to: http://localhost:8080/api/places?q=Pune
```

#### 4.2 Expected Response
You should see a JSON array with Pune locations:
```json
[
  {
    "placeName": "Pune",
    "placeAddress": "Pune, Maharashtra, India",
    "latitude": 18.5204,
    "longitude": 73.8567,
    ...
  }
]
```

---

### Option B: Using cURL (Terminal/Command Prompt)

#### 4.1 Open Terminal
```
Windows: Search for "Command Prompt" or "PowerShell"
Mac: Use "Terminal" app
Linux: Open Terminal
```

#### 4.2 Run cURL Command
```bash
curl "http://localhost:8080/api/places?q=Pune"
```

#### 4.3 Expected Output
```json
[{"placeName":"Pune","latitude":18.5204,"longitude":73.8567,...}]
```

---

### Option C: Using Postman

#### 4.1 Open Postman
```
1. Download Postman (free): https://www.postman.com/downloads/
2. Create account and sign in
```

#### 4.2 Create Request
```
- Select: GET
- URL: http://localhost:8080/api/places?q=Pune
- Click: Send
```

#### 4.3 See Response
```
Click on "Pretty" tab to see formatted JSON
```

---

## Step 5️⃣: Test Different Endpoints (5 minutes)

### Test 1: Search for Different Cities

```
http://localhost:8080/api/places?q=Mumbai
http://localhost:8080/api/places?q=Delhi
http://localhost:8080/api/places?q=Bangalore
```

### Test 2: Search for Restaurants

```
http://localhost:8080/api/places/search?q=Pune&type=restaurant
http://localhost:8080/api/places/search?q=Mumbai&type=restaurant
```

### Test 3: Search for Hospitals

```
http://localhost:8080/api/places/search?q=Delhi&type=hospital
http://localhost:8080/api/places/search?q=Bangalore&type=hospital
```

### Test 4: Search for ATMs

```
http://localhost:8080/api/places/search?q=Pune&type=ATM
```

---

## Step 6️⃣: Integrate with Frontend (30 minutes)

### 6.1 Basic HTML Form

```html
<!-- Save as: test.html -->
<!DOCTYPE html>
<html>
<body>

<h2>Search Places</h2>
<input type="text" id="search" placeholder="Enter place name...">
<button onclick="searchPlaces()">Search</button>

<ul id="results"></ul>

<script>
async function searchPlaces() {
  const query = document.getElementById('search').value;
  
  const response = await fetch(
    `/api/places?q=${encodeURIComponent(query)}`
  );
  const places = await response.json();
  
  const resultsList = document.getElementById('results');
  resultsList.innerHTML = '';
  
  places.forEach(place => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${place.placeName}</strong><br>
      ${place.placeAddress}<br>
      Coordinates: ${place.latitude}, ${place.longitude}
    `;
    resultsList.appendChild(li);
  });
}
</script>

</body>
</html>
```

### 6.2 React Component

```jsx
import React, { useState } from 'react';

function PlaceSearch() {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState([]);

  const handleSearch = async () => {
    const res = await fetch(
      `/api/places?q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    setPlaces(data);
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search place..."
      />
      <button onClick={handleSearch}>Search</button>

      <ul>
        {places.map((place) => (
          <li key={place.placeId}>
            <strong>{place.placeName}</strong>
            <p>{place.placeAddress}</p>
            <p>Lat: {place.latitude}, Lng: {place.longitude}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlaceSearch;
```

---

## Step 7️⃣: Add Auto-complete (Optional, 20 minutes)

### 7.1 React Auto-complete

```jsx
import React, { useState, useEffect } from 'react';

function AutoCompletePlaces() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  let debounceTimer;

  useEffect(() => {
    clearTimeout(debounceTimer);
    
    if (input.length > 2) {
      debounceTimer = setTimeout(async () => {
        const res = await fetch(`/api/places?q=${input}`);
        const data = await res.json();
        setSuggestions(data);
      }, 300);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type place name..."
      />
      
      <ul>
        {suggestions.map((place) => (
          <li 
            key={place.placeId}
            onClick={() => {
              setInput(place.placeName);
              setSuggestions([]);
            }}
          >
            {place.placeName}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AutoCompletePlaces;
```

---

## Step 8️⃣: Deploy to Production (Optional)

### 8.1 Build Application

```bash
# In project directory
mvn clean package -DskipTests

# Wait for: BUILD SUCCESS
```

### 8.2 Deploy to Server

```bash
# Copy JAR file to server
scp target/gotogether-user-service-*.jar user@server:/app/

# SSH into server
ssh user@server

# Run application
cd /app
java -jar gotogether-user-service-*.jar
```

### 8.3 Verify Production

```bash
# Test from browser or terminal
curl "http://your-server:8080/api/places?q=Pune"
```

---

## ✅ Verification Checklist

- [ ] Got MapMyIndia API key
- [ ] Added API key to application.properties
- [ ] Restarted the application
- [ ] Tested with browser: http://localhost:8080/api/places?q=Pune
- [ ] Got valid JSON response
- [ ] Tested multiple search queries
- [ ] Integrated with frontend (if needed)
- [ ] All tests passing

---

## 🐛 Troubleshooting

### Issue: "API key not valid" error

**Solution:**
1. Check your API key is correct
2. Make sure there are no extra spaces
3. Visit MapMyIndia console to verify key
4. Try generating a new API key

### Issue: "No results found"

**Solution:**
1. Try different search terms
2. Check MapMyIndia API status
3. Verify API key has correct permissions
4. Check application logs

### Issue: Connection timeout

**Solution:**
1. Check internet connection
2. Verify MapMyIndia API is accessible: https://api.mapmyindia.com
3. Check firewall settings
4. Try adding timeout config

### Issue: CORS error

**Solution:**
- ✓ Already handled in PlacesController
- Make sure you're accessing from correct domain

### Issue: Empty responses

**Solution:**
1. Check API key validity
2. Check request parameters
3. Look at application logs
4. Contact MapMyIndia support

---

## 📞 Getting Help

### MapMyIndia Support
- **Website**: https://www.mapmyindia.com/support/
- **Email**: support@mapmyindia.com
- **Documentation**: https://www.mapmyindia.com/api/

### Common Issues
- Check logs: `tail -f logs/application.log`
- Enable debug: Add `logging.level.com.gotogether=DEBUG` to properties
- Check network: `curl https://api.mapmyindia.com/`

---

## 🎓 Learning Resources

### Official Docs
- [MapMyIndia API Reference](https://www.mapmyindia.com/api/)
- [REST API Documentation](https://www.mapmyindia.com/api/advanced-maps/)

### Our Documentation
- `MAPMYINDIA_QUICK_START.md` - Quick setup
- `MAPMYINDIA_INTEGRATION.md` - Technical details
- `MAPMYINDIA_CODE_EXAMPLES.md` - Real examples

---

## ⏱️ Time Summary

| Step | Time | Status |
|------|------|--------|
| 1. Get API Key | 5 min | ✅ |
| 2. Add to Config | 2 min | ✅ |
| 3. Restart App | 2 min | ✅ |
| 4. Test API | 3 min | ✅ |
| 5. Test Endpoints | 5 min | ✅ |
| 6. Frontend Integration | 30 min | ⏳ Optional |
| **Total** | **~50 min** | |

---

## 🎉 Success!

Once you complete all steps, your GoTogether app will have:

✅ Live place search  
✅ GPS coordinates  
✅ Contact information  
✅ Map integration capability  
✅ Auto-complete support  
✅ Error handling  

---

## 🚀 Next Steps

### Immediate
1. Get API key
2. Run tests
3. Verify everything works

### This Week
1. Integrate with your UI
2. Add auto-complete
3. Test with users

### This Month
1. Deploy to production
2. Monitor usage
3. Optimize performance

---

## 📝 Notes

- Keep your API key secret
- Don't commit API key to Git
- Use environment variables in production
- Monitor your API usage in MapMyIndia console
- Test thoroughly before production deploy

---

## 💡 Pro Tips

1. **Caching**: Cache frequent searches for better performance
2. **Debouncing**: Debounce auto-complete to reduce API calls
3. **Error Handling**: Always handle API errors gracefully
4. **Logging**: Enable logging to debug issues
5. **Rate Limiting**: Implement rate limiting to prevent abuse

---

## ❓ FAQ

**Q: Is MapMyIndia free to use?**
A: Yes, they offer a free tier with limited requests per day.

**Q: What's included in the free tier?**
A: Basic place search, 250 requests/day (approximately).

**Q: Can I upgrade?**
A: Yes, paid plans available for higher limits.

**Q: How accurate is the data?**
A: Very accurate - MapMyIndia uses real-time data.

**Q: What if I exceed rate limits?**
A: API returns 429 error, upgrade your plan.

**Q: Can I use this internationally?**
A: Optimized for India, but may work in other countries.

---

## ✨ Congratulations!

You now have everything needed to integrate MapMyIndia into GoTogether!

**Start with Step 1 and follow the guide - you'll have it working in under an hour!** 🎉

---

**Need help?** Refer to:
- `MAPMYINDIA_QUICK_START.md` for quick answers
- `MAPMYINDIA_INTEGRATION.md` for technical details
- This file for step-by-step walkthrough

**Happy Coding! 🚀**
