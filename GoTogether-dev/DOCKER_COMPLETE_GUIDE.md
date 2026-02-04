# GoTogether Microservices - Complete Docker Deployment Guide

## Overview

This guide provides instructions for deploying the entire GoTogether microservices ecosystem using Docker and Docker Compose. The system includes:

- **User Service** (Port 8080) - User management and authentication
- **Ride Service** (Port 8081) - Ride management and booking
- **Restaurant Service** (Port 8082) - Restaurant management
- **Healthcare API Gateway** (Port 9090) - API gateway for microservices
- **TrueMe API Gateway** (Port 9091) - Alternative API gateway with CORS
- **Eureka Server** (Port 8761) - Service discovery and registration
- **MySQL Databases** - Three separate databases for each service
- **Redis** - Caching and session management

## Architecture

```
                              Frontend (React/Angular)
                                      |
                    ____________________|____________________
                   |                                         |
            Healthcare API Gateway              TrueMe API Gateway
              (Port 9090)                         (Port 9091)
                   |                                         |
        ___________|_________________________________|________
        |               |                           |
   User Service    Ride Service          Restaurant Service
   (Port 8080)     (Port 8081)              (Port 8082)
        |               |                           |
        |               |                           |
   Users DB         Rides DB              Restaurants DB
   (MySQL)          (MySQL)                  (MySQL)
        |               |___________________________|
        |                           |
        |___________________________|
                    |
              Eureka Server
             (Service Discovery)
                    |
              Redis Cache
```

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 1.29 or higher)
- Git
- Minimum 4GB RAM allocated to Docker
- 20GB free disk space

## Quick Start

### 1. Project Structure

```
GoTogether-dev/                      (User Service)
├── Dockerfile
├── .dockerignore
└── docker-compose.yml               (Master compose file)

GoTogether-ride/                     (Ride Service)
├── Dockerfile
└── .dockerignore

restaurants_backend/                 (Restaurant Service)
├── Dockerfile
└── .dockerignore

HealthcareApiGateway/               (API Gateway 1)
├── Dockerfile
└── .dockerignore

trueme-api-gateway/                 (API Gateway 2)
├── Dockerfile
└── .dockerignore
```

### 2. Build and Deploy All Services

```bash
# Navigate to the User Service (where docker-compose.yml is located)
cd "path/to/GoTogether-dev"

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f gotogether-user-service
docker-compose logs -f gotogether-ride-service
docker-compose logs -f restaurant-service
docker-compose logs -f healthcare-api-gateway
docker-compose logs -f trueme-api-gateway
```

### 3. Verify Services are Running

```bash
# Check all services
docker-compose ps

# Expected output:
# NAME                          STATUS      PORTS
# gotogether-mysql-users        Up          3306->3306
# gotogether-mysql-rides        Up          3307->3306
# gotogether-mysql-restaurants  Up          3308->3306
# gotogether-redis              Up          6379->6379
# gotogether-eureka             Up          8761->8761
# gotogether-user-service       Up          8080->8080
# gotogether-ride-service       Up          8081->8081
# restaurant-service            Up          8082->8080
# healthcare-api-gateway        Up          9090->9090
# trueme-api-gateway            Up          9091->9090
```

## Service Details and Access

### User Service
- **Base URL**: http://localhost:8080
- **Database**: gotogether_users_db (Port 3306)
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **Health Check**: http://localhost:8080/actuator/health

**Key Endpoints**:
```
POST   /gotogether/users/register          - Register new user
POST   /gotogether/users/login              - Login user
GET    /gotogether/users/{userId}           - Get user profile
PUT    /gotogether/users/{userId}           - Update profile
DELETE /gotogether/users/{userId}           - Delete account
POST   /gotogether/users/{userId}/verify-email      - Send verification email
GET    /gotogether/users/{userId}/verify-phone      - Send phone OTP
POST   /gotogether/users/{userId}/upload-image      - Upload profile image
```

### Ride Service
- **Base URL**: http://localhost:8081
- **Database**: gotogether_rides_db (Port 3307)
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **Health Check**: http://localhost:8081/actuator/health

**Key Endpoints**:
```
POST   /rides                    - Create new ride
GET    /rides/{rideId}           - Get ride details
PUT    /rides/{rideId}           - Update ride
DELETE /rides/{rideId}           - Cancel ride
GET    /rides/search             - Search rides
POST   /rides/{rideId}/join      - Join a ride
```

