# Docker Commands Reference Card

## 🚀 Quick Start

```bash
# Windows PowerShell
.\deploy.ps1 start

# Mac/Linux
./deploy.sh start

# Or direct Docker Compose
docker-compose up -d
```

---

## 📊 Service Management

### View Status
```bash
docker-compose ps                          # All services
docker-compose ps gotogether-user-service  # Specific service
```

### Start/Stop Services
```bash
docker-compose up -d                       # Start all
docker-compose down                        # Stop all
docker-compose stop                        # Stop (keep data)
docker-compose start                       # Start again
docker-compose restart                     # Restart all
docker-compose restart <service>           # Restart specific
```

### Build Services
```bash
docker-compose build                       # Build all
docker-compose build --no-cache            # Clean build
docker-compose build <service>             # Build specific
docker-compose up -d --build               # Build and start
```

---

## 📋 Logs and Debugging

### View Logs
```bash
docker-compose logs                        # All services
docker-compose logs -f                     # Follow all logs
docker-compose logs --tail=50              # Last 50 lines
docker-compose logs <service>              # Specific service
docker-compose logs -f <service>           # Follow specific
docker-compose logs --timestamps           # With timestamps
```

### Error Detection
```bash
docker-compose logs | grep ERROR           # Find errors
docker-compose logs <service> | grep -i warning  # Find warnings
```

---

## 💾 Database Access

### MySQL Databases
```bash
# Users Database
docker-compose exec mysql-users mysql -u root -proot123 gotogether_users_db

# Rides Database
docker-compose exec mysql-rides mysql -u root -proot123 gotogether_rides_db

# Restaurants Database
docker-compose exec mysql-restaurants mysql -u root -p restaurants
# Password: root
```

### MySQL Commands (once connected)
```sql
SHOW DATABASES;                            # List databases
USE gotogether_users_db;                   # Select database
SHOW TABLES;                               # List tables
DESC users;                                # Table structure
SELECT * FROM users LIMIT 5;               # View data
SELECT COUNT(*) FROM users;                # Count rows
```

### Redis Access
```bash
docker-compose exec redis-service redis-cli

# Redis commands (in redis-cli)
PING                                       # Test connection
KEYS *                                     # List all keys
GET key_name                               # Get value
SET key_name value                         # Set value
DEL key_name                               # Delete key
FLUSHDB                                    # Clear all data
INFO                                       # Server info
```

---

## 🔧 Container Operations

### Access Container Shell
```bash
docker-compose exec <service> bash         # Open bash
docker-compose exec <service> sh           # Open sh
exit                                       # Exit shell
```

### Execute Commands in Container
```bash
# In bash shell
docker-compose exec <service> /bin/bash

# Single command
docker-compose exec <service> java -version
docker-compose exec mysql-users mysqldump -u root -proot123 --all-databases
```

### Container Details
```bash
docker-compose logs <service>              # View logs
docker stats                               # Resource usage
docker inspect <container-name>            # Container details
```

---

## 📦 Backup and Restore

### Backup MySQL
```bash
# All databases
docker-compose exec mysql-users mysqldump -u root -proot123 --all-databases > backup.sql

# Specific database
docker-compose exec mysql-users mysqldump -u root -proot123 gotogether_users_db > users_backup.sql

# Specific table
docker-compose exec mysql-users mysqldump -u root -proot123 gotogether_users_db users > users_table.sql
```

### Restore MySQL
```bash
# From backup
docker-compose exec -T mysql-users mysql -u root -proot123 < backup.sql

# Specific database
docker-compose exec -T mysql-users mysql -u root -proot123 gotogether_users_db < users_backup.sql
```

### Backup Volumes
```bash
# Backup MySQL volume
docker run --rm -v gotogether_mysql-users-data:/data -v $(pwd):/backup ubuntu tar cvf /backup/mysql-backup.tar /data

# Backup Redis volume
docker run --rm -v gotogether_redis-data:/data -v $(pwd):/backup ubuntu tar cvf /backup/redis-backup.tar /data
```

---

## 🧹 Cleanup and Maintenance

### Stop and Remove
```bash
docker-compose down                        # Stop and remove containers
docker-compose down -v                     # Also remove volumes (DATA LOSS!)
docker-compose rm -f                       # Force remove containers
```

### Clean Docker System
```bash
docker system prune                        # Remove unused items
docker system prune -a                     # Remove all unused
docker system prune --volumes              # Also remove volumes
docker system df                           # Show disk usage
docker volume prune                        # Remove unused volumes
docker image prune                         # Remove unused images
docker container prune                     # Remove stopped containers
```

### Remove Specific Items
```bash
docker rmi <image-name>                    # Remove image
docker volume rm <volume-name>             # Remove volume
docker network rm <network-name>           # Remove network
```

---

## 🔍 Troubleshooting Commands

### Check System Status
```bash
docker version                             # Docker version
docker info                                # Docker info
docker stats                               # Resource usage
docker system df                           # Disk usage
```

