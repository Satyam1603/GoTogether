# KAFKA VISUAL GUIDE - DIAGRAMS & FLOWS

## 📊 COMPLETE SYSTEM FLOW

```
┌─────────────────────────────────────────────────────────────┐
│                    RIDE SERVICE                             │
│                   (PRODUCER)                                │
│                   Port: 8081                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User Request                                              │
│  │                                                         │
│  ├─ GET /api/kafka/test                                    │
│  │                                                         │
│  └─> KafkaTestController                                   │
│      │                                                     │
│      └─> testMessage()                                     │
│          │                                                 │
│          ├─ Create SimpleMessage                           │
│          │  ├─ message: "Hello from Ride Service!"        │
│          │  ├─ rideId: 1                                  │
│          │  └─ eventType: "TEST"                          │
│          │                                                 │
│          └─> SimpleProducer.sendMessage()                  │
│              │                                             │
│              ├─ Log: "SENDING MESSAGE"                     │
│              │                                             │
│              └─> kafkaTemplate.send("ride-topic", msg)     │
│                  │                                         │
│                  └─ Serialize to JSON                      │
│                     └─> Send to Kafka                      │
│                                                             │
│  Response: "Message sent to Kafka!"                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ JSON bytes
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   KAFKA BROKER                              │
│                 localhost:9092                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Topic: ride-topic                                         │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Offset│ Partition 0                                │  │
│  ├──────┼─────────────────────────────────────────────┤  │
│  │  0   │ {"message":"Hello from Ride Service!",...}  │  │
│  │  1   │ {"message":"Ride Updated",...}              │  │
│  │  2   │ [waiting for next message]                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Consumer reads
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    USER SERVICE                             │
│                   (CONSUMER)                                │
│                   Port: 8080                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  @KafkaListener(topics="ride-topic")                       │
│  │                                                         │
│  └─> SimpleConsumer.consumeMessage(SimpleMessage msg)      │
│      │                                                     │
│      ├─ Try Block:                                         │
│      │  ├─ Log: "MESSAGE RECEIVED FROM KAFKA!"            │
│      │  ├─ Log: "Message: Hello from Ride Service!"       │
│      │  ├─ Log: "Ride ID: 1"                              │
│      │  ├─ Log: "Event Type: TEST"                        │
│      │  ├─ Process message (YOUR LOGIC HERE)              │
│      │  └─ Log: "Processing completed!"                   │
│      │                                                     │
│      ├─ Catch Block:                                       │
│      │  └─ Log error and handle gracefully                │
│      │                                                     │
│      └─ Spring commits offset to Kafka                     │
│         └─ Kafka saves: "Consumer read up to offset 0"     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 MESSAGE LIFECYCLE

```
STAGE 1: CREATION
├─ SimpleMessage msg = new SimpleMessage()
├─ msg.setMessage("Hello from Ride Service!")
├─ msg.setRideId(1L)
└─ msg.setEventType("TEST")

STAGE 2: SERIALIZATION
├─ JsonSerializer converts msg to JSON
├─ Result:
│  {
│    "message":"Hello from Ride Service!",
│    "rideId":1,
│    "eventType":"TEST"
│  }
└─ Bytes created from JSON

STAGE 3: TRANSMISSION
├─ kafkaTemplate.send("ride-topic", bytes)
├─ Connect to Kafka at localhost:9092
├─ Send bytes to "ride-topic"
└─ Kafka broker receives

STAGE 4: STORAGE
├─ Kafka stores in topic partition
├─ Assigns offset (e.g., offset=0)
├─ Replicates for backup
└─ Sends acknowledgment to producer

STAGE 5: NOTIFICATION
├─ Kafka notifies listeners: "New message!"
├─ Consumer group sees new message
└─ Pulls message from Kafka

STAGE 6: DESERIALIZATION
├─ JsonDeserializer reads bytes
├─ Converts bytes to JSON string
├─ Converts JSON to SimpleMessage object
└─ Result: SimpleMessage instance

STAGE 7: PROCESSING
├─ @KafkaListener calls consumeMessage()
├─ Consumer logs message details
├─ Consumer processes (send email, update DB, etc.)
└─ Consumer completes successfully

