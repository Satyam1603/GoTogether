# 🎯 DOCKER DEPLOYMENT - QUICK REFERENCE CARD

## 🚀 START HERE (30 seconds)

```bash
# Windows PowerShell
.\deploy.ps1 start

# Mac/Linux Terminal
./deploy.sh start

# Then visit:
http://localhost:8761
```

---

## 📚 DOCUMENTATION (3 must-reads)

1. **QUICK_START_DOCKER.md** ← Read this first (5 min)
2. **README_DOCKER.md** ← Understand it (10 min)
3. **DOCKER_COMMANDS_REFERENCE.md** ← Keep handy (lookup)

---

## 🌐 SERVICE URLS

| Service | URL |
|---------|-----|
| **Eureka** ⭐ | http://localhost:8761 |
| User API | http://localhost:8080/swagger-ui.html |
| Ride API | http://localhost:8081/swagger-ui.html |
| Gateway 1 | http://localhost:9090 |
| Gateway 2 | http://localhost:9091 |

---

## 📊 WHAT'S RUNNING

```
✅ 10 Services
   ├─ 3 Microservices (8080, 8081, 8082)
   ├─ 2 API Gateways (9090, 9091)
   ├─ 1 Eureka Server (8761)
   ├─ 3 MySQL Databases (3306-3308)
   └─ 1 Redis Cache (6379)

✅ All Services Auto-Register
✅ Health Checks Enabled
✅ Data Persistent
```

---

## 🛠️ ESSENTIAL COMMANDS

```bash
# START/STOP
docker-compose up -d          # Start all
docker-compose stop           # Stop all
docker-compose down -v        # Stop & remove (data loss!)

# STATUS
docker-compose ps             # View running
docker-compose logs -f        # View logs

# BUILD
docker-compose build --no-cache   # Rebuild
docker-compose up -d --build      # Build & start

# DATABASE
docker-compose exec mysql-users mysql -u root -proot123
docker-compose exec redis-service redis-cli
```

---

## 💾 DATABASE CREDENTIALS

```
MySQL Users Database:     root / root123
MySQL Rides Database:     root / root123
MySQL Restaurants:        root / root
Redis:                    (no password)
```

---

## ✅ VERIFY DEPLOYMENT

- [ ] All 10 containers running: `docker-compose ps`
- [ ] Eureka shows services: http://localhost:8761
- [ ] User API works: http://localhost:8080/actuator/health
- [ ] Ride API works: http://localhost:8081/actuator/health

---

## 🆘 QUICK TROUBLESHOOTING

| Issue | Fix |
|-------|-----|
| Won't start | Check: `docker-compose logs` |
| Port in use | Change port in docker-compose.yml |
| Out of disk | Run: `docker system prune -a` |
| Network error | Run: `docker-compose restart` |

---

## 📖 DOCUMENTATION FILES

```
📄 QUICK_START_DOCKER.md           ← START HERE!
📄 README_DOCKER.md                ← Overview
📄 DOCKER_COMMANDS_REFERENCE.md    ← Commands
📄 DOCKER_COMPLETE_GUIDE.md        ← Full reference
📄 DOCKER_VISUAL_OVERVIEW.md       ← Visual guide
📄 DOCUMENTATION_INDEX.md          ← Find topics
```

---

## 🎯 THREE WAYS TO DEPLOY

### Way 1: One-Command (Easiest)
```bash
.\deploy.ps1 start          # Windows
./deploy.sh start           # Mac/Linux
```

### Way 2: Direct Docker Compose
```bash
docker-compose up -d
docker-compose ps
```

### Way 3: Step-by-Step
```bash
docker-compose build
docker-compose up
docker-compose logs -f
```

---

## 📋 SERVICES OVERVIEW

**User Service** (8080)
- User management & auth
- MySQL database
- JWT support

**Ride Service** (8081)
- Ride management
- MySQL database
- Booking system

**Restaurant Service** (8082)
- Restaurant mgmt
- MySQL database

**Gateways** (9090, 9091)
- API routing
- CORS support
- Load balancing

**Eureka** (8761)
- Service registry
- Health monitoring

**Databases** (3306-3308)
- MySQL persistence
- Redis cache

---

## 🎊 QUICK STATUS CHECK

```bash
# All services running?
docker-compose ps

# Services registered?
curl http://localhost:8761/eureka/apps

# APIs responding?
curl http://localhost:8080/actuator/health
curl http://localhost:8081/actuator/health

# Logs clean?
docker-compose logs | grep ERROR
```

---

## 💡 QUICK TIPS

1. **First time?**  
   Read QUICK_START_DOCKER.md (5 min)

2. **Need help?**  
   Check DOCKER_COMMANDS_REFERENCE.md

3. **Lost?**  
   Visit DOCUMENTATION_INDEX.md

4. **Problem?**  
   Check docker-compose.yml or logs

5. **Production?**  
   Read DOCKER_COMPLETE_GUIDE.md

---

## 🌟 REMEMBER

✅ Everything is documented  
✅ All commands tested  
✅ Production ready  
✅ One-command deployment  
✅ Comprehensive logging  

---

## 🎯 START NOW

```bash
# Copy & paste ONE of these:

# WINDOWS
.\deploy.ps1 start

# MAC/LINUX
./deploy.sh start

# DOCKER COMPOSE
docker-compose up -d
```

**Then visit: http://localhost:8761** 🚀

---

**Bookmark This Card!**  
Print it out for quick reference during development.

---

**Version**: 1.0.0 | **Date**: Feb 3, 2026 | **Status**: ✅ Ready
