# 🧪 KAFKA TESTING GUIDE - COMPLETE

## 📋 TABLE OF CONTENTS
1. Setup & Prerequisites
2. Manual Testing (Curl/Postman)
3. Testing with Kafka CLI Tools
4. Automated Testing (JUnit)
5. Monitoring & Debugging
6. Common Issues & Solutions

---

## ✅ PREREQUISITES

Before testing, verify:
- ✅ Java 21+ installed
- ✅ Maven installed
- ✅ Kafka installed (C:\kafka)
- ✅ All 9 Java files created
- ✅ Both application.properties configured
- ✅ spring-kafka in pom.xml

---

## 🚀 STEP 1: START SERVICES (5 Minutes)

### Open 5 Terminal Windows

#### Terminal 1: Start Zookeeper
```bash
cd C:\kafka
bin\windows\zookeeper-server-start.bat config\zookeeper.properties
```

**Expected Output:**
```
[main] INFO org.apache.zookeeper.server.ZooKeeperServerMain - Server environment java.version=21.0.x
...
[main] INFO org.apache.zookeeper.server.ZooKeeperServerMain - Started ServerCnxnFactory on 0.0.0.0/0.0.0.0:2181
```

**✅ Wait for:** "Started ServerCnxnFactory on 0.0.0.0/0.0.0.0:2181"

---

#### Terminal 2: Start Kafka Broker
```bash
cd C:\kafka
bin\windows\kafka-server-start.bat config\server.properties
```

**Expected Output:**
```
[main] INFO org.apache.kafka.server.KafkaServer - started (id: 0)
...
[main] INFO kafka.server.KafkaServer - [KafkaServer id=0] started
```

**✅ Wait for:** "[KafkaServer id=0] started"

---

#### Terminal 3: Start User Service (Consumer) - FIRST!
```bash
cd C:\Users\durve\Downloads\PROJECT\GoTogether-dev
mvn clean install
mvn spring-boot:run
```

**Expected Output:**
```
[main] INFO org.springframework.boot.StartupInfoLogger - Starting GotogetherUserServiceApplication
...
[main] INFO org.springframework.boot.StartupInfoLogger - Started GotogetherUserServiceApplication in x.xxx seconds
```

**✅ Wait for:** "Started GotogetherUserServiceApplication"

---

#### Terminal 4: Start Ride Service (Producer)
```bash
cd C:\Users\durve\Downloads\PROJECT\GoTogether-ride
mvn clean install
mvn spring-boot:run
```

**Expected Output:**
```
[main] INFO org.springframework.boot.StartupInfoLogger - Starting GotogetherRideServiceApplication
...
[main] INFO org.springframework.boot.StartupInfoLogger - Started GotogetherRideServiceApplication in x.xxx seconds
```

**✅ Wait for:** "Started GotogetherRideServiceApplication"

---

## 🧪 STEP 2: TEST 1 - SIMPLE TEST MESSAGE

### Using Terminal 5 (Curl)

```bash
curl -X GET http://localhost:8081/api/kafka/test
```

**Expected Response:**
```
"Message sent to Kafka!"
```

### What Should Happen:

**Ride Service Console (Terminal 4):**
```
SENDING MESSAGE: Hello from Ride Service!
MESSAGE SENT SUCCESSFULLY!
```

**User Service Console (Terminal 3):**
```
====================================
MESSAGE RECEIVED FROM KAFKA!
====================================
Message: Hello from Ride Service!
Ride ID: 1
Event Type: TEST
====================================
Processing completed successfully!
```

### ✅ Test Result
If you see both messages → **PASS ✅**

---

## 🧪 STEP 3: TEST 2 - CUSTOM MESSAGE

### Using Postman

**Step 1: Open Postman**

**Step 2: Create New Request**
- Method: **POST**
- URL: **http://localhost:8081/api/kafka/send**

**Step 3: Set Headers**
- Key: `Content-Type`
- Value: `application/json`

