# Quick Start Guide - GoTogether Docker Deployment

## Prerequisites
- Docker Desktop installed and running
- Docker Compose installed
- Git installed
- At least 4GB RAM available

## Step 1: Clone/Navigate to Project

```bash
# If you don't have the projects, clone them:
# (These steps assume you already have the projects)

cd path/to/GoTogether-dev
```

## Step 2: Verify Project Structure

Ensure you have these project folders:
```
GoTogether-dev/              ✓ (Current directory)
../GoTogether-ride/          ✓ (Sibling directory)
../restaurants_backend/      ✓ (Sibling directory)
../HealthcareApiGateway/     ✓ (Sibling directory)
../trueme-api-gateway/       ✓ (Sibling directory)
```

## Step 3: Start All Services

```bash
# Start all services in background
docker-compose up -d

# Wait for services to be healthy (usually 30-60 seconds)
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 4: Verify Services

Open these URLs in your browser:

| Service | URL | Expected |
|---------|-----|----------|
| Eureka | http://localhost:8761 | Service Dashboard |
| User Service | http://localhost:8080/swagger-ui.html | Swagger API |
| Ride Service | http://localhost:8081/swagger-ui.html | Swagger API |
| Restaurant | http://localhost:8082/actuator/health | {"status":"UP"} |
| Gateway 1 | http://localhost:9090/actuator/health | {"status":"UP"} |
| Gateway 2 | http://localhost:9091/actuator/health | {"status":"UP"} |

## Step 5: Test API Endpoints

### Register a User
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

### Expected Response
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "message": "User registered successfully"
}
```

### Login
```bash
curl -X POST http://localhost:8080/gotogether/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

## Useful Commands

### View Service Logs
```bash
docker-compose logs -f gotogether-user-service
docker-compose logs -f gotogether-ride-service
docker-compose logs -f restaurant-service
```

### Stop Everything
```bash
docker-compose down
```

### Stop and Clean (WARNING: Deletes Databases!)
```bash
docker-compose down -v
```

### Restart a Service
```bash
docker-compose restart gotogether-user-service
```

### Access Database
```bash
# MySQL Users
docker-compose exec mysql-users mysql -u root -proot123 gotogether_users_db

# Redis
docker-compose exec redis-service redis-cli
```

## Troubleshooting

### Services not starting?
```bash
# Check all logs
docker-compose logs

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

### Port already in use?
```bash
# Windows
netstat -ano | findstr :8080

# Mac/Linux
lsof -i :8080

# Then update the port in docker-compose.yml
```

### Out of memory?
```bash
# Free up space
docker system prune -a

# Give Docker more RAM in settings
# Docker Desktop → Preferences → Resources → Increase RAM
```

## Next Steps

1. **Read Full Documentation**: See `DOCKER_COMPLETE_GUIDE.md`
2. **Configure Environment**: Update credentials in `docker-compose.yml`
3. **Database Access**: Use the commands above to access databases
4. **Frontend Integration**: Configure frontend to use gateway URLs
5. **Monitoring**: Set up logs monitoring with `docker-compose logs -f`

## Important URLs

| Component | URL |
|-----------|-----|
| User API | http://localhost:8080 |
| Ride API | http://localhost:8081 |
| Restaurant API | http://localhost:8082 |
| Gateway 1 | http://localhost:9090 |
| Gateway 2 | http://localhost:9091 |
| Eureka Dashboard | http://localhost:8761 |

## Need Help?

```bash
# Check Docker version
docker --version
docker-compose --version

# Verify Docker daemon is running
docker ps

# Run complete diagnostics
docker-compose ps
docker-compose logs
```

**You're ready to go! Happy coding! 🚀**
