# MapMyIndia Geocode API - Complete Testing Guide

## 🧪 Testing the Fixed API Integration

Now that we've fixed the API response format, follow this guide to test everything.

---

## Step 1️⃣: Verify Configuration

### Check application.properties
```
File: src/main/resources/application.properties

Required lines:
mapmyindia.api.key=YOUR_API_KEY_HERE
mapmyindia.api.base-url=https://api.mapmyindia.com
```

✅ If you see these → You're good!  
❌ If missing → Add them before testing

---

## Step 2️⃣: Start the Application

### In IDE (STS/IntelliJ)
```
1. Right-click Project
2. Run As → Spring Boot App
3. Wait for: "Started GoTogetherUserServiceApplication in X seconds"
4. Check console for any errors
```

### Terminal/Command Prompt
```bash
cd C:\Users\durve\Downloads\GoTogether-dev\ 
mvnw spring-boot:run
```

### Expected Console Output
```
Started GoTogetherUserServiceApplication in 15.234 seconds
```

✅ If you see this → App is running!

---

## Step 3️⃣: Test with cURL (Recommended)

### Open Command Prompt

#### Test 1: Search for Pune
```bash
curl "http://localhost:8080/api/places?address=Pune"
```

**Expected Output:**
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

✅ If you see this format → Success!

#### Test 2: Search for Mumbai
```bash
curl "http://localhost:8080/api/places?address=Mumbai"
```

#### Test 3: Search for Delhi
```bash
curl "http://localhost:8080/api/places?address=Delhi"
```

#### Test 4: Search for Bangalore
```bash
curl "http://localhost:8080/api/places?address=Bangalore"
```

#### Test 5: Search with Multiple Words
```bash
curl "http://localhost:8080/api/places?address=Pimpri%20Chinchwad"
```

(Note: %20 is space character encoded)

---

## Step 4️⃣: Test with Browser

### Open Firefox/Chrome/Edge

#### Test URL 1
```
http://localhost:8080/api/places?address=Pune
```

Copy and paste in address bar, press Enter.

#### Expected Result
You should see JSON response directly in browser.

**Looks like this:**
```
[{"placeName":"Pune","fullAddress":"Pune, Maharashtra",...}]
```

✅ If you see JSON → Working!

#### Test URL 2
```
http://localhost:8080/api/places?address=Mumbai
```

#### Test URL 3
```
http://localhost:8080/api/places?address=Delhi
```

---

## Step 5️⃣: Test with Postman

### 5.1 Download & Install Postman
```
1. Visit: https://www.postman.com/downloads/
2. Download for your OS
3. Install and create account
```

### 5.2 Create Request
```
1. Click "New"
2. Select "HTTP Request"
3. In URL box, enter: http://localhost:8080/api/places?address=Pune
4. Select: GET
5. Click "Send"
```

### 5.3 View Response
```
1. Look at "Response" tab
2. Click "Pretty" button
3. You should see formatted JSON
```

### 5.4 Test Multiple Queries

| Address | URL |
|---------|-----|
| Pune | `http://localhost:8080/api/places?address=Pune` |
| Mumbai | `http://localhost:8080/api/places?address=Mumbai` |
| Delhi | `http://localhost:8080/api/places?address=Delhi` |
| Bangalore | `http://localhost:8080/api/places?address=Bangalore` |
| Hyderabad | `http://localhost:8080/api/places?address=Hyderabad` |

---

## Step 6️⃣: Verify Response Format

### Check These Fields Are Present

```json
{
  "placeName": "...",          ✅ Should be filled
  "fullAddress": "...",        ✅ Should be filled
  "city": "...",              ✅ Should be filled
  "district": "...",          ✅ May be empty
  "state": "...",             ✅ Should be filled
  "eLoc": "...",             ✅ Should be filled
  "geocodeLevel": "...",      ✅ Should be filled
  "confidenceScore": 0.0      ✅ Should be a number
}
```

✅ If all fields present → Format is correct!

---

## Step 7️⃣: Test Error Handling

### Test 1: Empty Query
```bash
curl "http://localhost:8080/api/places?address="
```

**Expected Response:**
```json
{
  "timeStamp": "2025-01-27T10:30:45.123456",
  "message": "Search query cannot be empty",
  "status": "FAILURE"
}
```