STAGE 8: COMMIT
├─ Spring commits offset to Kafka
├─ Kafka saves: "Group read up to offset 0"
├─ Next start: Consumer reads from offset 1
└─ MESSAGE LIFECYCLE COMPLETE!
```

---

## 📈 PERFORMANCE METRICS

```
THROUGHPUT (messages/second):
┌─────────────────────────────────────┐
│ Default Config:                     │
│ ├─ Linger MS: 10                    │
│ ├─ Batch Size: 16KB                 │
│ └─ Throughput: ~1000 msg/sec        │
│                                     │
│ High Performance:                   │
│ ├─ Linger MS: 5                     │
│ ├─ Batch Size: 32KB                 │
│ └─ Throughput: ~5000 msg/sec        │
└─────────────────────────────────────┘

LATENCY (milliseconds):
┌─────────────────────────────────────┐
│ Single Message: ~5ms                │
│ Batched (10 msg): ~15ms avg         │
│ With compression: +2ms overhead     │
│ Network latency: +1-10ms (varies)   │
└─────────────────────────────────────┘

RELIABILITY:
┌─────────────────────────────────────┐
│ Acks = "all": 99.99% reliable       │
│ Replication: 3 copies stored        │
│ Durability: Messages on disk        │
│ Retention: 7 days (configurable)    │
└─────────────────────────────────────┘
```

---

## 🎯 ERROR SCENARIOS

```
SCENARIO 1: Kafka Server Down
├─ Producer calls: kafkaTemplate.send()
├─ Connection fails
├─ Retry: 3 times (configured)
├─ After retries exhausted: Exception thrown
├─ Handle in try-catch block
└─ Message can be stored for later retry

SCENARIO 2: Consumer Processing Error
├─ Exception in consumeMessage()
├─ Caught in catch block
├─ Message NOT marked as consumed
├─ Message stays in Kafka
├─ Retry strategies:
│  ├─ Default: Retry after delay
│  ├─ Manual: Throw exception to retry
│  └─ DLQ: Send to Dead Letter Queue
└─ Prevents data loss

SCENARIO 3: Network Delay
├─ kafkaTemplate.send() called
├─ Network slow but working
├─ Waits for ack (timeout: 30s)
├─ Ack received before timeout
├─ Message successfully sent
└─ Latency: +10-100ms

SCENARIO 4: Consumer Crashed
├─ Consumer was reading messages
├─ Offset 5 committed (processed)
├─ Crash occurs
├─ Consumer restarts
├─ Spring connects to Kafka
├─ Loads saved offset: 5
├─ Starts reading from offset 6
└─ No duplicate processing!

