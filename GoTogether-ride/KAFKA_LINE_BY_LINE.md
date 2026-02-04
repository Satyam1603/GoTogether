# LINE-BY-LINE CODE EXPLANATION

## RIDE SERVICE - PRODUCER (SENDER)

### SimpleProducer.java - Sends Messages
```java
// Line 1: Import logger
import org.slf4j.Logger;
// Logger = tool to print messages to console

// Line 2: Create static logger
private static final Logger logger = LoggerFactory.getLogger(SimpleProducer.class);
// This logger will print to console for this class

// Line 3: Declare KafkaTemplate (provided by Spring)
private final KafkaTemplate<String, Object> kafkaTemplate;
// KafkaTemplate<String, Object> = String key, Object value (message)
// Spring automatically creates this from KafkaProducerConfig

// Line 4: Topic name constant
private final String TOPIC = "ride-topic";
// All messages sent by this producer go to "ride-topic"
// Think of topic as a message channel/queue

// Line 5: Constructor - Spring passes KafkaTemplate
public SimpleProducer(KafkaTemplate<String, Object> kafkaTemplate) {
    this.kafkaTemplate = kafkaTemplate;
    // Spring calls this constructor and provides kafkaTemplate
    // This is called "Dependency Injection"
}

// Line 6: Send message method
public void sendMessage(SimpleMessage message) {
    // Parameter: message = object to send
    
    // Line 7: Log before sending
    logger.info("SENDING MESSAGE: {}", message.getMessage());
    // {} = placeholder, replaced with message.getMessage()
    // Output: "SENDING MESSAGE: Hello from Ride Service!"
    
    // Line 8: Send to Kafka!
    kafkaTemplate.send(TOPIC, message);
    // This is the KEY line!
    // What happens internally:
    //   1. @Qualifier finds "ride-topic" topic
    //   2. JsonSerializer converts SimpleMessage to JSON
    //      SimpleMessage → {"message":"Hello...", "rideId":1}
    //   3. Serializes JSON to bytes
    //   4. Sends bytes to Kafka at localhost:9092
    //   5. Kafka receives and stores in "ride-topic"
    
    // Line 9: Log after sending
    logger.info("MESSAGE SENT SUCCESSFULLY!");
    // Output: "MESSAGE SENT SUCCESSFULLY!"
}
```

---

## USER SERVICE - CONSUMER (RECEIVER)

### SimpleConsumer.java - Receives Messages
```java
// Line 1: Kafka listener annotation
@KafkaListener(
    // Line 2: Topic to listen to
    topics = "ride-topic",
    // Listen to "ride-topic" - same as producer sends to!
    
    // Line 3: Consumer group
    groupId = "user-service-group",
    // Consumer group ID
    // If 2 services have same groupId, they share messages (load balanced)
    // If 2 services have different groupId, both get all messages
    
    // Line 4: Container factory
    containerFactory = "kafkaListenerContainerFactory"
    // Uses Spring's default container factory from KafkaConsumerConfig
)

// Line 5: Listener method - called when message arrives!
public void consumeMessage(SimpleMessage message) {
    // Parameter: message = object from Kafka (already deserialized!)
    // Spring automatically:
    //   1. Reads message from Kafka
    //   2. Deserializes from JSON to SimpleMessage
    //   3. Calls this method
    
    try {
        // Line 6-8: Print received message details
        logger.info("MESSAGE RECEIVED FROM KAFKA!");
        logger.info("Message: {}", message.getMessage());
        // Output: "Message: Hello from Ride Service!"
        
        logger.info("Ride ID: {}", message.getRideId());
        // Output: "Ride ID: 1"
        
        // Line 9: Mark as processed
        logger.info("Processing completed successfully!");
        // If no exception thrown, Spring commits offset
        // Offset = position in message stream
        // "Consumer read up to message 50"
        
    } catch (Exception e) {
        // Line 10: Handle error
        logger.error("Error processing message", e);
        // Message will be retried or sent to Dead Letter Queue
    }
}
```

---

## CONFIGURATION FILES

### KafkaProducerConfig.java - Producer Settings
```java
// Line 1: Configuration class
@Configuration
// Tells Spring this class configures something

// Line 2: Enable Kafka
@EnableKafka
// Enables Kafka support in Spring

// Line 3: Read bootstrap servers from application.properties
@Value("${spring.kafka.bootstrap-servers:localhost:9092}")
private String bootstrapServers;
// Read "spring.kafka.bootstrap-servers" property
// If not found, use default "localhost:9092"

// Line 4: Create producer factory bean
@Bean
public ProducerFactory<String, Object> producerFactory() {
    Map<String, Object> configProps = new HashMap<>();
    
    // Line 5: Set Kafka broker address
    configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
    // Producer will connect here: "localhost:9092"
    
    // Line 6: Set key serializer
    configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    // Converts message key (String) to bytes
    
    // Line 7: Set value serializer
    configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
    // Converts message value (Object) to JSON bytes
    // SimpleMessage → JSON → bytes
    
    // Line 8: Set reliability level
    configProps.put(ProducerConfig.ACKS_CONFIG, "all");
    // "all" = wait for all brokers to save before returning
    // Slowest but most reliable
    
    // Line 9: Set retries
    configProps.put(ProducerConfig.RETRIES_CONFIG, 3);
    // Retry 3 times if send fails
    
    // Line 10: Create and return factory
    return new DefaultKafkaProducerFactory<>(configProps);
}

// Line 11: Create KafkaTemplate bean
@Bean
public KafkaTemplate<String, Object> kafkaTemplate() {
    // KafkaTemplate = main interface for sending messages
    return new KafkaTemplate<>(producerFactory());
    // Use producer factory created above
    // Spring will inject this into SimpleProducer
}
```

