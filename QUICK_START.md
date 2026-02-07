# GoTogether Platform - Docker Quick Start Guide

## 🎯 What Has Been Created

A complete Docker containerization setup for your GoTogether ride-sharing platform with:

✅ **6 Service Dockerfiles** (User, Booking, Ride, Vehicle, Gateway, Frontend)  
✅ **Full orchestration** with Docker Compose  
✅ **Production configuration** with resource limits  
✅ **Management scripts** for Windows and Linux/Mac  
✅ **Complete documentation** and troubleshooting guide  

---

## 📁 File Structure

```
PROJECT/
├── 🐳 docker-compose.yml              # Main orchestration file
├── 🐳 docker-compose.prod.yml         # Production overrides
├── 🔧 docker.bat                      # Windows management script
├── 🔧 docker.sh                       # Linux/Mac management script
├── 📝 .env.example                    # Environment template
├── 🗄️ init-db.sql                     # Database initialization
├── 📖 DOCKER_README.md                # Detailed documentation
│
├── GoTogether-dev/                    # User Service
│   ├── Dockerfile                     # ✅ Spring Boot build
│   └── .dockerignore
│
├── Booking/                           # Booking Service
│   ├── Dockerfile                     # ✅ Spring Boot build
│   └── .dockerignore
│
├── GoTogether-ride/                   # Ride Service
│   ├── Dockerfile                     # ✅ Spring Boot build
│   └── .dockerignore
│
├── VehicleService/                    # Vehicle Service
│   ├── Dockerfile                     # ✅ .NET 8.0 build
│   └── .dockerignore
│
├── trueme-api-gateway/                # API Gateway
│   ├── Dockerfile                     # ✅ Spring Cloud Gateway
│   └── .dockerignore
│
└── Car Sharing Platform (2)/          # Frontend
    ├── Dockerfile                     # ✅ React + Vite + Nginx
    ├── .dockerignore
    └── nginx.conf                     # Nginx configuration
```

---

## ⚡ 3-Step Quick Start

### Step 1: Configure Environment

```bash
# Copy environment template
copy .env.example .env

# Edit .env with your settings (use Notepad or any editor)
notepad .env
```

**Minimum required settings:**
```env
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=gotogether
```

### Step 2: Build All Services

```bash
# Windows
docker.bat build

# Linux/Mac
chmod +x docker.sh
./docker.sh build
```

This will build Docker images for all 6 services (~5-10 minutes first time).

### Step 3: Start Everything

```bash
# Windows
docker.bat start

# Linux/Mac
./docker.sh start
```

**Access your application:**
- 🌐 **Frontend**: http://localhost
- 🔌 **API Gateway**: http://localhost:8080
- 📚 **API Docs**: http://localhost:8081/swagger-ui.html

---

## 🎮 Management Commands

### Windows (docker.bat)

```bash
docker.bat build              # Build all services
docker.bat build user-service # Build specific service
docker.bat start              # Start all services
docker.bat stop               # Stop all services
docker.bat logs               # View all logs
docker.bat logs user-service  # View specific service logs
docker.bat health             # Check service status
docker.bat clean              # Remove everything (careful!)
docker.bat deploy             # Production deployment
```

### Linux/Mac (docker.sh)

Same commands as Windows, just use `./docker.sh` instead of `docker.bat`

---

## 🔍 Verify Installation

### Check Running Services

```bash
docker.bat health
```

You should see all services with status "Up" and "healthy":
```
NAME                          STATUS              PORTS
gotogether-frontend           Up (healthy)        0.0.0.0:80->80/tcp
gotogether-api-gateway        Up (healthy)        0.0.0.0:8080->8080/tcp
gotogether-user-service       Up (healthy)        0.0.0.0:8081->8081/tcp
gotogether-booking-service    Up (healthy)        0.0.0.0:8082->8082/tcp
gotogether-ride-service       Up (healthy)        0.0.0.0:8083->8083/tcp
gotogether-vehicle-service    Up (healthy)        0.0.0.0:8084->8084/tcp
gotogether-mysql              Up (healthy)        0.0.0.0:3306->3306/tcp
gotogether-redis              Up (healthy)        0.0.0.0:6379->6379/tcp
gotogether-kafka              Up (healthy)        0.0.0.0:9092->9092/tcp
```

