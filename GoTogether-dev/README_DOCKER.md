# GoTogether Microservices - Docker Deployment Setup

## 📋 Overview

This document describes the complete Docker deployment setup for the GoTogether microservices ecosystem. All microservices, databases, caching layers, and API gateways are containerized and orchestrated using Docker Compose.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Applications                │
│              (React/Angular on Port 3000+)              │
└────────┬──────────────────────────────────────┬─────────┘
         │                                      │
    ┌────▼───────────────────┐    ┌────────────▼────────┐
    │ Healthcare Gateway     │    │ TrueMe Gateway      │
    │ (Port 9090)            │    │ (Port 9091)         │
    └────┬───────────────────┘    └────────────┬────────┘
         │                                      │
    ┌────┴──────────────┬──────────────────┬───┴─────┐
    │                   │                  │         │
┌───▼────┐          ┌───▼────┐        ┌───▼────┐   │
│ User   │          │  Ride  │        │ Rest.  │   │
│Service │          │Service │        │Service │   │
│(8080)  │          │(8081)  │        │(8082)  │   │
└───┬────┘          └───┬────┘        └───┬────┘   │
    │                   │                  │        │
┌───▼────────────────────▼──────────────────▼──┐   │
│          Eureka Service Discovery            │   │
│                (Port 8761)                   │   │
└───┬────────────────────────────────────────────┘   │
    │                                                │
    │   ┌────────────────────────────────┐         │
    │   │    Redis Cache (Port 6379)     │         │
    │   └────────────────────────────────┘         │
    │                                                │
    ├─────────────────────────────────────────────┤
    │                                                │
┌───▼────────┐ ┌──────────────┐ ┌────────────────┐
│ MySQL      │ │ MySQL Rides  │ │ MySQL Restau. │
│ Users DB   │ │ (Port 3307)  │ │ (Port 3308)    │
│(Port 3306) │ │              │ │                │
└────────────┘ └──────────────┘ └────────────────┘
```

## 📦 Services

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| **User Service** | 8080 | MySQL (3306) | User management, auth, profile |
| **Ride Service** | 8081 | MySQL (3307) | Ride creation, booking, management |
| **Restaurant Service** | 8082 | MySQL (3308) | Restaurant management |
| **Healthcare Gateway** | 9090 | N/A | API Gateway for services |
| **TrueMe Gateway** | 9091 | N/A | Alternative Gateway with CORS |
| **Eureka Server** | 8761 | N/A | Service discovery |
| **Redis** | 6379 | N/A | Distributed caching |

## 🚀 Quick Start

### Windows Users

```powershell
# Make script executable (first time only)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Start all services
.\deploy.ps1 start

# View status
.\deploy.ps1 status

# View logs
.\deploy.ps1 logs

# Stop all services
.\deploy.ps1 stop

# Get help
.\deploy.ps1 help
```

### Mac/Linux Users

```bash
# Make script executable
chmod +x deploy.sh

# Start all services
./deploy.sh start

# View status
./deploy.sh status

# View logs
./deploy.sh logs

# Stop all services
./deploy.sh stop

# Get help
./deploy.sh help
```

### Using Docker Compose Directly

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
GoTogether-dev/
├── Dockerfile                      # User Service Docker image
├── .dockerignore
├── docker-compose.yml              # Master orchestration file
├── deploy.ps1                      # Windows deployment script
├── deploy.sh                        # Mac/Linux deployment script
├── DOCKER_COMPLETE_GUIDE.md         # Comprehensive guide
├── QUICK_START_DOCKER.md            # Quick start guide
├── pom.xml
├── src/
│   └── main/
│       ├── java/
│       │   └── com/gotogether/...
│       └── resources/
│           └── application.properties
└── ...

GoTogether-ride/
├── Dockerfile                      # Ride Service Docker image
├── .dockerignore
├── pom.xml
├── src/
│   └── main/
│       └── ...
└── ...

restaurants_backend/
├── Dockerfile                      # Restaurant Service Docker image
├── .dockerignore
├── pom.xml
└── ...

HealthcareApiGateway/
├── Dockerfile                      # API Gateway Docker image
├── .dockerignore
├── pom.xml
└── ...

trueme-api-gateway/
├── Dockerfile                      # TrueMe Gateway Docker image
├── .dockerignore
├── pom.xml
└── ...
```

## 🔧 Configuration

### Environment Variables

Each service can be configured via environment variables in `docker-compose.yml`:

```yaml
environment:
  SPRING_APPLICATION_NAME: gotogether-user-service
  SPRING_DATASOURCE_URL: jdbc:mysql://mysql-users:3306/gotogether_users_db
  SPRING_DATASOURCE_USERNAME: root
  SPRING_DATASOURCE_PASSWORD: root123
  JWT_SECRET: your-secret-key
  EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE: http://eureka-server:8761/eureka/
```

### Database Credentials

**Users Database:**
- Username: `root`
- Password: `root123`
- Database: `gotogether_users_db`
- Port: `3306`

**Rides Database:**
- Username: `root`
- Password: `root123`
- Database: `gotogether_rides_db`
- Port: `3307`

**Restaurants Database:**
- Username: `root`
- Password: `root`
- Database: `restaurants`
- Port: `3308`

## 🌐 Accessing Services

### API Endpoints