### KafkaConsumerConfig.java - Consumer Settings
```java
// Line 1: Configuration class
@Configuration
@EnableKafka

// Line 2: Read group ID from application.properties
@Value("${spring.kafka.consumer.group-id:user-service-group}")
private String groupId;
// Consumer group ID

// Line 3: Create consumer factory bean
@Bean
public ConsumerFactory<String, Object> consumerFactory() {
    Map<String, Object> configs = new HashMap<>();
    
    // Line 4: Set Kafka broker address
    configs.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
    // Consumer will connect here to read messages
    
    // Line 5: Set consumer group
    configs.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
    // All consumers with same group ID share messages
    
    // Line 6: Set key deserializer
    configs.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    // Converts key from bytes to String
    
    // Line 7: Set value deserializer
    configs.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
    // Converts value from JSON bytes to object
    // bytes → JSON → SimpleMessage
    
    // Line 8: Trust packages
    configs.put(JsonDeserializer.TRUSTED_PACKAGES, "*");
    // Allow deserializing any package
    
    // Line 9: Offset reset policy
    configs.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    // If no saved offset: read from beginning
    
    // Line 10: Create and return consumer factory
    return new DefaultKafkaConsumerFactory<>(configs);
}

// Line 11: Create listener container factory
@Bean
public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
    ConcurrentKafkaListenerContainerFactory<String, Object> factory = 
        new ConcurrentKafkaListenerContainerFactory<>();
    
    // Line 12: Set consumer factory
    factory.setConsumerFactory(consumerFactory());
    // Use consumer factory created above
    
    // Line 13: Set concurrency
    factory.setConcurrency(3);
    // Use 3 threads to process messages in parallel
    // Can process 3 messages at same time
    
    // Line 14: Return factory
    return factory;
    // Spring will use this for @KafkaListener
}
```

---

## APPLICATION.PROPERTIES

### Ride Service (Producer)
```properties
# Line 1: Kafka server address
spring.kafka.bootstrap-servers=localhost:9092
# Where Kafka is running

# Line 2: Key serializer
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
# Converts String keys to bytes

# Line 3: Value serializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer
# Converts objects to JSON bytes

# Line 4: Retry count
spring.kafka.producer.retries=3
# Retry 3 times if send fails

# Line 5: Linger time
spring.kafka.producer.properties.linger.ms=10
# Wait 10ms to batch messages
```

### User Service (Consumer)
```properties
# Line 1: Kafka server address
spring.kafka.bootstrap-servers=localhost:9092

# Line 2: Consumer group
spring.kafka.consumer.group-id=user-service-group
# This consumer belongs to this group

# Line 3: Key deserializer
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
# Converts bytes to String keys

# Line 4: Value deserializer
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
# Converts bytes to JSON to objects

# Line 5: Trusted packages
spring.kafka.consumer.properties.spring.json.trusted.packages=*
# Allow any package to deserialize

# Line 6: Offset reset
spring.kafka.consumer.auto-offset-reset=earliest
# Read from beginning if no saved position
```

---

## COMPLETE FLOW WITH LINE NUMBERS

```
PRODUCER SIDE:
Line 1: User calls: GET http://localhost:8081/api/kafka/test
Line 2: Spring routes to KafkaTestController.testMessage()
Line 3: Create SimpleMessage object
Line 4: Set message = "Hello from Ride Service!"
Line 5: Set rideId = 1
Line 6: Set eventType = "TEST"
Line 7: Call simpleProducer.sendMessage(message)
        ↓
Line 8: logger.info("SENDING MESSAGE: Hello from Ride Service!")
Line 9: kafkaTemplate.send("ride-topic", message)
        ↓
        JsonSerializer converts:
        SimpleMessage → {"message":"Hello...","rideId":1,"eventType":"TEST"}
        ↓
        Send to Kafka at localhost:9092
        ↓
Line 10: logger.info("MESSAGE SENT SUCCESSFULLY!")
Line 11: Return "Message sent to Kafka!"

=================== IN KAFKA ===================

CONSUMER SIDE:
Line 12: @KafkaListener detects new message in "ride-topic"
Line 13: JsonDeserializer converts JSON back to SimpleMessage
Line 14: Spring calls SimpleConsumer.consumeMessage(message)
Line 15: try {
Line 16:     logger.info("MESSAGE RECEIVED FROM KAFKA!")
Line 17:     logger.info("Message: Hello from Ride Service!")
Line 18:     logger.info("Ride ID: 1")
Line 19:     logger.info("Event Type: TEST")
Line 20:     // DO YOUR TASK HERE
Line 21:     logger.info("Processing completed successfully!")
Line 22: }
Line 23: catch (Exception e) {
Line 24:     logger.error("Error processing message", e)
Line 25: }
```

