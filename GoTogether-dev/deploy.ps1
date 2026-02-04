#!/usr/bin/env pwsh
# GoTogether Docker Deployment Script for Windows

param(
    [string]$Command = "start",
    [string]$Service = ""
)

$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$DockerComposeFile = Join-Path $ScriptPath "docker-compose.yml"

function Show-Menu {
    Write-Host "`n======== GoTogether Docker Management ========`n" -ForegroundColor Cyan
    Write-Host "Usage: .\deploy.ps1 <command> [service]" -ForegroundColor Yellow
    Write-Host "`nCommands:" -ForegroundColor Green
    Write-Host "  start              - Start all services"
    Write-Host "  stop               - Stop all services"
    Write-Host "  restart            - Restart all services"
    Write-Host "  logs               - Show all logs"
    Write-Host "  ps                 - Show running services"
    Write-Host "  build              - Build all images"
    Write-Host "  clean              - Remove all containers and volumes"
    Write-Host "  status             - Check service status"
    Write-Host "  shell <service>    - Open bash in service container"
    Write-Host "`nExamples:" -ForegroundColor Green
    Write-Host "  .\deploy.ps1 start"
    Write-Host "  .\deploy.ps1 logs gotogether-user-service"
    Write-Host "  .\deploy.ps1 shell gotogether-user-service"
    Write-Host "  .\deploy.ps1 stop`n"
}

function Verify-Docker {
    try {
        $null = docker --version
        $null = docker-compose --version
        Write-Host "✓ Docker and Docker Compose found" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Docker or Docker Compose not found" -ForegroundColor Red
        Write-Host "Please install Docker Desktop for Windows" -ForegroundColor Yellow
        exit 1
    }
}

function Start-Services {
    Write-Host "Starting all services..." -ForegroundColor Cyan
    docker-compose -f $DockerComposeFile up -d
    Write-Host "Waiting for services to be healthy..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Show-Status
}

function Stop-Services {
    Write-Host "Stopping all services..." -ForegroundColor Cyan
    docker-compose -f $DockerComposeFile stop
    Write-Host "All services stopped successfully" -ForegroundColor Green
}

function Restart-Services {
    Write-Host "Restarting all services..." -ForegroundColor Cyan
    docker-compose -f $DockerComposeFile restart
    Write-Host "Services restarted successfully" -ForegroundColor Green
}

function Show-Logs {
    if ($Service) {
        Write-Host "Showing logs for $Service..." -ForegroundColor Cyan
        docker-compose -f $DockerComposeFile logs -f $Service
    }
    else {
        Write-Host "Showing logs for all services..." -ForegroundColor Cyan
        docker-compose -f $DockerComposeFile logs -f
    }
}

function Show-Status {
    Write-Host "`n======== Service Status ========`n" -ForegroundColor Cyan
    docker-compose -f $DockerComposeFile ps
    Write-Host "`n======== Available URLs ========`n" -ForegroundColor Green
    Write-Host "User Service          http://localhost:8080/swagger-ui.html"
    Write-Host "Ride Service          http://localhost:8081/swagger-ui.html"
    Write-Host "Restaurant Service    http://localhost:8082/actuator/health"
    Write-Host "Healthcare Gateway    http://localhost:9090/actuator/health"
    Write-Host "TrueMe Gateway        http://localhost:9091/actuator/health"
    Write-Host "Eureka Dashboard      http://localhost:8761`n"
}

function Build-Services {
    Write-Host "Building all services..." -ForegroundColor Cyan
    docker-compose -f $DockerComposeFile build --no-cache
    Write-Host "Build completed successfully" -ForegroundColor Green
}

function Clean-Services {
    $Confirm = Read-Host "This will remove all containers and volumes. Continue? (y/n)"
    if ($Confirm -eq 'y') {
        Write-Host "Cleaning up..." -ForegroundColor Cyan
        docker-compose -f $DockerComposeFile down -v
        Write-Host "Cleanup completed successfully" -ForegroundColor Green
    }
    else {
        Write-Host "Cleanup cancelled" -ForegroundColor Yellow
    }
}

function Open-Shell {
    if (-not $Service) {
        Write-Host "Please specify a service name" -ForegroundColor Red
        Write-Host "Example: .\deploy.ps1 shell gotogether-user-service" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "Opening shell for $Service..." -ForegroundColor Cyan
    docker-compose -f $DockerComposeFile exec $Service bash
}

# Main script logic
Verify-Docker

switch ($Command) {
    "start" {
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "logs" {
        Show-Logs
    }
    "ps" {
        docker-compose -f $DockerComposeFile ps
    }
    "build" {
        Build-Services
    }
    "clean" {
        Clean-Services
    }
    "status" {
        Show-Status
    }
    "shell" {
        Open-Shell
    }
    "help" {
        Show-Menu
    }
    default {
        Show-Menu
        Write-Host "Invalid command: $Command" -ForegroundColor Red
        exit 1
    }
}
