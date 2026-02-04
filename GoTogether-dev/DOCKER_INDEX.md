# GoTogether Docker Deployment - Complete Index

## 🎯 Start Here

**New to this setup?** Start with these files in order:

1. **[QUICK_START_DOCKER.md](./QUICK_START_DOCKER.md)** - 5 minute setup
2. **[README_DOCKER.md](./README_DOCKER.md)** - Overview and common tasks
3. **[DOCKER_COMPLETE_GUIDE.md](./DOCKER_COMPLETE_GUIDE.md)** - Advanced topics

---

## 📂 Directory Structure

```
GoTogether-dev/                          (User Service + Master Orchestration)
├── docker-compose.yml                  ✅ Master orchestration file
├── Dockerfile                          ✅ User Service container
├── .dockerignore                       ✅ Build optimization
├── deploy.ps1                          ✅ Windows deployment script
├── deploy.sh                           ✅ Mac/Linux deployment script
│
├── 📚 DOCUMENTATION
├── README_DOCKER.md                    ✅ Main guide (START HERE)
├── QUICK_START_DOCKER.md               ✅ Quick 5-minute setup
├── DOCKER_COMPLETE_GUIDE.md            ✅ Comprehensive reference
├── DEPLOYMENT_SETUP_SUMMARY.md         ✅ What was created
└── DOCKER_INDEX.md                     ✅ This file

../GoTogether-ride/                     (Ride Service)
├── Dockerfile                          ✅ Ride Service container
└── .dockerignore                       ✅ Build optimization

../restaurants_backend/                 (Restaurant Service)
├── Dockerfile                          ✅ Restaurant Service container
└── .dockerignore                       ✅ Build optimization

../HealthcareApiGateway/                (API Gateway)
├── Dockerfile                          ✅ Gateway container
└── .dockerignore                       ✅ Build optimization

../trueme-api-gateway/                  (Alternative Gateway)
├── Dockerfile                          ✅ Gateway container
└── .dockerignore                       ✅ Build optimization
```

---

## 🚀 Quick Commands

### Start Everything
```bash
# Windows PowerShell
.\deploy.ps1 start

# Mac/Linux
./deploy.sh start

# Direct Docker Compose
docker-compose up -d
```

### View Status
```bash
# Windows
.\deploy.ps1 status

# Mac/Linux
./deploy.sh status

# Direct
docker-compose ps
```

### View Logs
```bash
# Windows
.\deploy.ps1 logs

# Mac/Linux
./deploy.sh logs

# Direct
docker-compose logs -f
```

### Stop Everything
```bash
# Windows
.\deploy.ps1 stop

# Mac/Linux
./deploy.sh stop

# Direct
docker-compose stop
```

---

## 🌐 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **User Service** | http://localhost:8080 | User management API |
| **User API Docs** | http://localhost:8080/swagger-ui.html | Swagger UI |
| **Ride Service** | http://localhost:8081 | Ride management API |
| **Ride API Docs** | http://localhost:8081/swagger-ui.html | Swagger UI |
| **Restaurant Service** | http://localhost:8082 | Restaurant API |
| **Healthcare Gateway** | http://localhost:9090 | API Gateway |
| **TrueMe Gateway** | http://localhost:9091 | Alternative Gateway |
| **Eureka Dashboard** | http://localhost:8761 | Service Registry |
| **Health Check** | http://localhost:8080/actuator/health | Service status |

---

## 📊 Services Overview

### User Service (Port 8080)
- **Database**: MySQL on 3306 (gotogether_users_db)
- **Purpose**: User registration, authentication, profiles
- **Key Endpoints**:
  - `POST /gotogether/users/register` - Register new user
  - `POST /gotogether/users/login` - Login user
  - `GET /gotogether/users/{id}` - Get user profile

### Ride Service (Port 8081)
- **Database**: MySQL on 3307 (gotogether_rides_db)
- **Purpose**: Ride creation, booking, management
- **Key Endpoints**:
  - `POST /rides` - Create ride
  - `GET /rides/{id}` - Get ride details
  - `POST /rides/{id}/join` - Join ride

### Restaurant Service (Port 8082)
- **Database**: MySQL on 3308 (restaurants)
- **Purpose**: Restaurant management and search
- **Key Endpoints**: Varies by implementation