| Service | Endpoint | Docs |
|---------|----------|------|
| User Service | http://localhost:8080 | http://localhost:8080/swagger-ui.html |
| Ride Service | http://localhost:8081 | http://localhost:8081/swagger-ui.html |
| Restaurant | http://localhost:8082 | http://localhost:8082/actuator/health |
| Healthcare Gateway | http://localhost:9090 | http://localhost:9090/actuator/health |
| TrueMe Gateway | http://localhost:9091 | http://localhost:9091/actuator/health |
| Eureka Dashboard | http://localhost:8761 | http://localhost:8761 |

### Database Access

```bash
# Access MySQL Users Database
docker-compose exec mysql-users mysql -u root -proot123 gotogether_users_db

# Access Redis
docker-compose exec redis-service redis-cli

# Access MongoDB (if used)
docker-compose exec mongo-service mongosh
```

## 📊 Monitoring

### View Service Status
```bash
docker-compose ps
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f gotogether-user-service

# Last 100 lines
docker-compose logs --tail=100 gotogether-user-service

# With timestamps
docker-compose logs -f --timestamps
```

### Check Service Health
```bash
# User Service
curl http://localhost:8080/actuator/health

# Ride Service
curl http://localhost:8081/actuator/health

# Check all registered services in Eureka
curl http://localhost:8761/eureka/apps
```

## 🔄 Common Operations

### Build Images
```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build gotogether-user-service

# Build without cache
docker-compose build --no-cache
```

### Start/Stop Services
```bash
# Start all services
docker-compose up -d

# Stop all services (keep data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Restart specific service
docker-compose restart gotogether-user-service

# Restart all services
docker-compose restart
```

### View Container Details
```bash
# SSH into service
docker-compose exec gotogether-user-service bash

# View service logs with errors only
docker-compose logs gotogether-user-service | grep ERROR

# Monitor resource usage
docker stats
```

## 🧪 Testing

### Health Check
```bash
# Check all services are up
curl http://localhost:8761/eureka/apps
```

### Register New User
```bash
curl -X POST http://localhost:8080/gotogether/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "SecurePassword123!"
  }'
```

### Login User
```bash
curl -X POST http://localhost:8080/gotogether/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

## 🛠️ Troubleshooting

### Services Won't Start
```bash
# Check logs for errors
docker-compose logs

# Verify Docker is running
docker ps

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Port Already in Use
```bash
# Find process using port (Windows)
netstat -ano | findstr :8080

# Find process using port (Mac/Linux)
lsof -i :8080

# Change port in docker-compose.yml
# ports:
#   - "8080:8080"  →  "8090:8080"
```

### Database Connection Issues
```bash
# Check MySQL is running
docker-compose ps mysql-users

# Verify database credentials
docker-compose exec mysql-users mysql -u root -proot123 -e "SHOW DATABASES;"

# Check network connectivity
docker-compose exec gotogether-user-service ping mysql-users
```

### Out of Disk Space
```bash
# Clean up Docker resources
docker system prune -a

# Check disk usage
docker system df

# Remove unused volumes
docker volume prune
```

## 📚 Documentation

- **[DOCKER_COMPLETE_GUIDE.md](./DOCKER_COMPLETE_GUIDE.md)** - Comprehensive guide with all commands and configurations
- **[QUICK_START_DOCKER.md](./QUICK_START_DOCKER.md)** - Quick start guide for immediate deployment
- **[Docker Documentation](https://docs.docker.com/)** - Official Docker documentation
- **[Docker Compose Documentation](https://docs.docker.com/compose/)** - Official Compose documentation

## 🔐 Security Notes

### Development
- Default passwords are used for development convenience
- Services are accessible on localhost only
- HTTP is used instead of HTTPS

### Production
- Change all default passwords immediately
- Use environment variables or Docker secrets for sensitive data
- Enable HTTPS/TLS at the gateway level
- Implement network policies
- Use managed databases (AWS RDS, etc.)
- Enable authentication on Redis and MySQL
- Implement rate limiting and DDoS protection

## 📈 Performance Tuning

### Increase JVM Memory
```yaml
environment:
  JAVA_OPTS: "-Xmx1024m -Xms512m"
```

### Database Optimization
```bash
# Monitor MySQL performance
docker-compose exec mysql-users mysql -u root -proot123 -e "SHOW PROCESSLIST;"

# Check Redis memory
docker-compose exec redis-service redis-cli INFO memory
```

## 🔄 Backup and Restore

### Backup Database
```bash
docker-compose exec mysql-users mysqldump -u root -proot123 --all-databases > backup.sql
```

### Restore Database
```bash
docker-compose exec -T mysql-users mysql -u root -proot123 < backup.sql
```

## 🚢 Deployment to Production

### Using Kubernetes
```bash
# Convert docker-compose to Kubernetes manifests
kompose convert -f docker-compose.yml -o k8s/

# Deploy to Kubernetes
kubectl apply -f k8s/
```

### Using Docker Swarm
```bash
# Initialize Swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml gotogether
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the complete guide: `DOCKER_COMPLETE_GUIDE.md`
3. Check Docker logs: `docker-compose logs`
4. Visit official documentation

## 📝 License

GoTogether Microservices - All Rights Reserved

---

**Last Updated:** February 2025
**Version:** 1.0.0
