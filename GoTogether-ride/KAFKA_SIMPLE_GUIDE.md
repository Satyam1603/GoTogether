# SIMPLE KAFKA EXAMPLE - COMPLETE GUIDE

## OVERVIEW
This is a simple Kafka implementation between two services:
- **Ride Service (Producer)** - Sends messages to Kafka
- **User Service (Consumer)** - Receives messages from Kafka

## STEP-BY-STEP EXPLANATION

### 1. MESSAGE OBJECT (SimpleMessage.java)
```
What is this?
- A simple Java class that represents the message structure
- Both services use the same class

Fields:
- message: String - The actual message text
- rideId: Long - The ride ID
- eventType: String - Type of event (TEST, RIDE_UPDATED, etc.)

Why JSON?
- Messages in Kafka are bytes, so we need to convert Java objects to JSON
- JsonSerializer converts SimpleMessage to JSON
- JsonDeserializer converts JSON back to SimpleMessage
```

---

## 2. PRODUCER (Ride Service)

### File: SimpleProducer.java
```
What does it do?
- Sends messages to Kafka topic "ride-topic"
- Any service can listen to this topic

Key Method: sendMessage(SimpleMessage message)
1. Logger.info() - Print that we're sending a message
2. kafkaTemplate.send(TOPIC, message) - Send message to Kafka
3. Logger.info() - Print success message

How it works:
1. Receive SimpleMessage object
2. Convert to JSON (automatically by JsonSerializer)
3. Send to Kafka broker at localhost:9092
4. Kafka stores in topic "ride-topic"
5. Return success message
```

### File: KafkaTestController.java
```
What is this?
- REST API endpoints to test Kafka message sending

Endpoints:

1. GET /api/kafka/test
   - Sends a simple test message
   - Example: "Hello from Ride Service!"
   - Returns: "Message sent to Kafka!"

2. POST /api/kafka/send
   - Sends custom message from request body
   - Example body:
     {
       "message": "Ride Updated",
       "rideId": 5,
       "eventType": "RIDE_UPDATED"
     }
   - Returns: "Custom message sent!"
```

### File: KafkaProducerConfigSimple.java
```
What does it do?
- Configures how Ride Service sends messages

Key Configurations:

1. bootstrap-servers = localhost:9092
   - Kafka broker address
   - Producer connects here to send messages

2. KEY_SERIALIZER = StringSerializer
   - Converts message key to bytes
   - Example: "ride-1" becomes bytes

3. VALUE_SERIALIZER = JsonSerializer
   - Converts SimpleMessage object to JSON
   - Example: SimpleMessage → {message: "...", rideId: 1}

4. ACKS = "all"
   - Wait for all brokers to acknowledge
   - Ensures message is saved reliably

5. RETRIES = 3
   - If sending fails, retry 3 times
   - Handles temporary network issues

6. LINGER_MS = 10
   - Wait 10ms to batch messages
   - Send multiple messages together for efficiency

7. COMPRESSION = "snappy"
   - Compress messages to save bandwidth
   - Like ZIP compression
```

---

## 3. CONSUMER (User Service)

### File: SimpleConsumer.java
```
What does it do?
- Listens to Kafka topic "ride-topic"
- Automatically processes messages when they arrive

Key Method: consumeMessage(SimpleMessage message)
@KafkaListener Annotation:
- topics = "ride-topic"
  → Listen to "ride-topic" topic
  
- groupId = "user-service-group"
  → This consumer group ID
  → Multiple consumers with same group share messages
  
When message arrives:
1. Kafka deserializes JSON to SimpleMessage
2. Spring calls consumeMessage() automatically
3. We process the message (print it)
4. If successful, offset is committed (message marked as read)
5. If error, message can be retried

What happens inside:
1. logger.info() - Print the message details
2. Process the message (in real app: send email, update DB, etc.)
3. logger.info() - Print success
4. If error occurs, catch it and log

Example output:
====================================
MESSAGE RECEIVED FROM KAFKA!
====================================
Message: Hello from Ride Service!
Ride ID: 1
Event Type: TEST
====================================
```

