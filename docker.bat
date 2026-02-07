@echo off
REM GoTogether Docker Build and Deployment Script for Windows

setlocal enabledelayedexpansion

REM Check if Docker is installed
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

if "%1"=="" goto usage
if "%1"=="build" goto build
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="health" goto health
if "%1"=="clean" goto clean
if "%1"=="deploy" goto deploy
goto usage

:build
echo [INFO] Building services...
if "%2"=="" (
    docker-compose build --parallel
) else (
    docker-compose build %2
)
echo [INFO] Build completed!
goto end

:start
echo [INFO] Starting services...
if "%2"=="" (
    docker-compose up -d
    echo [INFO] All services started!
    echo [INFO] Frontend: http://localhost
    echo [INFO] API Gateway: http://localhost:8080
) else (
    docker-compose up -d %2
    echo [INFO] %2 started!
)
goto end

:stop
echo [INFO] Stopping all services...
docker-compose down
echo [INFO] All services stopped!
goto end

:restart
echo [INFO] Restarting all services...
docker-compose down
docker-compose up -d
echo [INFO] All services restarted!
goto end

:logs
if "%2"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %2
)
goto end

:health
echo [INFO] Checking service health...
docker-compose ps
goto end

:clean
set /p confirm="This will remove all containers, volumes, and images. Are you sure? (y/n): "
if /i "%confirm%"=="y" (
    echo [INFO] Cleaning up...
    docker-compose down -v --rmi all
    echo [INFO] Cleanup completed!
) else (
    echo [INFO] Cleanup cancelled
)
goto end

:deploy
echo [INFO] Deploying to production...
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
echo [INFO] Production deployment completed!
goto end

:usage
echo Usage: %0 {build^|start^|stop^|restart^|logs^|health^|clean^|deploy} [service]
echo.
echo Commands:
echo   build [service]   - Build all services or specific service
echo   start [service]   - Start all services or specific service
echo   stop              - Stop all services
echo   restart           - Restart all services
echo   logs [service]    - Show logs for all services or specific service
echo   health            - Check health of all services
echo   clean             - Remove all containers, volumes, and images
echo   deploy            - Deploy to production environment
echo.
echo Services:
echo   - user-service
echo   - booking-service
echo   - ride-service
echo   - vehicle-service
echo   - api-gateway
echo   - frontend
echo.
echo Examples:
echo   %0 build                    # Build all services
echo   %0 build user-service       # Build only user service
echo   %0 start                    # Start all services
echo   %0 logs user-service        # Show logs for user service
echo   %0 deploy                   # Deploy to production
goto end

:end
endlocal