### Network Diagnostics
```bash
docker network ls                          # List networks
docker network inspect gotogether-network  # Network details
docker-compose exec <service> ping <other-service>  # Test connectivity
```

### Port/Process Issues
```bash
# Windows
netstat -ano | findstr :8080               # Check port usage
wmic process get processid,name | find "PID"  # Find process

# Mac/Linux
lsof -i :8080                              # Check port
ps aux | grep docker                       # Docker processes
```

### Service Health
```bash
curl http://localhost:8080/actuator/health           # User Service
curl http://localhost:8081/actuator/health           # Ride Service
curl http://localhost:8082/actuator/health           # Restaurant Service
curl http://localhost:9090/actuator/health           # Gateway 1
curl http://localhost:9091/actuator/health           # Gateway 2
curl http://localhost:8761/eureka/apps               # Eureka Apps
```

---

## 📡 Service URLs

```
User Service       http://localhost:8080
User Swagger       http://localhost:8080/swagger-ui.html
Ride Service       http://localhost:8081
Ride Swagger       http://localhost:8081/swagger-ui.html
Restaurant Service http://localhost:8082
Gateway 1          http://localhost:9090
Gateway 2          http://localhost:9091
Eureka Dashboard   http://localhost:8761
Redis              localhost:6379
MySQL Users        localhost:3306
MySQL Rides        localhost:3307
MySQL Restaurants  localhost:3308
```

---

## 🔐 Database Credentials

```
MySQL Root User:     root
MySQL Users Pass:    root123
MySQL Rest Pass:     root

Redis:               No password (default)
Eureka:              No authentication
```

---

## ⚙️ Environment Variables

### Key Variables in docker-compose.yml
```yaml
SPRING_DATASOURCE_URL                  # Database URL
SPRING_DATASOURCE_USERNAME              # DB user
SPRING_DATASOURCE_PASSWORD              # DB password
EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE  # Eureka server
JWT_SECRET                              # JWT signing key
SERVER_PORT                             # Service port
JAVA_OPTS                               # JVM options
```

---

## 📝 Common Docker Compose Commands

```bash
docker-compose up                      # Start services (foreground)
docker-compose up -d                   # Start services (background)
docker-compose down                    # Stop and remove
docker-compose ps                      # Show status
docker-compose logs                    # View logs
docker-compose build                   # Build images
docker-compose exec <svc> bash         # Container shell
docker-compose restart <svc>           # Restart service
docker-compose scale <svc>=3           # Scale service
```

---

## 🚨 Emergency Commands

### If Services Won't Start
```bash
# Check what's wrong
docker-compose logs

# Rebuild everything
docker-compose down -v
docker-compose up -d --build

# Verify status
docker-compose ps
```

### If Ports are in Use
```bash
# Find the process
netstat -ano | findstr :8080

# Kill the process (Windows)
taskkill /PID <PID> /F

# Or change the port in docker-compose.yml
# Then restart
docker-compose restart
```

### If Out of Disk Space
```bash
docker system prune -a
docker volume prune
docker image prune --all
```

### Complete Reset (WARNING: Loses all data)
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

---

## 📊 Service Port Reference

| Service | Port | Type |
|---------|------|------|
| User Service | 8080 | REST |
| Ride Service | 8081 | REST |
| Restaurant | 8082 | REST |
| Gateway 1 | 9090 | Gateway |
| Gateway 2 | 9091 | Gateway |
| Eureka | 8761 | Dashboard |
| MySQL Users | 3306 | Database |
| MySQL Rides | 3307 | Database |
| MySQL Rest | 3308 | Database |
| Redis | 6379 | Cache |

---

## 💡 Tips and Tricks

### Monitor All Logs in Real-Time
```bash
docker-compose logs -f --timestamps
```

### Check Service Dependencies
```bash
docker-compose ps
# Look for "depends_on" in logs
```

### Find Container IP Address
```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' <container-name>
```

### Copy Files from Container
```bash
docker-compose cp <service>:/path/to/file ./local/path
```

### View Container Environment
```bash
docker-compose exec <service> env
```

### Restart Only Database Services
```bash
docker-compose restart mysql-users mysql-rides mysql-restaurants
```

---

## 🎯 Common Workflows

### Full Deployment
```bash
docker-compose down -v                 # Clean slate
docker-compose build --no-cache        # Fresh build
docker-compose up -d                   # Start all
docker-compose ps                      # Verify
```

### Update Single Service
```bash
docker-compose build <service>         # Rebuild
docker-compose up -d <service>         # Restart
docker-compose logs -f <service>       # Watch logs
```

### Check System Health
```bash
docker-compose ps                      # Service status
docker system df                       # Disk usage
docker stats                           # Resource usage
curl http://localhost:8761/eureka/apps # Eureka apps
```

---

**Quick Reference Version:** 1.0.0  
**Last Updated:** February 2026  
**Print this page for quick reference!**