SCENARIO 5: Too Many Messages
├─ Messages arriving faster than processing
├─ Consumer lag increases
├─ Solutions:
│  ├─ Increase concurrency
│  ├─ Optimize processing logic
│  ├─ Add more consumer instances
│  └─ Increase batch size
└─ Kafka stores everything (won't lose data)
```

---

## 🔧 CONFIGURATION IMPACT

```
LINGER_MS = 10ms:
├─ If 1 message arrives: Send immediately (no wait)
├─ If 3 messages within 10ms: Batch together (1 send)
├─ Benefit: Better throughput
├─ Cost: Slightly higher latency (max 10ms)
└─ Trade-off: Throughput vs Latency

BATCH_SIZE = 16KB:
├─ Accumulate messages until 16KB
├─ Or until linger time expires
├─ Whichever comes first
├─ Example:
│  ├─ 10 messages (1KB each) → Batch
│  ├─ 16 messages (1KB each) → Send at 16KB
│  └─ Or wait 10ms, then send
└─ Benefit: Efficient network usage

RETRIES = 3:
├─ First attempt fails: Retry 1
├─ Retry 1 fails: Retry 2
├─ Retry 2 fails: Retry 3
├─ Retry 3 fails: Throw exception
├─ Total time: ~30 seconds
└─ Benefit: Handles temporary issues

ACKS = "all":
├─ "0" = Don't wait for ack (fast, unreliable)
├─ "1" = Wait for leader ack (medium)
├─ "all" = Wait for all replicas ack (slow, reliable)
├─ Our setting: "all" = Production ready
└─ Trade-off: Reliability vs Latency

CONCURRENCY = 3:
├─ Using 1 thread: Process 1 message at a time
├─ Using 3 threads: Process 3 messages in parallel
├─ More threads = More CPU usage
├─ More threads = Better throughput
├─ Rule: Set to number of CPU cores
└─ Our setting: 3 = Good for most systems
```

---

## 📊 KAFKA TOPIC LAYOUT

```
Topic: "ride-topic"
Location: Kafka Broker at localhost:9092

┌──────────────────────────────────────────────────────┐
│ PARTITION 0 (Leader)                                 │
│ ┌────────────────────────────────────────────────┐   │
│ │ Offset 0: {"msg":"Hello...",  "rid":1}         │   │
│ │ Offset 1: {"msg":"Updated...", "rid":2}        │   │
│ │ Offset 2: {"msg":"Test...",    "rid":3}        │   │
│ │ Offset 3: [empty]                              │   │
│ └────────────────────────────────────────────────┘   │
│                                                       │
│ Consumer Group: user-service-group                   │
│ ├─ Consumer 1: Reading from offset 2                 │
│ │  └─ Will read offset 3 next                       │
│ └─ Lag: 0 messages (up to date)                     │
└──────────────────────────────────────────────────────┘

Replicas (Backup):
├─ Broker 1: PARTITION 0 (Leader)
├─ Broker 2: PARTITION 0 (Replica 1)
└─ Broker 3: PARTITION 0 (Replica 2)

If Broker 1 crashes:
├─ Kafka automatically promotes Broker 2
├─ New Leader: Broker 2
├─ Messages not lost
└─ Consumer continues reading

Retention:
├─ Keep messages for: 7 days
├─ After 7 days: Delete old messages
├─ Configurable: retention.ms=604800000 (7 days)
└─ Space efficient: Don't keep forever
```

---

## 🎓 IMPLEMENTATION CHECKLIST

```
✅ RIDE SERVICE (PRODUCER)
├─ Class: SimpleMessage
│  └─ @Data, @NoArgsConstructor, @AllArgsConstructor
│
├─ Class: SimpleProducer
│  ├─ @Service
│  ├─ Inject: KafkaTemplate<String, Object>
│  └─ Method: sendMessage(SimpleMessage)
│
├─ Class: KafkaProducerConfigSimple
│  ├─ @Configuration
│  ├─ @Bean: producerFactory()
│  └─ @Bean: kafkaTemplate()
│
├─ Class: KafkaTestController
│  ├─ @RestController
│  ├─ @RequestMapping("/api/kafka")
│  ├─ @GetMapping("/test")
│  └─ @PostMapping("/send")
│
└─ File: application.properties
   ├─ spring.kafka.bootstrap-servers=localhost:9092
   ├─ spring.kafka.producer.key-serializer
   └─ spring.kafka.producer.value-serializer

✅ USER SERVICE (CONSUMER)
├─ Class: SimpleMessage
│  └─ Same as Ride Service
│
├─ Class: SimpleConsumer
│  ├─ @Service
│  ├─ @KafkaListener(topics="ride-topic")
│  └─ Method: consumeMessage(SimpleMessage)
│
├─ Class: KafkaConsumerConfig
│  ├─ @Configuration
│  ├─ @Bean: consumerFactory()
│  └─ @Bean: kafkaListenerContainerFactory()
│
└─ File: application.properties
   ├─ spring.kafka.bootstrap-servers=localhost:9092
   ├─ spring.kafka.consumer.group-id
   ├─ spring.kafka.consumer.key-deserializer
   └─ spring.kafka.consumer.value-deserializer

✅ POM.XML (BOTH SERVICES)
└─ <dependency>
      <groupId>org.springframework.kafka</groupId>
      <artifactId>spring-kafka</artifactId>
   </dependency>
```

---

## 📚 FILE TREE

```
PROJECT/
├── GoTogether-ride/                    (PRODUCER)
│   ├── pom.xml
│   │   └── spring-kafka dependency ✓
│   ├── src/main/java/.../gotogether/ride/
│   │   ├── kafka/
│   │   │   ├── SimpleMessage.java ✓
│   │   │   ├── SimpleProducer.java ✓
│   │   │   └── config/
│   │   │       └── KafkaProducerConfigSimple.java ✓
│   │   └── controller/
│   │       └── KafkaTestController.java ✓
│   ├── src/main/resources/
│   │   └── application.properties ✓ (updated)
│   └── KAFKA_LINE_BY_LINE.md (documentation)
│
└── GoTogether-dev/                     (CONSUMER)
    ├── pom.xml
    │   └── spring-kafka dependency ✓
    ├── src/main/java/.../gotogether/user/
    │   └── kafka/
    │       ├── SimpleMessage.java ✓
    │       ├── SimpleConsumer.java ✓
    │       └── config/
    │           └── KafkaConsumerConfig.java ✓
    ├── src/main/resources/
    │   └── application.properties ✓ (updated)
    └── KAFKA_COMPLETE_SETUP.md (documentation)
```

All files created! ✅