✅ If you get error message → Error handling works!

### Test 2: Invalid Parameter Name
```bash
curl "http://localhost:8080/api/places?q=Pune"
```

**Expected Response:**
Should show error because parameter should be `address` not `q`

✅ Confirms correct parameter validation

### Test 3: Very Long Query
```bash
curl "http://localhost:8080/api/places?address=This%20is%20a%20very%20long%20search%20query%20that%20probably%20wont%20match%20anything"
```

**Expected Response:**
```json
[
  {
    "timeStamp": "...",
    "message": "No places found for: ...",
    "status": "SUCCESS",
    "data": []
  }
]
```

✅ If you get "no results" → Proper handling!

---

## Step 8️⃣: Check Logs

### Enable Debug Logging

Add to `application.properties`:
```properties
logging.level.com.gotogether.user.service.MapMyIndiaService=DEBUG
logging.level.com.gotogether.user.controller.PlacesController=DEBUG
```

### Restart Application
- Stop and start again
- Now you'll see debug messages

### Look for These Log Messages

```
Received place search request with query: Pune
Calling MapMyIndia API with URL: https://api.mapmyindia.com/search/address/geocode?...
Received X results from MapMyIndia API
Successfully retrieved X places for query: Pune
```

✅ If you see these → All working correctly!

---

## Step 9️⃣: Test Different Scenarios

### Scenario 1: City Search
```bash
curl "http://localhost:8080/api/places?address=Pune"
curl "http://localhost:8080/api/places?address=Mumbai"
curl "http://localhost:8080/api/places?address=Delhi"
```

### Scenario 2: District Search
```bash
curl "http://localhost:8080/api/places?address=Pune%20District"
curl "http://localhost:8080/api/places?address=Mumbai%20Suburban%20District"
```

### Scenario 3: Locality Search
```bash
curl "http://localhost:8080/api/places?address=Koregaon%20Park"
```

### Scenario 4: Confidence Score Check
```bash
curl "http://localhost:8080/api/places?address=Pune" | grep confidenceScore
```

You should see: `"confidenceScore": 0.8` or similar

---

## Step 🔟: Integration Testing

### Test with Frontend JavaScript

Create a file `test.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <title>MapMyIndia API Test</title>
</head>
<body>

<h2>Test MapMyIndia API</h2>
<input type="text" id="address" placeholder="Enter address..." value="Pune">
<button onclick="testAPI()">Search</button>
<pre id="response"></pre>

<script>
async function testAPI() {
  const address = document.getElementById('address').value;
  const url = `http://localhost:8080/api/places?address=${encodeURIComponent(address)}`;
  
  document.getElementById('response').textContent = 'Loading...';
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    document.getElementById('response').textContent = JSON.stringify(data, null, 2);
  } catch (error) {
    document.getElementById('response').textContent = 'Error: ' + error.message;
  }
}
</script>