### Restaurant Service
- **Base URL**: http://localhost:8082
- **Database**: restaurants (Port 3308)
- **Health Check**: http://localhost:8082/actuator/health

### Healthcare API Gateway
- **Base URL**: http://localhost:9090
- **Health Check**: http://localhost:9090/actuator/health
- **Routes**:
  - `/booking/**` → Booking Service
  - `/gotogether/**` → User Service
  - `/gotogether-ride/**` → Ride Service

### TrueMe API Gateway
- **Base URL**: http://localhost:9091
- **Health Check**: http://localhost:9091/actuator/health
- **Features**: CORS enabled for frontend development

### Eureka Service Discovery
- **URL**: http://localhost:8761/eureka
- **Eureka Dashboard**: http://localhost:8761
- View all registered services and their instances

### Redis Cache
- **Host**: localhost
- **Port**: 6379
- Used for caching and session management

## Common Docker Compose Commands

### View Service Status
```bash
docker-compose ps
docker-compose ps --services
docker-compose ps gotogether-user-service
```

### View Logs
```bash
# All services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f gotogether-user-service

# Timestamp included
docker-compose logs -f --timestamps

# Since specific time
docker-compose logs --since 2025-02-03
```

### Stop Services
```bash
# Stop all services (keep volumes)
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove everything including volumes (WARNING: deletes data!)
docker-compose down -v

# Stop specific service
docker-compose stop gotogether-user-service
```

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose start gotogether-user-service

# Restart specific service
docker-compose restart gotogether-user-service
```

### Rebuild Services
```bash
# Rebuild all images
docker-compose build

# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose build gotogether-user-service

# Rebuild without cache
docker-compose build --no-cache
```

### Execute Commands in Container
```bash
# Access service shell
docker-compose exec gotogether-user-service bash

# Execute MySQL commands
docker-compose exec mysql-users mysql -u root -p -e "SHOW DATABASES;"

# Execute Redis commands
docker-compose exec redis-service redis-cli PING
```

## Database Access

### MySQL Users Database
```bash
# Access MySQL CLI
docker-compose exec mysql-users mysql -u root -p gotogether_users_db

# Username: root
# Password: root123

# Common commands:
SHOW TABLES;
DESC users;
SELECT * FROM users LIMIT 5;
```

### MySQL Rides Database
```bash
docker-compose exec mysql-rides mysql -u root -p gotogether_rides_db
# Password: root123
```

### MySQL Restaurants Database
```bash
docker-compose exec mysql-restaurants mysql -u root -p restaurants
# Password: root
```

### Redis
```bash
# Access Redis CLI
docker-compose exec redis-service redis-cli

# Common commands:
PING
KEYS *
GET key_name
SET key_name value
DEL key_name
FLUSHDB
```

## Environment Variables Configuration

### User Service Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_APPLICATION_NAME` | gotogether-user-service | Application name |
| `SPRING_DATASOURCE_URL` | jdbc:mysql://... | Database URL |
| `SPRING_DATASOURCE_USERNAME` | root | DB username |
| `SPRING_DATASOURCE_PASSWORD` | root123 | DB password |
| `JWT_SECRET` | GotogetherSecret... | JWT secret key |
| `JWT_EXPIRATION` | 3600000 | Token expiration (ms) |
| `TWILIO_ACCOUNT_SID` | AC44... | Twilio account ID |
| `SENDGRID_API_KEY` | SG.... | SendGrid API key |
| `AWS_S3_BUCKET` | gotogether-user-service | S3 bucket name |
| `MAPMYINDIA_API_KEY` | wxjpp... | MapMyIndia API key |

### Ride Service Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_APPLICATION_NAME` | gotogether-ride-service | Application name |
| `SPRING_DATASOURCE_URL` | jdbc:mysql://... | Database URL |
| `EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE` | http://eureka-server:8761/eureka/ | Eureka server |
| `SERVER_PORT` | 8081 | Service port |

## Troubleshooting

### Container Exits Immediately
```bash
# Check logs for errors
docker-compose logs gotogether-user-service

# Rebuild the image
docker-compose build --no-cache gotogether-user-service

# Restart the service
docker-compose restart gotogether-user-service
```

### Database Connection Issues
```bash
# Verify MySQL is running
docker-compose ps mysql-users

# Check MySQL logs
docker-compose logs mysql-users

# Test MySQL connection
docker-compose exec mysql-users mysqladmin ping -h localhost

# Verify network connectivity
docker-compose exec gotogether-user-service ping mysql-users
```

### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :8080          # Windows
lsof -i :8080                         # Mac/Linux

# Change port in docker-compose.yml
# ports:
#   - "8080:8080"  →  "8090:8080"
```

### Services Cannot See Each Other
```bash
# Verify network is created
docker network ls

# Inspect network
docker network inspect gotogether_gotogether-network

# Verify container is on network
docker-compose exec gotogether-user-service ping gotogether-ride-service
```

### Out of Disk Space
```bash
# Clean up unused Docker resources
docker system prune -a

# Remove unused volumes
docker volume prune

# Check space usage
docker system df
```

### Restart All Services
```bash
# Full restart
docker-compose down
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

## Performance Tuning

### Increase JVM Memory
Edit `docker-compose.yml` and add to service environment:
```yaml
environment:
  JAVA_OPTS: "-Xmx1024m -Xms512m"
```

### Database Optimization
```bash
# Check slow query log
docker-compose exec mysql-users tail -f /var/log/mysql/slow.log

# Monitor connections
docker-compose exec mysql-users mysql -u root -proot123 -e "SHOW PROCESSLIST;"
```

### Redis Memory Management
```bash
docker-compose exec redis-service redis-cli INFO memory
docker-compose exec redis-service redis-cli CONFIG GET maxmemory
```

## Backup and Restore

### Backup MySQL Database
```bash
# Backup all databases
docker-compose exec mysql-users mysqldump -u root -proot123 --all-databases > backup.sql

# Backup specific database
docker-compose exec mysql-users mysqldump -u root -proot123 gotogether_users_db > users_backup.sql
```

### Restore MySQL Database
```bash
# Restore from backup
docker-compose exec -T mysql-users mysql -u root -proot123 < backup.sql
```

### Backup Volumes
```bash
# Backup MySQL volume
docker run --rm -v gotogether_mysql-users-data:/data -v $(pwd):/backup ubuntu tar cvf /backup/mysql-users-backup.tar /data

# Restore MySQL volume
docker run --rm -v gotogether_mysql-users-data:/data -v $(pwd):/backup ubuntu tar xvf /backup/mysql-users-backup.tar -C /
```

## Production Deployment Considerations

### Security
1. Change default passwords in environment variables
2. Use Docker secrets for sensitive data
3. Enable HTTPS/TLS at gateway level
4. Implement network policies
5. Regular security updates for base images

### Monitoring
1. Deploy Prometheus for metrics
2. Use ELK stack for centralized logging
3. Configure Grafana dashboards
4. Set up alerting rules

### High Availability
1. Use Kubernetes for orchestration
2. Implement service replicas
3. Configure load balancing
4. Use managed databases (AWS RDS, Azure DB)

### Scaling
```bash
# Scale specific service to 3 instances
docker-compose up -d --scale gotogether-user-service=3

# Note: This requires load balancing configuration
```

## Updating Services

### Update Single Service
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build gotogether-user-service

# Check new version
docker-compose logs -f gotogether-user-service
```

### Rolling Update
```bash
# Build new images
docker-compose build

# Restart services one by one
docker-compose restart gotogether-user-service
docker-compose restart gotogether-ride-service
docker-compose restart restaurant-service
```

## Integration Testing

### Test User Service
```bash
# Register user
curl -X POST http://localhost:8080/gotogether/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }'

# Login
curl -X POST http://localhost:8080/gotogether/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Test Ride Service
```bash
# Create ride (requires auth token)
curl -X POST http://localhost:8081/rides \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Mumbai",
    "destination": "Pune",
    "departureTime": "2025-02-03T10:00:00",
    "seats": 4
  }'
```

### Test Gateway
```bash
# Route through gateway
curl http://localhost:9090/gotogether/users/top-rated

# With CORS (TrueMe gateway)
curl -X OPTIONS http://localhost:9091/users/register \
  -H "Origin: http://localhost:3000"
```

## Support and Documentation

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Cloud Netflix Eureka](https://cloud.spring.io/spring-cloud-netflix/)
- [Spring Cloud Gateway](https://cloud.spring.io/spring-cloud-gateway/)

## Notes

- All services run on a custom Docker network `gotogether-network` for inter-service communication
- Data is persisted using Docker volumes
- Services automatically restart unless stopped manually
- Eureka server tracks all registered microservices
- Redis is shared across services for distributed caching
- Each database has its own MySQL instance for data isolation
