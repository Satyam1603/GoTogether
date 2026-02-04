# KAFKA SIMPLE IMPLEMENTATION - QUICK REFERENCE

## WHAT IS KAFKA?
Kafka is a message broker - it allows services to communicate asynchronously.

**Analogy:** 
- Service A = Sender (puts message in mailbox)
- Kafka = Postal Service (stores and delivers)
- Service B = Receiver (reads from mailbox)

**Benefits:**
- Services don't need to know about each other
- Loose coupling
- Asynchronous processing
- Can handle high volume of messages

---

## ARCHITECTURE

```
┌──────────────────┐
│  Ride Service    │
│  (PRODUCER)      │ ──sends message──> ┌─────────────────┐
│  Port: 8081      │                    │ KAFKA BROKER    │
└──────────────────┘                    │ localhost:9092  │
                                        └─────────────────┘
                                               │
                                               │
┌──────────────────┐                          │
│  User Service    │ <──reads message────────┘
│  (CONSUMER)      │
│  Port: 8080      │
└──────────────────┘
```

---

## FILES CREATED

### PRODUCER (Ride Service)

#### 1. **SimpleMessage.java**
```
Location: src/main/java/com/gotogether/ride/kafka/
Purpose: Data class for messages
```
**Line-by-line:**
- `@Data` - Lombok: auto-generates getters, setters, equals, toString
- `@NoArgsConstructor` - Lombok: creates empty constructor
- `@AllArgsConstructor` - Lombok: creates constructor with all fields
- `message: String` - The message text to send
- `rideId: Long` - The ride ID associated with message
- `eventType: String` - Type of event: TEST, RIDE_UPDATED, etc.

#### 2. **SimpleProducer.java**
```
Location: src/main/java/com/gotogether/ride/kafka/
Purpose: Sends messages to Kafka
```
**Line-by-line:**
```java
private final KafkaTemplate<String, Object> kafkaTemplate;
// Spring injects this bean automatically
// Uses: String for key, Object for value (will be serialized to JSON)

private final String TOPIC = "ride-topic";
// Topic name - like a channel/queue name

public void sendMessage(SimpleMessage message) {
    logger.info("SENDING MESSAGE: {}", message.getMessage());
    // Log before sending (for debugging)
    
    kafkaTemplate.send(TOPIC, message);
    // Send message to "ride-topic"
    // KafkaTemplate automatically:
    // 1. Serializes SimpleMessage to JSON
    // 2. Sends to Kafka broker
    // 3. Kafka stores in topic
    
    logger.info("MESSAGE SENT SUCCESSFULLY!");
    // Log after sending
}
```

#### 3. **KafkaTestController.java**
```
Location: src/main/java/com/gotogether/ride/controller/
Purpose: REST API to test Kafka
```
**Endpoints:**
```
GET  http://localhost:8081/api/kafka/test
  → Sends: "Hello from Ride Service!"
  → Returns: "Message sent to Kafka!"

POST http://localhost:8081/api/kafka/send
  → Request body:
     {
       "message": "Custom text",
       "rideId": 5,
       "eventType": "RIDE_UPDATED"
     }
  → Returns: "Custom message sent!"
```

#### 4. **KafkaProducerConfigSimple.java**
```
Location: src/main/java/com/gotogether/ride/kafka/config/
Purpose: Configure how messages are sent
```
**Key configurations:**
```
bootstrap-servers = localhost:9092
  → Kafka broker address

KEY_SERIALIZER = StringSerializer
  → Convert key to bytes: "ride-1" → bytes

VALUE_SERIALIZER = JsonSerializer
  → Convert message to bytes: SimpleMessage → JSON → bytes

ACKS = "all"
  → Wait for all brokers to save before returning

RETRIES = 3
  → Retry 3 times if send fails

LINGER_MS = 10
  → Wait 10ms to batch messages (improves throughput)

COMPRESSION = "snappy"
  → Compress messages to save bandwidth
```

---

### CONSUMER (User Service)

#### 1. **SimpleMessage.java**
```
Location: src/main/java/com/gotogether/user/kafka/
Purpose: Same message class (both services use it)
```
**Same as producer**

