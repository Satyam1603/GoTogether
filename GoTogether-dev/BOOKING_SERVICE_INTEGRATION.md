# 📚 BOOKING SERVICE - INTEGRATION GUIDE

## 🎯 Overview

The Booking Service has been fully integrated into the GoTogether microservices ecosystem with the TrueMe API Gateway as the primary entry point.

---

## 🏗️ Architecture

```
┌──────────────────────────────┐
│     Frontend Applications     │
│   (React/Angular/Vue.js)     │
│   Port 3000, 3001, 3002      │
└──────────────┬───────────────┘
               │
               ▼
        ┌──────────────────┐
        │ TrueMe Gateway   │
        │   (Port 9091)    │
        │   CORS Enabled   │
        └─────────┬────────┘
                  │
    ┌─────────────┼─────────────┬──────────────┐
    │             │             │              │
    ▼             ▼             ▼              ▼
┌────────┐  ┌─────────┐  ┌────────┐  ┌──────────────┐
│Booking │  │  Users  │  │ Rides  │  │ Restaurants  │
│Service │  │Service  │  │Service │  │   Service    │
│(8083)  │  │ (8080)  │  │(8081)  │  │   (8082)     │
└───┬────┘  └────┬────┘  └───┬────┘  └──────┬───────┘
    │           │            │              │
    └───────────┼────────────┼──────────────┘
                │            │
                ▼            ▼
         ┌────────────────────────┐
         │   Eureka Server        │
         │   (Port 8761)          │
         └────────────────────────┘
                │
  ┌─────────────┼───────────────┬──────────────┐
  │             │               │              │
  ▼             ▼               ▼              ▼
┌────────┐  ┌────────┐  ┌──────────┐  ┌─────────┐
│ MySQL  │  │ MySQL  │  │  MySQL   │  │ Redis   │
│Booking │  │ Users  │  │ Rides    │  │ Cache   │
│(3309)  │  │(3306)  │  │ (3307)   │  │(6379)   │
└────────┘  └────────┘  └──────────┘  └─────────┘
```

---

## 📊 Services Deployed

### Booking Service (NEW!)
- **Port**: 8083
- **Database**: MySQL (Port 3309)
- **Database Name**: booking_db
- **Eureka**: Registered as `booking-service`
- **Gateway Route**: `/booking/**`

### Other Services
- **User Service** (8080) - Route: `/users/**`
- **Ride Service** (8081) - Route: `/rides/**`
- **Restaurant Service** (8082) - Route: `/restaurants/**`

### API Gateway (TrueMe)
- **Port**: 9091
- **CORS**: Enabled for localhost:3000, 3001, 3002
- **Routes**: All four services routed through gateway

---

## 🌐 TrueMe Gateway Routes

The TrueMe Gateway now routes traffic to all four services:

| Route | Backend Service | Port |
|-------|-----------------|------|
| `/booking/**` | Booking Service | 8083 |
| `/users/**` | User Service | 8080 |
| `/rides/**` | Ride Service | 8081 |
| `/restaurants/**` | Restaurant Service | 8082 |

### Gateway Configuration
```yaml
SPRING_CLOUD_GATEWAY_GLOBALCORS_CORS_CONFIGURATIONS.[/**].ALLOWED_ORIGINS: 
  "http://localhost:3000,http://localhost:3001,http://localhost:3002"

SPRING_CLOUD_GATEWAY_ROUTES_0_ID: booking-route
SPRING_CLOUD_GATEWAY_ROUTES_0_URI: "lb://booking-service"
SPRING_CLOUD_GATEWAY_ROUTES_0_PREDICATES_0: "Path=/booking/**"
```

---

## 🚀 DEPLOYMENT

### Updated Services Count
- **Total Services**: 11 (was 10, now +1 Booking Service)
- **Microservices**: 4 (added Booking)
- **Databases**: 4 MySQL + 1 Redis (added Booking DB)
- **Gateways**: 2 (TrueMe with routing configured)

### Deploy Command
```bash
# Windows
.\deploy.ps1 start

# Mac/Linux
./deploy.sh start

# Docker Compose
docker-compose up -d
```

---

## 💾 Database Information

### Booking Database
```
Host: mysql-booking
Port: 3309
Username: root
Password: root123
Database: booking_db
Docker Name: gotogether-mysql-booking
Container Name: gotogether-mysql-booking
```

### Access from CLI
```bash
docker-compose exec mysql-booking mysql -u root -proot123 booking_db

# Or from any container
docker-compose exec booking-service bash
mysql -h mysql-booking -u root -proot123 booking_db
```

---

## 🌐 API ACCESS

### Through TrueMe Gateway (RECOMMENDED)
```
Base URL: http://localhost:9091

Booking Service: http://localhost:9091/booking
Users Service:   http://localhost:9091/users
Rides Service:   http://localhost:9091/rides
Restaurants:     http://localhost:9091/restaurants
```

### Direct Service Access (Internal)
```
Booking Service: http://localhost:8083
User Service:    http://localhost:8080
Ride Service:    http://localhost:8081
Restaurant Service: http://localhost:8082
Eureka Dashboard: http://localhost:8761
```