### File: KafkaConsumerConfig.java
```
What does it do?
- Configures how User Service receives messages

Key Configurations:

1. bootstrap-servers = localhost:9092
   - Kafka broker address
   - Consumer connects here to receive messages

2. group-id = "user-service-group"
   - Consumer group identifier
   - If multiple consumers exist, they coordinate to receive messages
   - Each message goes to ONE consumer in the group

3. KEY_DESERIALIZER = StringDeserializer
   - Converts message key from bytes to String
   - Example: bytes → "ride-1"

4. VALUE_DESERIALIZER = JsonDeserializer
   - Converts message value from JSON bytes to SimpleMessage object
   - Example: {message: "..."} → SimpleMessage object

5. TRUSTED_PACKAGES = "*"
   - Allow deserializing any Java package
   - Security setting (restrict in production)

6. AUTO_OFFSET_RESET = "earliest"
   - If consumer group is new:
     "earliest" = read all messages from topic beginning
     "latest" = read only new messages from now
   - Offset = position in the message stream

7. ENABLE_AUTO_COMMIT = true
   - Automatically save position after processing
   - Consumer remembers where it read up to

8. AUTO_COMMIT_INTERVAL = 100ms
   - Save position every 100ms
   - Trade-off between reliability and performance

9. SESSION_TIMEOUT = 30000ms (30 seconds)
   - If no heartbeat for 30 seconds, mark consumer as dead
   - Other consumers take over

10. CONCURRENCY = 3
    - Use 3 threads to process messages concurrently
    - Process multiple messages simultaneously
```

---

## 4. APPLICATION.PROPERTIES CHANGES

### Ride Service (Producer)
```properties
# Kafka broker - where to connect
spring.kafka.bootstrap-servers=localhost:9092

# Producer settings
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer
spring.kafka.producer.retries=3
spring.kafka.producer.properties.linger.ms=10
```

### User Service (Consumer)
```properties
# Kafka broker - where to connect
spring.kafka.bootstrap-servers=localhost:9092

# Consumer settings
spring.kafka.consumer.group-id=user-service-group
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties.spring.json.trusted.packages=*
spring.kafka.consumer.auto-offset-reset=earliest
```

---

## 5. HOW IT WORKS (COMPLETE FLOW)

### Setup Phase:
```
1. Start Kafka Server
   - Command: kafka-server-start.sh config/server.properties
   - Kafka starts at localhost:9092

2. Start Ride Service (Producer)
   - Spring creates KafkaTemplate bean
   - Connects to Kafka broker
   - Ready to send messages

3. Start User Service (Consumer)
   - Spring creates KafkaListenerContainerFactory bean
   - Connects to Kafka broker
   - Starts listening to "ride-topic"
```

### Message Sending Phase:
```
1. Call REST API on Ride Service
   GET http://localhost:8081/api/kafka/test

2. Spring calls SimpleProducer.sendMessage()
   - Create SimpleMessage object
   - Message = "Hello from Ride Service!"
   - RideId = 1
   - EventType = "TEST"

3. KafkaTemplate sends message
   - Convert SimpleMessage to JSON
   - Send to Kafka broker
   - Topic: "ride-topic"

4. Kafka stores message
   - Message is stored on disk
   - Multiple replicas for backup
```

### Message Receiving Phase:
```
1. User Service consumer listening to "ride-topic"

2. Message arrives from Kafka
   - JSON is deserialized to SimpleMessage
   - Spring automatically calls SimpleConsumer.consumeMessage()

3. Consumer processes message
   - Logger.info() prints message details
   - Do any task (email, database, etc.)

4. Offset is committed
   - Kafka remembers this consumer read this message
   - Next time it starts, it reads from here

5. Message is marked as consumed
   - Available for other consumer groups
```

---

## 6. TESTING THE SETUP

### Step 1: Start Kafka
```bash
# Terminal 1
cd C:\kafka
bin\windows\zookeeper-server-start.bat config\zookeeper.properties

# Terminal 2
cd C:\kafka
bin\windows\kafka-server-start.bat config\server.properties
```

### Step 2: Start Services
```bash
# Terminal 3: Start Ride Service
cd C:\Users\durve\Downloads\PROJECT\GoTogether-ride
mvn spring-boot:run

# Terminal 4: Start User Service
cd C:\Users\durve\Downloads\PROJECT\GoTogether-dev
mvn spring-boot:run
```

### Step 3: Send Message
```bash
# Terminal 5: Send message via REST API
curl -X GET http://localhost:8081/api/kafka/test

OR use Postman:
- Method: GET
- URL: http://localhost:8081/api/kafka/test
- Click Send
```