</body>
</html>
```

### Test Steps
1. Open this HTML file in browser
2. Enter different addresses
3. Click "Search"
4. See response in JSON format

---

## ✅ Comprehensive Test Checklist

### Basic Functionality
- [ ] Can search for "Pune"
- [ ] Can search for "Mumbai"
- [ ] Can search for "Delhi"
- [ ] Response is valid JSON
- [ ] Response includes placeName
- [ ] Response includes fullAddress

### Response Format
- [ ] placeName field is present
- [ ] fullAddress field is present
- [ ] city field is present
- [ ] state field is present
- [ ] eLoc field is present
- [ ] geocodeLevel field is present
- [ ] confidenceScore field is numeric

### Error Handling
- [ ] Empty query shows error
- [ ] Invalid parameter shows error
- [ ] No results shows appropriate message
- [ ] Errors are JSON formatted
- [ ] Errors include status and message

### Performance
- [ ] Response time < 1 second
- [ ] No timeout errors
- [ ] No memory errors
- [ ] Consistent results on repeat searches

### Logging
- [ ] Debug logs show API call
- [ ] Debug logs show results count
- [ ] Error logs capture exceptions
- [ ] Logs help troubleshoot issues

---

## 🐛 Troubleshooting

### Issue: 404 Not Found

**Cause:** Wrong endpoint or server not running

**Fix:**
```
1. Check server is running (see step 2)
2. Verify URL: http://localhost:8080/api/places?address=Pune
3. Check port is 8080
```

### Issue: JSON Parse Error

**Cause:** Response is not valid JSON

**Fix:**
```
1. Check no errors in console
2. Verify API key is valid
3. Check MapMyIndia API status
```

### Issue: Empty Response

**Cause:** API returned empty copResults

**Fix:**
```
1. Try different search query
2. Check address parameter spelling
3. Verify API key has permissions
```

### Issue: Connection Timeout

**Cause:** MapMyIndia server slow or unreachable

**Fix:**
```
1. Check internet connection
2. Wait a moment and retry
3. Check MapMyIndia status page
4. Increase timeout in RestTemplate config
```

### Issue: "Search query cannot be empty"

**Cause:** Missing or empty address parameter

**Fix:**
```
1. Add address parameter: ?address=Pune
2. Make sure it's not empty
3. Use proper URL encoding for spaces (%20)
```

---

## 📊 Success Criteria

Your implementation is working correctly if:

✅ All curl commands return JSON  
✅ Response includes placeName field  
✅ Response includes state and city  
✅ Error handling works correctly  
✅ Searches are fast (< 1 second)  
✅ Different addresses return different results  
✅ Browser and Postman work the same  

---

## 🎯 Sample Test Results

### Working (Success)
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

### Working (Multiple Results)
```json
[
  {
    "placeName": "Pune",
    "fullAddress": "Pune, Maharashtra",
    ...
  },
  {
    "placeName": "Pune District",
    "fullAddress": "Pune District, Maharashtra",
    ...
  }
]
```

### Error (Empty Query)
```json
{
  "timeStamp": "2025-01-27T10:30:45.123456",
  "message": "Search query cannot be empty",
  "status": "FAILURE"
}
```

---

## 📞 Quick Reference

| Test Case | Command | Expected Result |
|-----------|---------|-----------------|
| Basic | `curl "...?address=Pune"` | JSON with placeName="Pune" |
| Empty | `curl "...?address="` | Error message |
| Invalid param | `curl "...?q=Pune"` | Error message |
| Multiple words | `curl "...?address=Pimpri%20Chinchwad"` | JSON results |
| No results | `curl "...?address=xyz123abc"` | Empty array |

---

## 🚀 After Testing

Once all tests pass:

1. ✅ You can deploy to production
2. ✅ You can integrate with frontend
3. ✅ You can use in GoTogether app
4. ✅ You can add to documentation

---

## 📝 Test Report Template

```
MapMyIndia API Test Report
==========================

Date: ___________
Tester: ___________

Basic Functionality:
- Pune search: ___________
- Mumbai search: ___________
- Delhi search: ___________

Response Format:
- placeName present: ___________
- fullAddress present: ___________
- State present: ___________

Error Handling:
- Empty query: ___________
- Invalid param: ___________

Performance:
- Response time: ___________ seconds

Overall: ✅ PASS / ❌ FAIL

Notes:
_________________________________
_________________________________
```

---

## 🎓 What Each Test Verifies

| Test | Verifies |
|------|----------|
| Pune search | API connectivity |
| Different cities | Parameter handling |
| Empty query | Error handling |
| Response format | DTO mapping |
| Performance | Network latency |
| Browser test | CORS configuration |
| Postman test | HTTP standards |

---

## ✨ Complete Test Command

Run all tests in sequence:

```bash
# Test 1: Pune
curl "http://localhost:8080/api/places?address=Pune"

# Test 2: Mumbai
curl "http://localhost:8080/api/places?address=Mumbai"

# Test 3: Delhi
curl "http://localhost:8080/api/places?address=Delhi"

# Test 4: Bangalore
curl "http://localhost:8080/api/places?address=Bangalore"

# Test 5: Error - Empty Query
curl "http://localhost:8080/api/places?address="

# Test 6: Error - Wrong Parameter
curl "http://localhost:8080/api/places?q=Pune"
```

---

## 🎉 You're Ready to Test!

Everything is configured and ready. Follow these steps and your API will be fully tested and verified!

**Happy Testing!** 🚀

---

**Last Updated:** January 27, 2026  
**Version:** 1.0  
**Status:** Ready for Testing
