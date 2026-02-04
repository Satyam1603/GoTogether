# 🎯 KAFKA TESTING - 5 MINUTE QUICK START

## 🚀 START HERE - 5 COMMANDS TO TEST

### Copy-Paste These Commands (In 5 Different Terminals)

---

## Terminal 1: Start Zookeeper
```bash
cd C:\kafka && bin\windows\zookeeper-server-start.bat config\zookeeper.properties
```
**Wait for:** "Started ServerCnxnFactory"

---

## Terminal 2: Start Kafka Broker
```bash
cd C:\kafka && bin\windows\kafka-server-start.bat config\server.properties
```
**Wait for:** "[KafkaServer id=0] started"

---

## Terminal 3: Start User Service (FIRST!)
```bash
cd C:\Users\durve\Downloads\PROJECT\GoTogether-dev && mvn clean install && mvn spring-boot:run
```
**Wait for:** "Started GotogetherUserServiceApplication"

---

## Terminal 4: Start Ride Service
```bash
cd C:\Users\durve\Downloads\PROJECT\GoTogether-ride && mvn clean install && mvn spring-boot:run
```
**Wait for:** "Started GotogetherRideServiceApplication"

---

## Terminal 5: Run These Tests (One at a time)

### TEST 1: Simple Message (Wait 2 seconds, check console logs)
```bash
curl -X GET http://localhost:8081/api/kafka/test
```

**Expected in Ride Service Console:**
```
SENDING MESSAGE: Hello from Ride Service!
MESSAGE SENT SUCCESSFULLY!
```

**Expected in User Service Console:**
```
MESSAGE RECEIVED FROM KAFKA!
Message: Hello from Ride Service!
Ride ID: 1
Event Type: TEST
Processing completed successfully!
```

---

### TEST 2: Custom Message via Postman

**Open Postman or use curl:**

```bash
curl -X POST http://localhost:8081/api/kafka/send \
  -H "Content-Type: application/json" \
  -d '{"message":"Premium ride update","rideId":123,"eventType":"RIDE_UPDATED"}'
```

**Expected in User Service Console:**
```
MESSAGE RECEIVED FROM KAFKA!
Message: Premium ride update
Ride ID: 123
Event Type: RIDE_UPDATED
```

---

### TEST 3: Check Kafka Topic (CLI)

```bash
cd C:\kafka
bin\windows\kafka-console-consumer.bat --topic ride-topic --from-beginning --bootstrap-server localhost:9092 --timeout-ms 5000
```

**Expected Output:**
```
{"message":"Hello from Ride Service!","rideId":1,"eventType":"TEST"}
{"message":"Premium ride update","rideId":123,"eventType":"RIDE_UPDATED"}
```

---

### TEST 4: Verify Consumer Group

```bash
bin\windows\kafka-consumer-groups.bat --describe --group user-service-group --bootstrap-server localhost:9092
```

**Expected Output:**
```
GROUP                 TOPIC      PARTITION CURRENT-OFFSET LAG
user-service-group    ride-topic 0         2              0
```
**Key:** LAG should be 0 (consumer up to date)

---

## ✅ SUCCESS SIGNALS

| What | Where | Signal |
|------|-------|--------|
| Message Sent | Ride Console | SENDING MESSAGE + SENT SUCCESSFULLY |
| Message Received | User Console | MESSAGE RECEIVED FROM KAFKA |
| Kafka Stored | Kafka CLI | JSON message visible |
| Consumer Tracking | Consumer Group | LAG = 0 |

---

## ✨ QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Connection refused :9092" | Start Kafka (Terminal 2) |
| Message not received | Start User Service first (Terminal 3) |
| "Bean not found" error | `mvn clean install` then restart |
| Port in use | `netstat -ano \| findstr :PORT` then kill it |
| No messages in Kafka | Check Ride Service is running |

---

## 📊 TESTING RESULTS

| Test | Result | Time |
|------|--------|------|
| Test 1: Simple Message | ✅ PASS / ❌ FAIL | < 1s |
| Test 2: Custom Message | ✅ PASS / ❌ FAIL | < 1s |
| Test 3: Kafka Topic | ✅ PASS / ❌ FAIL | < 1s |
| Test 4: Consumer Group | ✅ PASS / ❌ FAIL | < 1s |

**Overall: ✅ PASS if all 4 pass**

---

## 🎯 NEXT STEPS

If all tests pass:
1. Read `KAFKA_TESTING_GUIDE.md` for detailed testing
2. Customize the consumer logic
3. Add your business logic
4. Deploy to production

If any test fails:
1. Check terminal for error messages
2. See "QUICK TROUBLESHOOTING" above
3. Read `ERROR_FIX_REPORT.md`
4. Run `mvn clean install` to refresh

---

## 📝 WHAT HAPPENS IN EACH TEST

```
TEST 1: Simple Message
├─ REST API receives request
├─ Producer creates SimpleMessage
├─ KafkaTemplate serializes to JSON
├─ Sends to Kafka at :9092
├─ Kafka stores in "ride-topic"
├─ Consumer listener detects message
├─ SimpleConsumer deserializes
├─ Logs all message details
└─ ✅ Complete!

TEST 2: Custom Message
├─ POST request with custom JSON
├─ Producer receives custom data
├─ Serializes and sends
├─ Consumer receives and logs
└─ ✅ Custom data preserved!

TEST 3: Kafka CLI
├─ Connect to Kafka
├─ List all messages in topic
├─ Show raw JSON data
└─ ✅ Data persisted!

TEST 4: Consumer Group
├─ Check consumer group status
├─ Show offset position
├─ Show consumer lag
└─ ✅ Tracking working!
```

---

## ⏱️ TIMELINE

```
00:00 - Terminal 1: Start Zookeeper
00:15 - Terminal 2: Start Kafka
00:30 - Terminal 3: Start User Service
01:00 - Terminal 4: Start Ride Service
01:30 - Terminal 5: Ready for tests

01:35 - Send Test 1
01:45 - Send Test 2
01:55 - Run Kafka CLI
02:05 - Check Consumer Group

Total: 2 minutes setup + 1.5 minutes testing = 3.5 minutes
```

---

## 🔍 WHERE TO LOOK FOR OUTPUT

**Ride Service Console (Terminal 4):**
```
Look for: SENDING MESSAGE
          MESSAGE SENT SUCCESSFULLY!
```

**User Service Console (Terminal 3):**
```
Look for: MESSAGE RECEIVED FROM KAFKA!
          Message: (content)
          Ride ID: (number)
          Event Type: (type)
          Processing completed!
```

**Kafka Broker Console (Terminal 2):**
```
Look for: No errors (normal operation)
```

**Terminal 5 Output:**
```
Response should be: "Message sent to Kafka!"
```

---

## 🎓 WHAT YOU'RE TESTING

✅ **Producer** → Can Ride Service send messages?
✅ **Serialization** → Can SimpleMessage convert to JSON?
✅ **Kafka** → Can messages be stored?
✅ **Transmission** → Can messages reach Kafka?
✅ **Consumer** → Can User Service receive messages?
✅ **Deserialization** → Can JSON convert back to SimpleMessage?
✅ **Processing** → Can Consumer process messages?
✅ **Persistence** → Are messages stored if consumer offline?
✅ **Offset Tracking** → Does consumer remember position?
✅ **Error Handling** → Does system handle failures?

---

## 🚀 YOU'RE READY!

Just copy the 5 commands above into 5 different terminals and your Kafka is fully tested!

**See KAFKA_TESTING_GUIDE.md for more detailed testing options.**