### Step 4: Check Console Output

**Ride Service Console:**
```
SENDING MESSAGE: Hello from Ride Service!
MESSAGE SENT SUCCESSFULLY!
```

**User Service Console:**
```
====================================
MESSAGE RECEIVED FROM KAFKA!
====================================
Message: Hello from Ride Service!
Ride ID: 1
Event Type: TEST
====================================
```

---

## 7. KEY CONCEPTS

### Topic
- Like a message queue channel
- Messages are published to topics
- Consumers subscribe to topics
- Example: "ride-topic"

### Message
- Data being sent through Kafka
- Can be any JSON object
- Example: SimpleMessage object

### Producer
- Sends messages to Kafka
- Ride Service is producer
- Uses KafkaTemplate

### Consumer
- Receives messages from Kafka
- User Service is consumer
- Uses @KafkaListener

### Consumer Group
- Group of consumers reading same topic
- Each message goes to ONE consumer in group
- Example: "user-service-group"

### Offset
- Position/cursor in message stream
- Consumer remembers last read message
- Kafka: "Consumer read up to message 100"
- Next time: Start from message 101

### Partition
- Topic is divided into partitions
- Each partition is an ordered queue
- Multiple partitions = parallel processing
- Example: "ride-topic" might have 3 partitions

### Broker
- Kafka server instance
- Stores messages
- Sends to consumers
- Location: localhost:9092

### Serialization
- Convert Java object to bytes (JSON)
- For sending: SimpleMessage → JSON → bytes
- JsonSerializer does this

### Deserialization
- Convert bytes to Java object (JSON)
- For receiving: bytes → JSON → SimpleMessage
- JsonDeserializer does this

---

## 8. PRODUCTION CONSIDERATIONS

### Error Handling
```
- Dead Letter Queue (DLQ) for failed messages
- Retry policy for temporary failures
- Alerting team on critical errors
```

### Performance
```
- Tune batch size based on message size
- Adjust concurrency based on CPU cores
- Monitor lag (how behind consumer is)
```

### Reliability
```
- Set replication factor (multiple copies)
- Set min.insync.replicas (ensure durability)
- Use acknowledgment "all"
```

### Security
```
- Use SSL/TLS for communication
- Authenticate with SASL
- Restrict package access
- Use RBAC (Role-Based Access Control)
```

### Monitoring
```
- Monitor consumer lag
- Monitor producer throughput
- Monitor error rates
- Monitor Kafka broker health
```

---

## 9. COMMON ISSUES & SOLUTIONS

### Issue 1: Connection Refused (localhost:9092)
**Cause:** Kafka not running
**Solution:** Start Kafka server first

### Issue 2: Messages Not Received
**Cause:** Consumer group is new and auto-offset-reset="latest"
**Solution:** Change to "earliest" or send message after consumer starts

### Issue 3: Deserialization Error
**Cause:** Wrong class in trusted packages
**Solution:** Add package to TRUSTED_PACKAGES or change to "*"

### Issue 4: Consumer Lag
**Cause:** Consumer processing slow or not running
**Solution:** Check logs, increase concurrency, optimize processing

---

## FILES CREATED

### Ride Service (Producer)
1. SimpleMessage.java - Message class
2. SimpleProducer.java - Sends messages
3. KafkaTestController.java - REST API to test
4. KafkaProducerConfigSimple.java - Producer config
5. Updated application.properties - Kafka config

### User Service (Consumer)
1. SimpleMessage.java - Message class
2. SimpleConsumer.java - Listens to messages
3. KafkaConsumerConfig.java - Consumer config
4. Updated application.properties - Kafka config

---

## NEXT STEPS

1. **Add Error Handling:** Use Dead Letter Queue
2. **Add Monitoring:** Use Kafka Streams or Micrometer
3. **Add Multiple Consumers:** Scale message processing
4. **Add Message Filtering:** Process only certain events
5. **Add Transactions:** Ensure exactly-once delivery

---

## SUMMARY

**Kafka is like a postal service:**
- Ride Service = Sender (puts letter in mailbox)
- User Service = Receiver (picks up letter from mailbox)
- Kafka = Postal Service (delivers letter)
- Topic = Mailbox (place to put/get letters)
- Message = Letter (content being sent)

Simple and reliable!