### Test Each Service

1. **Frontend**: Open http://localhost in browser
2. **API Gateway**: `curl http://localhost:8080/actuator/health`
3. **User Service**: http://localhost:8081/swagger-ui.html
4. **Booking Service**: http://localhost:8082/swagger-ui.html
5. **Ride Service**: http://localhost:8083/swagger-ui.html
6. **Vehicle Service**: http://localhost:8084/swagger/index.html

---

## 🚨 Common Issues & Solutions

### Issue: Port Already in Use

**Error**: `port is already allocated`

**Solution**:
```bash
# Windows - Find and kill process
netstat -ano | findstr :8080
taskkill /PID <process_id> /F

# Or change port in docker-compose.yml
```

### Issue: Services Won't Start

**Solution**:
```bash
# Check logs
docker.bat logs

# Rebuild from scratch
docker.bat stop
docker.bat clean
docker.bat build
docker.bat start
```

### Issue: Out of Memory

**Solution**:
- Open Docker Desktop → Settings → Resources
- Increase Memory to at least 8GB
- Restart Docker Desktop

### Issue: Database Connection Failed

**Solution**:
```bash
# Wait for MySQL to be ready (30-60 seconds)
docker.bat logs mysql

# Verify MySQL is running
docker exec -it gotogether-mysql mysql -uroot -proot123
```

---

## 📊 System Requirements

### Minimum
- Docker Desktop 4.0+
- 8GB RAM
- 20GB disk space
- 4 CPU cores

### Recommended
- Docker Desktop 4.20+
- 16GB RAM
- 50GB SSD
- 8 CPU cores

---

## 🔐 Security Notes

✅ All containers run as **non-root users**  
✅ **Alpine Linux** base images for minimal attack surface  
✅ **Health checks** on all services  
✅ **No secrets** in Docker images (use environment variables)  
✅ **Security headers** configured in Nginx  

---

## 📈 Monitoring

### View Real-Time Logs

```bash
# All services
docker.bat logs

# Specific service
docker.bat logs user-service

# Follow logs (Ctrl+C to exit)
docker-compose logs -f user-service
```

### Resource Usage

```bash
# Real-time stats
docker stats

# Specific service
docker stats gotogether-user-service
```

---

## 🚀 Production Deployment

### 1. Update Environment

Edit `.env` with production credentials:
```env
MYSQL_ROOT_PASSWORD=strong_production_password
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
SENDGRID_API_KEY=your_sendgrid_key
```

### 2. Deploy

```bash
docker.bat deploy
```

This uses `docker-compose.prod.yml` with:
- Resource limits
- Production JVM settings
- Restart policies

---

## 🎓 Next Steps

1. ✅ **Build**: `docker.bat build`
2. ✅ **Start**: `docker.bat start`
3. 🔍 **Verify**: Check http://localhost
4. 📝 **Configure**: Update `.env` for AWS, SendGrid, Twilio
5. 🧪 **Test**: Use Swagger UI to test APIs
6. 📚 **Read**: Check `DOCKER_README.md` for advanced topics

---

## 📞 Support Resources

- **Detailed Guide**: See `DOCKER_README.md`
- **Logs**: Run `docker.bat logs`
- **Health Status**: Run `docker.bat health`
- **Docker Docs**: https://docs.docker.com

---

## 🎉 Summary

You now have a **production-ready Docker setup** for your entire GoTogether platform!

**What's Included:**
- ✅ Multi-stage Dockerfiles for optimal image size
- ✅ Security hardening (non-root users, Alpine Linux)
- ✅ Health checks for all services
- ✅ Docker Compose orchestration
- ✅ Production configuration
- ✅ Management scripts (Windows & Linux)
- ✅ Complete documentation

**Ready to use with a single command:**
```bash
docker.bat build && docker.bat start
```

Happy containerizing! 🐳
