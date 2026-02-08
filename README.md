# 🚗 GoTogether - Carpooling Microservices Platform

**GoTogether** is a state-of-the-art, polyglot microservices platform designed to revolutionize urban carpooling. It combines high-performance backend services with a modern, responsive frontend to provide a seamless ride-sharing experience.

---

## 🏗️ Technical Architecture

The platform is built using a **Distributed Microservices Architecture**, ensuring high availability, independent scalability, and technological flexibility.

### 🛠️ Technology Stack
- **Backend (Java)**: Spring Boot 3.4.0, Spring Cloud (Gateway, Eureka), Spring Data JPA, Java 21.
- **Backend (.NET)**: .NET 8.0/9.0 Web API (Vehicle Service).
- **Frontend**: Vite + React (Modern, Clean, User-centric design).
- **Databases**: MySQL 8.0 (Primary), Redis 7 (Caching & Session).
- **Messaging**: Apache Kafka 3.7 (Event-driven communication).
- **DevOps**: Docker & Docker Compose (Containerization).

---

## 🚀 Key Features
- **User Management**: Secure authentication & profiles with JWT and AWS S3 integration.
- **Ride Matching**: Real-time ride publishing and searching.
- **Vehicle Catalog**: .NET powered vehicle management service.
- **Booking Flow**: Asynchronous booking confirmed via Kafka message events.
- **Scalable Gateway**: Centralized entry point with Spring Cloud Gateway.
- **Service Discovery**: Automatic service registration via Netflix Eureka.

---

## 📂 Microservices Breakdown
| Service | Technology | Port | Description |
| :--- | :--- | :--- | :--- |
| **API Gateway** | Spring Cloud | 8080 | Central entry point & routing. |
| **User Service** | Java/Spring | 8081 | Auth, Profiles, AWS S3, SendGrid/Twilio. |
| **Booking Service** | Java/Spring | 8082 | Manages ride reservations & state. |
| **Ride Service** | Java/Spring | 8083 | Handles ride creation & Kafka producers. |
| **Vehicle Service** | .NET Core | 8084 | C# microservice for vehicle assets. |
| **Frontend** | React/Vite | 80 | Premium, BlaBlaCar-inspired UI. |

---

## ⚙️ Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Recommended)
- [Java 21 JDK](https://adoptium.net/temurin/releases/?version=21)
- [.NET SDK](https://dotnet.microsoft.com/download)
- [Maven](https://maven.apache.org/download.cgi)

### Installation & Run (via Docker)
1. **Clone the repo:**
   ```bash
   git clone https://github.com/Climber1999/GoTogether.git
   cd GoTogether
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your specific API keys
   ```

3. **Launch the entire stack:**
   ```bash
   docker-compose up -d --build
   ```

### Local Development (IDE)
If you prefer running services individually for debugging:
1. Start infrastructure: `docker-compose up -d mysql kafka redis`
2. Run each Spring Boot application: `./mvnw spring-boot:run`
3. Run .NET service: `dotnet run --project ./VehicleService`

---

## 🛡️ Data Security
The project follows **Twelve-Factor App** principles for security:
- **Zero Secrets in Code**: All sensitive keys are externalized into `${VARIABLE_NAME}` placeholders.
- **Environment Managed**: All credentials are managed via the root `.env` file.

---

## 📜 Documentation Extras
- [🐳 Detailed Docker Guide](DOCKER_GUIDE.md)
- [🎓 Interview Preparation Bank](INTERVIEW_QUESTIONS.md)

---

## 🤝 Contributing
Contributions are welcome! Please follow the standard fork-and-pull-request workflow.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