**Step 4: Set Body (JSON)**
```json
{
  "message": "Ride has been updated to premium",
  "rideId": 123,
  "eventType": "RIDE_UPDATED"
}
```

**Step 5: Click Send**

### Expected Response:
```
"Custom message sent!"
```

### Expected Console Output:

**Ride Service:**
```
SENDING MESSAGE: Ride has been updated to premium
MESSAGE SENT SUCCESSFULLY!
```

**User Service:**
```
Message: Ride has been updated to premium
Ride ID: 123
Event Type: RIDE_UPDATED
```

### ✅ Test Result
If message appears in User Service → **PASS ✅**

---

## 🧪 STEP 4: TEST 3 - MULTIPLE MESSAGES

### Send Multiple Messages

```bash
# Send 3 messages quickly
curl -X GET http://localhost:8081/api/kafka/test
curl -X GET http://localhost:8081/api/kafka/test
curl -X GET http://localhost:8081/api/kafka/test
```

**Expected:**
- All 3 messages appear in User Service console
- Each message shows offset increasing (0, 1, 2)
- Consumer processes all without error

### ✅ Test Result
If all 3 messages received → **PASS ✅**

---

## 🧪 STEP 5: TEST 4 - ERROR HANDLING

### Send Message While Consumer Paused

**Step 1: Stop User Service**
- Go to Terminal 3
- Press `Ctrl + C` to stop

**Step 2: Send Message**
```bash
curl -X GET http://localhost:8081/api/kafka/test
```

**Step 3: Restart User Service**
```bash
cd C:\Users\durve\Downloads\PROJECT\GoTogether-dev
mvn spring-boot:run
```

**Expected:**
- Ride Service sends message successfully
- Kafka stores the message
- User Service restarts and receives stored message

### ✅ Test Result
If message received after restart → **PASS ✅**

---

## 🔧 KAFKA CLI TESTING

### Test 1: List Topics

```bash
cd C:\kafka
bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092
```

**Expected Output:**
```
__consumer_offsets
ride-topic
```

**✅ Verify:** "ride-topic" exists

---

### Test 2: View Messages in Topic

```bash
bin\windows\kafka-console-consumer.bat --topic ride-topic --from-beginning --bootstrap-server localhost:9092
```

**Expected:**
```
{"message":"Hello from Ride Service!","rideId":1,"eventType":"TEST"}
{"message":"Custom message","rideId":123,"eventType":"RIDE_UPDATED"}
```

**✅ Press Ctrl+C to stop**

---

### Test 3: Check Consumer Group

```bash
bin\windows\kafka-consumer-groups.bat --list --bootstrap-server localhost:9092
```

**Expected Output:**
```
user-service-group
```

---

### Test 4: Consumer Group Details

```bash
bin\windows\kafka-consumer-groups.bat --describe --group user-service-group --bootstrap-server localhost:9092
```

**Expected Output:**
```
GROUP           TOPIC      PARTITION CURRENT-OFFSET LOG-END-OFFSET LAG MEMBER
user-service-group ride-topic 0      2              2              0   ...
```

**Key Info:**
- `CURRENT-OFFSET`: Messages processed (should equal LOG-END-OFFSET)
- `LAG`: 0 means consumer is up to date
- `LAG > 0` means consumer is behind

---

## 📊 TESTING CHECKLIST

### Startup Tests
- [ ] Zookeeper starts successfully
- [ ] Kafka broker starts successfully
- [ ] User Service starts on port 8080
- [ ] Ride Service starts on port 8081
- [ ] No errors in any console

### API Tests
- [ ] GET /api/kafka/test returns "Message sent to Kafka!"
- [ ] POST /api/kafka/send accepts JSON and returns response
- [ ] Both endpoints respond within 1 second

### Message Flow Tests
- [ ] Message appears in Kafka topic (CLI shows it)
- [ ] Consumer receives message
- [ ] Message content matches what was sent
- [ ] Consumer logs show proper format