#### 2. **SimpleConsumer.java**
```
Location: src/main/java/com/gotogether/user/kafka/
Purpose: Listen to Kafka messages
```
**Line-by-line:**
```java
@KafkaListener(
    topics = "ride-topic",
    // Listen to this topic
    
    groupId = "user-service-group",
    // Consumer group ID
    // Multiple consumers with same group share messages
    
    containerFactory = "kafkaListenerContainerFactory"
    // Use Spring's default container factory
)
public void consumeMessage(SimpleMessage message) {
    // Automatically called when message arrives!
    
    try {
        logger.info("MESSAGE RECEIVED FROM KAFKA!");
        logger.info("Message: {}", message.getMessage());
        // Print the received message
        
        // HERE: Do any task
        // - Send email
        // - Update database
        // - Store in cache
        // - Call another service
        
        logger.info("Processing completed!");
        
    } catch (Exception e) {
        logger.error("Error processing message", e);
        // If error: message will be retried
        // Or sent to Dead Letter Queue (DLQ)
    }
}
```

#### 3. **KafkaConsumerConfig.java**
```
Location: src/main/java/com/gotogether/user/kafka/config/
Purpose: Configure how messages are received
```
**Key configurations:**
```
bootstrap-servers = localhost:9092
  → Kafka broker address

group-id = "user-service-group"
  → Consumer group identifier
  → Multiple consumers with same ID share messages

KEY_DESERIALIZER = StringDeserializer
  → Convert key from bytes: bytes → "ride-1"

VALUE_DESERIALIZER = JsonDeserializer
  → Convert message from bytes: JSON → SimpleMessage

TRUSTED_PACKAGES = "*"
  → Allow deserializing any package

AUTO_OFFSET_RESET = "earliest"
  → If no saved position: read from beginning
  → Alternative "latest" = read only new messages

ENABLE_AUTO_COMMIT = true
  → Automatically save reading position

AUTO_COMMIT_INTERVAL = 100ms
  → Save position every 100ms

SESSION_TIMEOUT = 30000ms
  → If no heartbeat for 30 seconds: mark dead

CONCURRENCY = 3
  → Use 3 threads to process simultaneously
```

---

### CONFIGURATION FILES

#### **application.properties (Ride Service)**
```properties
# Kafka Configuration
spring.kafka.bootstrap-servers=localhost:9092

# Producer Configuration
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer
spring.kafka.producer.retries=3
spring.kafka.producer.properties.linger.ms=10
```

#### **application.properties (User Service)**
```properties
# Kafka Configuration
spring.kafka.bootstrap-servers=localhost:9092

# Consumer Configuration
spring.kafka.consumer.group-id=user-service-group
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties.spring.json.trusted.packages=*
spring.kafka.consumer.auto-offset-reset=earliest
```

---

## HOW TO RUN

### Step 1: Start Kafka
```bash
# Terminal 1: Start Zookeeper
cd C:\kafka
bin\windows\zookeeper-server-start.bat config\zookeeper.properties

# Terminal 2: Start Kafka Broker
cd C:\kafka
bin\windows\kafka-server-start.bat config\server.properties
```

### Step 2: Start Services
```bash
# Terminal 3: Start Ride Service
cd C:\Users\durve\Downloads\PROJECT\GoTogether-ride
mvn clean install
mvn spring-boot:run

# Terminal 4: Start User Service
cd C:\Users\durve\Downloads\PROJECT\GoTogether-dev
mvn clean install
mvn spring-boot:run
```

### Step 3: Send Message
```bash
# Terminal 5: Using curl
curl -X GET http://localhost:8081/api/kafka/test

# OR using Postman
Method: GET
URL: http://localhost:8081/api/kafka/test
Click: Send
```

### Step 4: Check Logs

**Ride Service (8081) - You'll see:**
```
SENDING MESSAGE: Hello from Ride Service!
MESSAGE SENT SUCCESSFULLY!
```

**User Service (8080) - You'll see:**
```
====================================
MESSAGE RECEIVED FROM KAFKA!
====================================
Message: Hello from Ride Service!
Ride ID: 1
Event Type: TEST
====================================
Processing completed!
```

---

## KEY CONCEPTS EXPLAINED

### TOPIC
- **What:** Like a channel or queue name
- **Example:** "ride-topic"
- **Purpose:** Organize messages by type

### MESSAGE
- **What:** The data being sent
- **Example:** SimpleMessage with text and ID
- **Format:** Converted to JSON

### PRODUCER
- **What:** Service that sends messages
- **Example:** Ride Service
- **Uses:** KafkaTemplate.send()

### CONSUMER
- **What:** Service that receives messages
- **Example:** User Service
- **Uses:** @KafkaListener annotation