---

## WHAT HAPPENS AT EACH LINE

### When you call GET /api/kafka/test:

1. **Line 1 (Request received)**
   ```
   GET http://localhost:8081/api/kafka/test
   Spring receives request
   ```

2. **Line 2 (Method called)**
   ```
   testMessage() is called
   ```

3. **Line 3-6 (Create message)**
   ```
   SimpleMessage msg = new SimpleMessage();
   msg.setMessage("Hello from Ride Service!");
   msg.setRideId(1L);
   msg.setEventType("TEST");
   
   Result: msg object with 3 fields set
   ```

4. **Line 7 (Send to producer)**
   ```
   simpleProducer.sendMessage(msg);
   ```

5. **Line 8 (Log start)**
   ```
   logger.info("SENDING MESSAGE: Hello from Ride Service!");
   Console output: "SENDING MESSAGE: Hello from Ride Service!"
   ```

6. **Line 9 (Send to Kafka) - THE MAGIC LINE!**
   ```
   kafkaTemplate.send("ride-topic", msg);
   
   What happens:
   1. Spring gets "ride-topic" string
   2. JsonSerializer converts msg to JSON:
      {"message":"Hello from Ride Service!","rideId":1,"eventType":"TEST"}
   3. JSON is converted to bytes
   4. Connection is made to Kafka at localhost:9092
   5. Bytes are sent
   6. Kafka broker receives bytes
   7. Kafka stores in "ride-topic"
   8. Kafka returns acknowledgment
   9. Method returns successfully
   ```

7. **Line 10 (Log success)**
   ```
   logger.info("MESSAGE SENT SUCCESSFULLY!");
   Console output: "MESSAGE SENT SUCCESSFULLY!"
   ```

8. **Line 11 (Return response)**
   ```
   return "Message sent to Kafka!";
   Browser shows: "Message sent to Kafka!"
   ```

---

### When Consumer Receives Message:

9. **Line 12 (Listener detects message)**
   ```
   @KafkaListener is always listening to "ride-topic"
   Kafka notifies: "New message available"
   ```

10. **Line 13 (Deserialize)**
    ```
    JsonDeserializer reads bytes from Kafka
    Converts bytes → JSON string
    Converts JSON → SimpleMessage object
    ```

11. **Line 14 (Call method)**
    ```
    Spring automatically calls:
    SimpleConsumer.consumeMessage(message)
    
    message now contains:
    - message = "Hello from Ride Service!"
    - rideId = 1
    - eventType = "TEST"
    ```

12. **Line 16 (First log)**
    ```
    logger.info("MESSAGE RECEIVED FROM KAFKA!");
    Console output: "MESSAGE RECEIVED FROM KAFKA!"
    ```

13. **Line 17 (Print message)**
    ```
    logger.info("Message: {}", message.getMessage());
    {} replaced with "Hello from Ride Service!"
    Console output: "Message: Hello from Ride Service!"
    ```

14. **Line 18-19 (Print other fields)**
    ```
    logger.info("Ride ID: {}", message.getRideId());
    Console output: "Ride ID: 1"
    
    logger.info("Event Type: {}", message.getEventType());
    Console output: "Event Type: TEST"
    ```

15. **Line 21 (Success)**
    ```
    logger.info("Processing completed successfully!");
    No exception thrown
    Spring commits offset
    Message is marked as "consumed"
    ```

---

## KEY LINES EXPLAINED

| Line | Code | What It Does |
|------|------|-------------|
| Send | `kafkaTemplate.send(topic, msg)` | Sends message to Kafka |
| Listen | `@KafkaListener(topics="...")` | Listens to Kafka topic |
| Serialize | `JsonSerializer` | Converts object → JSON → bytes |
| Deserialize | `JsonDeserializer` | Converts bytes → JSON → object |
| Create Bean | `@Bean public X bean()` | Spring creates this object |
| Inject | `@Autowired X x` | Spring provides this object |
| Log | `logger.info("msg")` | Print to console |
| Error | `catch (Exception e)` | Handle errors |

---

## SUMMARY

**Line-by-line flow:**

Producer:
1. Receive request
2. Create message object
3. Log "Sending"
4. Send to Kafka (serialize)
5. Log "Sent"
6. Return response

Kafka:
7. Store message

Consumer:
8. Detect new message
9. Deserialize message
10. Call listener method
11. Log received
12. Print message details
13. Process message
14. Log success
15. Commit offset

**Total: 15 key steps for one message!**