### Reliability Tests
- [ ] Message persists if consumer is stopped
- [ ] Consumer receives message after restart
- [ ] Multiple messages processed in order
- [ ] No duplicate messages

### Error Handling Tests
- [ ] Consumer handles errors gracefully
- [ ] Failed messages are logged
- [ ] Offset only commits on success
- [ ] Service recovers from failures

---

## 🔍 MONITORING & DEBUGGING

### Check Logs in Real-Time

**Ride Service:**
```bash
# Terminal with Ride Service running
# Look for lines starting with:
# - SENDING MESSAGE
# - MESSAGE SENT SUCCESSFULLY
```

**User Service:**
```bash
# Terminal with User Service running
# Look for lines starting with:
# - MESSAGE RECEIVED FROM KAFKA
# - Message:
# - Ride ID:
# - Event Type:
```

### Kafka Topic Size

```bash
bin\windows\kafka-log-dirs.bat --bootstrap-server localhost:9092 --describe
```

### Consumer Lag

```bash
bin\windows\kafka-consumer-groups.bat --describe --group user-service-group --bootstrap-server localhost:9092
```

**Lag = 0** means consumer is current
**Lag > 0** means consumer is behind

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Connection Refused"
```
Error: Connection refused to localhost:9092
```

**Solution:**
- Make sure Kafka broker is running (Terminal 2)
- Check if port 9092 is available
- Kill any process on 9092

### Issue 2: "Bean Not Found" Error
```
Parameter 0 required bean KafkaTemplate not found
```

**Solution:**
- Clean Eclipse cache: Project → Clean
- Run: Maven → Update Project
- Restart Eclipse
- Run mvn clean install again

### Issue 3: Messages Not Received by Consumer
```
User Service doesn't show "MESSAGE RECEIVED"
```

**Cause 1:** Consumer not started
- **Solution:** Start User Service (Terminal 3) first

**Cause 2:** Different topic names
- **Solution:** Check both use "ride-topic"

**Cause 3:** Consumer group issue
- **Solution:** Delete group: 
  ```bash
  kafka-consumer-groups --delete --group user-service-group --bootstrap-server localhost:9092
  ```
  Then restart User Service

### Issue 4: Offset Not Advancing
```
CURRENT-OFFSET stays at 0, LAG increases
```

**Solution:**
- Check User Service is receiving messages
- Verify no exceptions in consumer
- Check if message processing is very slow

### Issue 5: Port Already in Use
```
Port 8080 or 8081 already in use
```

**Solution:**
```bash
# Find process on port
netstat -ano | findstr :8080
netstat -ano | findstr :8081

# Kill it
taskkill /PID <PID> /F
```

---

## ✨ AUTOMATED TESTING (OPTIONAL)

### Create JUnit Test

Create file: `RideServiceKafkaTest.java`

```java
@SpringBootTest
@AutoConfigureEmbeddedKafka
class RideServiceKafkaTest {
    
    @Autowired
    private SimpleProducer simpleProducer;
    
    @SpyBean
    private SimpleConsumer simpleConsumer;
    
    @Test
    void testKafkaMessageFlow() throws InterruptedException {
        // Create message
        SimpleMessage msg = new SimpleMessage();
        msg.setMessage("Test message");
        msg.setRideId(1L);
        msg.setEventType("TEST");
        
        // Send
        simpleProducer.sendMessage(msg);
        
        // Wait for async processing
        Thread.sleep(2000);
        
        // Verify consumer was called
        verify(simpleConsumer, timeout(5000)).consumeMessage(any());
    }
}
```

### Run Test
```bash
mvn test
```

---

## 📈 PERFORMANCE TESTING

### Load Test: Send 100 Messages

```bash
# Create loop in PowerShell
for($i=0; $i -lt 100; $i++) {
    curl -X GET http://localhost:8081/api/kafka/test
}
```

**Monitor:**
- Ride Service: Can it send 100 messages?
- Kafka: Can it store all?
- Consumer: Can it process all without lag?

