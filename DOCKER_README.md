# GoTogether Docker Setup Guide

This guide provides instructions for building and running the GoTogether platform using Docker.

## Architecture Overview

The GoTogether platform consists of the following services:

- **API Gateway** (Port 8080) - Spring Cloud Gateway for routing requests
- **User Service** (Port 8081) - Spring Boot service for user management
- **Booking Service** (Port 8082) - Spring Boot service for booking management
- **Ride Service** (Port 8083) - Spring Boot service for ride management
- **Vehicle Service** (Port 8084) - .NET 8.0 service for vehicle management
- **Frontend** (Port 80) - React + Vite application
- **MySQL** (Port 3306) - Database
- **Redis** (Port 6379) - Cache and session storage
- **Kafka** (Port 9092) - Message broker
- **Zookeeper** (Port 2181) - Kafka coordination

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 8GB RAM allocated to Docker
- At least 20GB free disk space

## Quick Start

### 1. Clone the repository and navigate to the project directory

```bash
cd PROJECT
```

### 2. Build and start all services

```bash
docker-compose up --build
```

This will:
- Build Docker images for all services
- Start all containers
- Create necessary databases
- Set up networking between services

### 3. Access the application

- **Frontend**: http://localhost
- **API Gateway**: http://localhost:8080
- **User Service**: http://localhost:8081
- **Booking Service**: http://localhost:8082
- **Ride Service**: http://localhost:8083
- **Vehicle Service**: http://localhost:8084

## Individual Service Management

### Build individual service

```bash
# Build User Service
docker-compose build user-service

# Build Frontend
docker-compose build frontend
```

### Start specific services

```bash
# Start only database and cache
docker-compose up mysql redis

# Start backend services
docker-compose up user-service booking-service ride-service vehicle-service api-gateway
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f user-service
```

### Stop services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

## Service Health Checks

All services include health checks. You can monitor service health:

```bash
# Check container status
docker-compose ps

# Check specific service health
docker inspect --format='{{json .State.Health}}' gotogether-user-service
```

## Environment Variables

### User Service
- `SPRING_DATASOURCE_URL` - Database connection URL
- `SPRING_REDIS_HOST` - Redis host
- `SPRING_KAFKA_BOOTSTRAP_SERVERS` - Kafka servers
- `AWS_ACCESS_KEY_ID` - AWS access key for S3
- `AWS_SECRET_ACCESS_KEY` - AWS secret key for S3
- `AWS_REGION` - AWS region

### Frontend
- `VITE_API_BASE_URL` - API Gateway URL (default: http://localhost:8080)

You can override these in a `.env` file at the root of the project:

```env
# Database
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=gotogether

# AWS S3 (for User Service)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
```

## Development Mode

### Running with live reload (for development)

For backend services, you can mount source code as volumes:

```yaml
# Add to docker-compose.override.yml
services:
  user-service:
    volumes:
      - ./GoTogether-dev/src:/app/src
    environment:
      SPRING_DEVTOOLS_RESTART_ENABLED: "true"
```

For frontend:
```bash
# Run frontend in dev mode (outside Docker)
cd "Car Sharing Platform (2)"
npm install
npm run dev
```

## Troubleshooting

### Services not starting
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild from scratch
docker-compose down -v
docker-compose up --build --force-recreate
```

### Database connection issues
```bash
# Verify MySQL is running
docker-compose ps mysql

# Connect to MySQL
docker exec -it gotogether-mysql mysql -uroot -proot123

# Check database
mysql> SHOW DATABASES;
mysql> USE gotogether;
mysql> SHOW TABLES;
```

### Port conflicts
If ports are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "3000:80"  # Change from 80:80 to 3000:80
```

### Memory issues
Increase Docker memory allocation:
- Docker Desktop: Settings → Resources → Memory (recommend 8GB+)

### Network issues
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up
```

## Production Deployment

### Build optimized images

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
```

### Use external database

Update `docker-compose.yml` to use external MySQL/Redis:

```yaml
services:
  user-service:
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://your-rds-endpoint:3306/gotogether
      SPRING_REDIS_HOST: your-redis-endpoint
```

### Enable HTTPS for frontend

Update nginx configuration to include SSL certificates:

```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

## Container Images

### Tagging images

```bash
# Tag images
docker tag gotogether-user-service:latest your-registry/gotogether-user-service:v1.0
docker tag gotogether-frontend:latest your-registry/gotogether-frontend:v1.0

# Push to registry
docker push your-registry/gotogether-user-service:v1.0
docker push your-registry/gotogether-frontend:v1.0
```

## Monitoring

### View resource usage

```bash
# Real-time resource monitoring
docker stats

# Specific service
docker stats gotogether-user-service
```

## Useful Commands

```bash
# Remove all stopped containers
docker-compose rm

# Remove unused images
docker image prune

# Execute command in running container
docker-compose exec user-service bash

# View container IP addresses
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' gotogether-user-service
```

## API Documentation

Once services are running:

- **User Service Swagger**: http://localhost:8081/swagger-ui.html
- **Booking Service Swagger**: http://localhost:8082/swagger-ui.html
- **Ride Service Swagger**: http://localhost:8083/swagger-ui.html
- **Vehicle Service Swagger**: http://localhost:8084/swagger/index.html

## Support

For issues and questions, please refer to the main project README or contact the development team.