### CONSUMER GROUP
- **What:** Group of consumers reading same topic
- **Example:** "user-service-group"
- **Behavior:** Each message goes to ONE consumer in group

### OFFSET
- **What:** Position/index in message stream
- **Example:** Consumer read messages 1-100, next starts at 101
- **Saved:** After processing (auto-commit)

### PARTITION
- **What:** Topic is split into partitions
- **Purpose:** Enable parallel processing
- **Example:** "ride-topic" has 3 partitions, 3 consumers process in parallel

### SERIALIZATION
- **What:** Convert Java object → JSON bytes
- **Example:** SimpleMessage → {"message":"..."} → bytes
- **Done by:** JsonSerializer (Producer)

### DESERIALIZATION
- **What:** Convert JSON bytes → Java object
- **Example:** bytes → {"message":"..."} → SimpleMessage
- **Done by:** JsonDeserializer (Consumer)

---

## MESSAGE FLOW (STEP BY STEP)

```
1. SEND PHASE
   ├─ Call REST API: GET /api/kafka/test
   ├─ Spring calls: SimpleProducer.sendMessage()
   ├─ Create: SimpleMessage object
   ├─ Serialize: SimpleMessage → JSON
   ├─ Send to Kafka: kafkaTemplate.send("ride-topic", message)
   └─ Kafka stores message on disk

2. KAFKA STORES PHASE
   ├─ Kafka receives JSON message
   ├─ Stores in partition of "ride-topic"
   ├─ Replicates to backup brokers
   ├─ Sends acknowledgment to producer
   └─ Message is persisted

3. RECEIVE PHASE
   ├─ User Service listening to "ride-topic"
   ├─ Kafka detects new message
   ├─ Deserialize: JSON → SimpleMessage
   ├─ Spring calls: SimpleConsumer.consumeMessage(message)
   ├─ Consumer processes message
   ├─ Saves offset (position)
   └─ Message marked as consumed

4. COMPLETE
   ├─ Both services independent
   ├─ Can be restarted anytime
   └─ Message history in Kafka
```

---

## EXAMPLE MESSAGE FLOW

### Consumer sends:
```json
{
  "message": "Hello from Ride Service!",
  "rideId": 1,
  "eventType": "TEST"
}
```

### Kafka receives and stores:
```
Topic: ride-topic
Partition: 0
Message: {"message":"Hello from Ride Service!","rideId":1,"eventType":"TEST"}
Offset: 0
Timestamp: 2026-02-03 23:30:00
```

### Consumer reads:
```
Consumer Group: user-service-group
Topic: ride-topic
Message: SimpleMessage(message=Hello from Ride Service!, rideId=1, eventType=TEST)
```

---

## TROUBLESHOOTING

### Problem 1: Connection Refused (localhost:9092)
**Cause:** Kafka not running
**Solution:** 
```bash
# Check if Kafka started
bin\windows\kafka-server-start.bat config\server.properties
```

### Problem 2: Messages Not Received by Consumer
**Cause:** Consumer starts after message sent
**Solution:** Set `auto-offset-reset=earliest` (already done)

### Problem 3: Deserialization Error
**Cause:** Class not in TRUSTED_PACKAGES
**Solution:** Already set to "*" (trusts all)

### Problem 4: Port 8081 or 8080 Already in Use
**Cause:** Service already running
**Solution:** 
```bash
# Find and kill process on port
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

---

## ADVANCED FEATURES (NEXT STEPS)

1. **Error Handling:**
   - Dead Letter Queue (DLQ) for failed messages
   - Retry with exponential backoff

2. **Multiple Consumers:**
   - Scale processing across multiple instances
   - Parallel message handling

3. **Message Filtering:**
   - Process only specific event types
   - Conditional processing

4. **Monitoring:**
   - Consumer lag tracking
   - Throughput monitoring
   - Error rate alerts

5. **Security:**
   - SSL/TLS encryption
   - SASL authentication
   - Topic-level ACLs

---

## SUMMARY

**This simple Kafka setup:**
1. ✅ Ride Service sends messages
2. ✅ User Service receives messages
3. ✅ Services are decoupled
4. ✅ Messages are persisted
5. ✅ Easy to scale

**In production you would add:**
- Error handling (DLQ)
- Monitoring (metrics)
- Security (SSL, SASL)
- Multiple consumers (scaling)
- Message filtering (logic)

**Current implementation is:**
- Simple and easy to understand
- Good foundation for expansion
- Production-ready for basic use cases
- Easy to test and debug