### Expected Behavior:
- All 100 messages sent
- All 100 messages stored in Kafka
- All 100 messages received by consumer
- Time: ~10-30 seconds

---

## 📊 TEST RESULTS TEMPLATE

```
TEST SUMMARY
============

Date: 2026-02-03
Test Duration: 15 minutes

STARTUP TESTS
[ ] Zookeeper started
[ ] Kafka started
[ ] User Service started (8080)
[ ] Ride Service started (8081)

API TESTS
[ ] GET /api/kafka/test works
[ ] POST /api/kafka/send works
[ ] Response time < 1 second

MESSAGE FLOW TESTS
[ ] Message sent by producer
[ ] Message stored in Kafka
[ ] Consumer received message
[ ] Message content correct

RELIABILITY TESTS
[ ] Consumer restart: message persisted
[ ] Multiple messages processed
[ ] No duplicate processing
[ ] Error handling works

KAFKA CLI TESTS
[ ] Topic "ride-topic" exists
[ ] Messages visible in topic
[ ] Consumer group exists
[ ] Offset tracking works

OVERALL: ✅ PASS / ❌ FAIL
```

---

## 🎓 WHAT TO LOOK FOR IN LOGS

### Producer Logs (Ride Service)
```
✅ SENDING MESSAGE: Hello from Ride Service!
✅ MESSAGE SENT SUCCESSFULLY!
❌ ERROR: Connection refused
```

### Consumer Logs (User Service)
```
✅ MESSAGE RECEIVED FROM KAFKA!
✅ Message: Hello from Ride Service!
✅ Ride ID: 1
✅ Event Type: TEST
✅ Processing completed successfully!

❌ Error processing message
❌ Connection refused
```

### Kafka Logs (Broker)
```
✅ [KafkaServer id=0] started
✅ Created log for partition ride-topic-0
✅ [GroupCoordinator brokerId=0] Stabilized group
```

---

## 🚀 QUICK TEST COMMANDS

### Test Everything in 2 Minutes

```bash
# Terminal 5 - Run these commands one by one

# Test 1: Simple message
curl -X GET http://localhost:8081/api/kafka/test

# Wait 2 seconds, check console for message

# Test 2: Custom message (using Postman or curl)
curl -X POST http://localhost:8081/api/kafka/send \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","rideId":99,"eventType":"TEST"}'

# Test 3: Check topic
cd C:\kafka
bin\windows\kafka-console-consumer.bat --topic ride-topic --from-beginning --bootstrap-server localhost:9092

# You should see JSON messages from Kafka
```

---

## ✅ SUCCESS CRITERIA

Your Kafka setup is working correctly if:

✅ **Startup Phase**
- All services start without errors
- No connection refused messages
- Both services show "Started" message

✅ **Send Phase**
- REST API responds with 200 OK
- Ride Service logs "MESSAGE SENT SUCCESSFULLY!"
- No timeout errors

✅ **Storage Phase**
- Kafka CLI shows messages in topic
- Topic "ride-topic" exists
- Messages stored as JSON

✅ **Receive Phase**
- User Service receives message immediately
- Consumer logs show all message fields
- No deserialization errors

✅ **Process Phase**
- Message processing completes successfully
- Offset is committed (LAG = 0)
- No duplicate processing

---

## 🎯 NEXT STEPS

If all tests pass:
1. Read documentation guides
2. Customize message processing
3. Add database persistence
4. Add email sending
5. Add monitoring/alerting

If tests fail:
1. Check error messages
2. Review troubleshooting section
3. Verify all prerequisites
4. Check file contents match examples
5. Try restarting all services

---

## 📞 NEED HELP?

Common errors and solutions are in the "COMMON ISSUES" section above.

If stuck:
1. Check "ERROR_FIX_REPORT.md"
2. Read "KAFKA_LINE_BY_LINE.md"
3. Review all 5 terminal windows for errors
4. Check that all files are created correctly