### Swagger Documentation
```
Booking Service:  http://localhost:8083/swagger-ui.html
User Service:     http://localhost:8080/swagger-ui.html
Ride Service:     http://localhost:8081/swagger-ui.html
```

---

## 🔄 Booking Service Flow

### Create Booking (Example)
```bash
# Through TrueMe Gateway (CORS-friendly)
POST http://localhost:9091/booking/create
Content-Type: application/json

{
  "userId": 1,
  "serviceType": "hotel|flight|car|restaurant",
  "bookingDate": "2026-02-15",
  "details": {...}
}
```

### Verify Booking
```bash
# Check all registered services in Eureka
curl http://localhost:8761/eureka/apps

# You should see:
# - booking-service (8083)
# - gotogether-user-service (8080)
# - gotogether-ride-service (8081)
# - restaurant-service (8082)
```

---

## 📝 Booking Service Configuration

### Environment Variables
```yaml
SPRING_APPLICATION_NAME: booking-service
SPRING_DATASOURCE_URL: jdbc:mysql://mysql-booking:3306/booking_db
SPRING_DATASOURCE_USERNAME: root
SPRING_DATASOURCE_PASSWORD: root123
EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE: http://eureka-server:8761/eureka/
SERVER_PORT: 8083
```

### Docker Container Details
```
Image: Built from demo/Dockerfile
Container Name: booking-service
Service Name: booking-service (in Eureka)
Network: gotogether-network
Volume: mysql-booking-data (for database)
```

---

## 🔐 CORS Configuration (TrueMe Gateway)

The TrueMe Gateway now supports CORS for multiple frontend origins:

```
Allowed Origins: 
  - http://localhost:3000 (React App 1)
  - http://localhost:3001 (React App 2)
  - http://localhost:3002 (New app for Booking)

Allowed Methods: GET, POST, PUT, DELETE, OPTIONS
Allowed Headers: *
Allow Credentials: true
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] 11 containers running: `docker-compose ps`
- [ ] Booking Service started: Check docker-compose logs
- [ ] All services in Eureka: http://localhost:8761
  - [ ] booking-service
  - [ ] gotogether-user-service
  - [ ] gotogether-ride-service
  - [ ] restaurant-service
- [ ] Booking health: http://localhost:8083/actuator/health
- [ ] Gateway health: http://localhost:9091/actuator/health
- [ ] Booking database: `docker-compose exec mysql-booking mysqladmin ping`
- [ ] Gateway routes working:
  - [ ] http://localhost:9091/booking/health
  - [ ] http://localhost:9091/users/health
  - [ ] http://localhost:9091/rides/health

---

## 🛠️ Common Commands

### View All Services
```bash
docker-compose ps
```

### View Booking Service Logs
```bash
docker-compose logs -f booking-service
```

### View TrueMe Gateway Logs
```bash
docker-compose logs -f trueme-api-gateway
```

### Access Booking Database
```bash
docker-compose exec mysql-booking mysql -u root -proot123 booking_db
```

### Test Booking Service Health
```bash
curl http://localhost:8083/actuator/health
```

### Test Gateway Routing
```bash
curl http://localhost:9091/booking/health
```

---

## 📊 Updated Architecture Summary

### Services: 11 Total
1. User Service (8080)
2. Ride Service (8081)
3. Restaurant Service (8082)
4. **Booking Service (8083)** ← NEW
5. Healthcare Gateway (9090)
6. TrueMe Gateway (9091)
7. Eureka Server (8761)
8. Redis Cache (6379)
9. MySQL Users (3306)
10. MySQL Rides (3307)
11. MySQL Restaurants (3308)
12. **MySQL Booking (3309)** ← NEW

### Total Databases: 5
- 4 MySQL Databases (Users, Rides, Restaurants, Booking)
- 1 Redis Cache

### Total Ports: 12
- 8080-8083 (Services)
- 9090-9091 (Gateways)
- 8761 (Eureka)
- 3306-3309 (MySQL Databases)
- 6379 (Redis)

---

## 🚀 Next Steps

1. **Deploy**: Run `.\deploy.ps1 start` or `./deploy.sh start`
2. **Verify**: Check http://localhost:8761 for all services
3. **Test**: Call Booking Service through gateway
4. **Develop**: Create booking endpoints using TrueMe Gateway

---

## 📚 Related Documentation

- Main Docker Guide: `DOCKER_COMPLETE_GUIDE.md`
- Command Reference: `DOCKER_COMMANDS_REFERENCE.md`
- Quick Start: `QUICK_START_DOCKER.md`

---

## 💡 Key Points

✅ **Booking Service fully integrated**  
✅ **TrueMe Gateway configured with routes**  
✅ **CORS enabled for frontend apps**  
✅ **Eureka auto-registration working**  
✅ **4 Service routes configured**  
✅ **Database persistence enabled**  

---

**Status**: ✅ COMPLETE  
**Version**: 1.0.1 (Added Booking Service)  
**Date**: February 3, 2026  
**Ready for**: Immediate Deployment