### Healthcare Gateway (Port 9090)
- **Purpose**: API Gateway for microservices
- **Routes**:
  - `/booking/**` → Booking Service
  - `/gotogether/**` → User Service
  - `/gotogether-ride/**` → Ride Service

### TrueMe Gateway (Port 9091)
- **Purpose**: Alternative gateway with CORS support
- **Features**: Frontend-friendly CORS configuration

### Eureka Server (Port 8761)
- **Purpose**: Service discovery and registration
- **Features**:
  - Automatic service registration
  - Health monitoring
  - Load balancing support

### Redis (Port 6379)
- **Purpose**: Distributed caching
- **Features**:
  - Session management
  - Cache storage
  - Rate limiting

---

## 💾 Database Access

### MySQL Users Database
```bash
docker-compose exec mysql-users mysql -u root -proot123 gotogether_users_db
```

### MySQL Rides Database
```bash
docker-compose exec mysql-rides mysql -u root -proot123 gotogether_rides_db
```

### MySQL Restaurants Database
```bash
docker-compose exec mysql-restaurants mysql -u root -p restaurants
# Password: root
```

### Redis
```bash
docker-compose exec redis-service redis-cli
```

---

## 📖 Documentation Guide

### For Different Use Cases

#### I just want to get it running
➜ Read: **[QUICK_START_DOCKER.md](./QUICK_START_DOCKER.md)**
- 5-minute setup
- Essential commands only
- Verification checklist

#### I want to understand the architecture
➜ Read: **[README_DOCKER.md](./README_DOCKER.md)**
- Architecture diagrams
- Service descriptions
- Common operations
- Troubleshooting basics

#### I need comprehensive reference
➜ Read: **[DOCKER_COMPLETE_GUIDE.md](./DOCKER_COMPLETE_GUIDE.md)**
- All available commands
- Environment variables
- Production deployment
- Backup/restore procedures
- Performance tuning

#### I want to know what was created
➜ Read: **[DEPLOYMENT_SETUP_SUMMARY.md](./DEPLOYMENT_SETUP_SUMMARY.md)**
- All files created
- Their locations
- Key features
- What each file does

---

## 🔧 Common Tasks

### Add a New Environment Variable
1. Edit `docker-compose.yml`
2. Find the service section
3. Add to `environment:` section:
   ```yaml
   environment:
     NEW_VAR: "value"
   ```
4. Restart service: `docker-compose restart service-name`

### Scale a Service (multiple instances)
```bash
docker-compose up -d --scale gotogether-user-service=3
```
Note: Requires load balancing configuration

### Access Service Container
```bash
docker-compose exec gotogether-user-service bash
```

### View Service Logs (Last 100 lines)
```bash
docker-compose logs --tail=100 gotogether-user-service
```

### Rebuild a Service
```bash
docker-compose build --no-cache gotogether-user-service
docker-compose up -d gotogether-user-service
```

### Backup Database
```bash
docker-compose exec mysql-users mysqldump -u root -proot123 --all-databases > backup.sql
```

### Restore Database
```bash
docker-compose exec -T mysql-users mysql -u root -proot123 < backup.sql
```

---

## 🆘 Troubleshooting Quick Links

### Containers won't start?
- Check logs: `docker-compose logs`
- Rebuild: `docker-compose build --no-cache`
- Restart: `docker-compose restart`

### Can't connect to service?
- Check status: `docker-compose ps`
- Test connection: `docker-compose exec gotogether-user-service ping eureka-server`
- Check ports: `docker-compose ps`

### Out of disk space?
```bash
docker system prune -a
docker volume prune
```

### Port already in use?
- Find process: `netstat -ano | findstr :8080` (Windows)
- Change port in docker-compose.yml
- Restart: `docker-compose up -d`

### Forgotten database password?
```bash
# Users DB: root / root123
# Restaurants DB: root / root
# Redis: no password
```

### Need to start fresh?
```bash
# WARNING: This deletes all data!
docker-compose down -v
docker-compose up -d --build
```

---

## 📋 Pre-Deployment Checklist

Before starting services:

- [ ] Docker Desktop installed and running
- [ ] Docker Compose installed (version 1.29+)
- [ ] At least 4GB RAM available to Docker
- [ ] 20GB free disk space
- [ ] Ports 8080, 8081, 8082, 9090, 9091, 8761, 3306, 3307, 3308, 6379 are free
- [ ] Internet connection for pulling Docker images

## ✅ Post-Deployment Checklist

After starting services:

- [ ] All 10 containers running: `docker-compose ps`
- [ ] Eureka shows all services: http://localhost:8761
- [ ] User Service responding: http://localhost:8080/actuator/health
- [ ] Ride Service responding: http://localhost:8081/actuator/health
- [ ] Can view User Service API: http://localhost:8080/swagger-ui.html
- [ ] Can view Ride Service API: http://localhost:8081/swagger-ui.html
- [ ] Can access databases via CLI
- [ ] Logs show no critical errors: `docker-compose logs`

---

## 🎓 Learning Path

**Beginner:**
1. QUICK_START_DOCKER.md
2. Run `./deploy.ps1 start` or `./deploy.sh start`
3. Visit http://localhost:8761
4. View README_DOCKER.md

**Intermediate:**
1. Read README_DOCKER.md completely
2. Try different deployment scripts
3. Access databases using CLI commands
4. View and analyze service logs

**Advanced:**
1. Read DOCKER_COMPLETE_GUIDE.md
2. Configure environment variables
3. Scale services
4. Set up monitoring and logging
5. Deploy to production

---

## 🔐 Security Notes

### Development Environment
- ✅ Default credentials used (convenient for development)
- ✅ Services accessible on localhost
- ✅ HTTP used (not HTTPS)
- ✅ All actuator endpoints exposed

### Production Environment
- ❌ Change all default passwords
- ❌ Use environment variables for secrets
- ❌ Enable HTTPS/TLS
- ❌ Implement authentication
- ❌ Use Docker secrets
- ❌ Restrict network access
- ❌ Monitor and log all access

See DOCKER_COMPLETE_GUIDE.md for production security setup.

---

## 📞 Support Resources

### Official Documentation
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Spring Cloud Docs](https://spring.io/projects/spring-cloud)

### Useful Commands
```bash
# Verify Docker installation
docker --version
docker-compose --version

# Check system resources
docker system df

# Check network
docker network ls

# Inspect specific container
docker inspect <container-name>

# View container stats
docker stats
```

---

## 📝 File Descriptions

| File | Type | Description | Read Time |
|------|------|-------------|-----------|
| **README_DOCKER.md** | Documentation | Main overview and guide | 10 min |
| **QUICK_START_DOCKER.md** | Guide | Quick setup instructions | 5 min |
| **DOCKER_COMPLETE_GUIDE.md** | Reference | Comprehensive documentation | 30 min |
| **DEPLOYMENT_SETUP_SUMMARY.md** | Summary | What was created and where | 10 min |
| **docker-compose.yml** | Config | Service orchestration | - |
| **Dockerfile** (5 files) | Docker | Container definitions | - |
| **.dockerignore** (5 files) | Config | Build optimization | - |
| **deploy.ps1** | Script | Windows deployment tool | - |
| **deploy.sh** | Script | Mac/Linux deployment tool | - |

---

## 🎉 You're Ready!

Everything is set up and ready to deploy. Choose your next step:

### Option 1: Quick Start (Recommended for new users)
```bash
# Windows
.\deploy.ps1 start

# Mac/Linux
./deploy.sh start
```

Then visit: http://localhost:8761

### Option 2: Docker Compose Direct
```bash
docker-compose up -d
docker-compose ps
```

### Option 3: Learn First
- Read: README_DOCKER.md
- Then run: `./deploy.ps1 start` or `./deploy.sh start`

---

## 📈 What's Next?

After deployment:
1. ✅ Verify all services are running
2. ✅ Test API endpoints
3. ✅ Access Eureka Dashboard
4. ✅ Review logs for any issues
5. ✅ Set up your frontend
6. ✅ Configure production settings

---

**Last Updated:** February 3, 2026
**Status:** ✅ Complete and Ready
**Version:** 1.0.0

For detailed information, see [DOCKER_COMPLETE_GUIDE.md](./DOCKER_COMPLETE_GUIDE.md)
