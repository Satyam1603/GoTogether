# GoTogether Ride Service - Docker Deployment Guide

## Overview
This guide provides instructions for deploying the GoTogether Ride Service using Docker and Docker Compose.

## Prerequisites
- Docker (version 20.10 or higher)
- Docker Compose (version 1.29 or higher)
- Git

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd gotogether-ride

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f gotogether-ride-service

# Stop services
docker-compose down
```

### 2. Build and Run Individual Docker Image

```bash
# Build the Docker image
docker build -t gotogether-ride-service:0.12.6 .

# Run the container with external dependencies
docker run -d \
  --name gotogether-ride-service \
  -p 8081:8081 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://mysql-host:3306/gotogether_rides_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=root123 \
  -e EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE=http://eureka-server:8761/eureka/ \
  gotogether-ride-service:0.12.6
```

## Service Configuration

### Environment Variables

The following environment variables can be set to customize the service:

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://mysql-service:3306/gotogether_rides_db` | MySQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | `root` | MySQL username |
| `SPRING_DATASOURCE_PASSWORD` | `root123` | MySQL password |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` | Hibernate DDL strategy |
| `EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE` | `http://eureka-server:8761/eureka/` | Eureka server URL |
| `LOGGING_LEVEL_ROOT` | `INFO` | Root logging level |
| `SERVER_PORT` | `8081` | Application port |

### Docker Compose Services

The `docker-compose.yml` includes:

1. **mysql-service** - MySQL 8.0 database
   - Port: 3306
   - Database: gotogether_rides_db
   - Credentials: root/root123

2. **redis-service** - Redis 7 cache
   - Port: 6379
   - Used for caching

3. **eureka-server** - Eureka Service Discovery
   - Port: 8761
   - Service registration and discovery

4. **gotogether-ride-service** - Main application
   - Port: 8081
   - REST API endpoints

## Common Commands

### View Running Containers
```bash
docker-compose ps
```

### View Service Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f gotogether-ride-service
```

### Access the Application
```bash
# Base URL
http://localhost:8081

# Swagger API Documentation
http://localhost:8081/swagger-ui.html

# Health Check
http://localhost:8081/actuator/health

# All Actuator Endpoints
http://localhost:8081/actuator
```

### Stop and Clean Up
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove unused images and containers
docker system prune
```

## Troubleshooting

### Container Exits Immediately
```bash
# Check logs
docker-compose logs gotogether-ride-service

# Verify database is running
docker-compose ps mysql-service
```

### Database Connection Issues
```bash
# Check MySQL is healthy
docker-compose exec mysql-service mysqladmin ping -h localhost

# Verify network connectivity
docker-compose exec gotogether-ride-service ping mysql-service
```

### Clear Database and Start Fresh
```bash
docker-compose down -v
docker-compose up -d
```

## Production Deployment

For production deployment, consider:

1. **Security**
   - Use strong passwords for MySQL
   - Store sensitive data in environment variables or secrets management
   - Use HTTPS/TLS
   - Implement proper CORS policies

2. **Performance**
   - Increase JVM memory: `docker run -e JAVA_OPTS="-Xmx1024m -Xms512m"`
   - Configure connection pooling
   - Enable caching with Redis

3. **Monitoring**
   - Use Prometheus and Grafana for metrics
   - Configure centralized logging (ELK stack)
   - Set up health checks and alerts

4. **Scaling**
   - Use Kubernetes for orchestration
   - Load balance traffic between instances
   - Use managed services (AWS RDS, ElastiCache, etc.)

## Docker Image Details

### Dockerfile Stages
- **Stage 1 (Builder)**: Maven 3.9 with Eclipse Temurin JDK 21
- **Stage 2 (Runtime)**: Eclipse Temurin JRE 21 (smaller image)

### Image Size Optimization
- Multi-stage build reduces final image size
- Only JRE (not JDK) in runtime stage
- .dockerignore excludes unnecessary files

## Health Checks

The service includes health checks for:
- **Application**: Spring Boot Actuator `/actuator/health`
- **Database**: MySQL health check endpoint
- **Cache**: Redis PING command

## Support and Documentation

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Eureka Documentation](https://cloud.spring.io/spring-cloud-netflix/)

## Notes

- All services run on a custom Docker network `gotogether-network` for inter-service communication
- Data is persisted using Docker volumes for MySQL and Redis
- Services automatically restart unless stopped manually
