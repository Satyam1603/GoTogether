#!/bin/bash

# GoTogether Docker Deployment Script for Mac/Linux

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Show menu
show_menu() {
    echo -e "\n${CYAN}======== GoTogether Docker Management ========${NC}\n"
    echo -e "${YELLOW}Usage: ./deploy.sh <command> [service]${NC}"
    echo -e "\n${GREEN}Commands:${NC}"
    echo "  start              - Start all services"
    echo "  stop               - Stop all services"
    echo "  restart            - Restart all services"
    echo "  logs               - Show all logs"
    echo "  ps                 - Show running services"
    echo "  build              - Build all images"
    echo "  clean              - Remove all containers and volumes"
    echo "  status             - Check service status"
    echo "  shell <service>    - Open bash in service container"
    echo "  help               - Show this help menu"
    echo -e "\n${GREEN}Examples:${NC}"
    echo "  ./deploy.sh start"
    echo "  ./deploy.sh logs gotogether-user-service"
    echo "  ./deploy.sh shell gotogether-user-service"
    echo "  ./deploy.sh stop\n"
}

# Verify Docker installation
verify_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}✗ Docker not found${NC}"
        echo -e "${YELLOW}Please install Docker Desktop${NC}"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}✗ Docker Compose not found${NC}"
        echo -e "${YELLOW}Please install Docker Compose${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Docker and Docker Compose found${NC}"
}

# Start services
start_services() {
    echo -e "${CYAN}Starting all services...${NC}"
    docker-compose -f "$COMPOSE_FILE" up -d
    echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
    sleep 5
    show_status
}

# Stop services
stop_services() {
    echo -e "${CYAN}Stopping all services...${NC}"
    docker-compose -f "$COMPOSE_FILE" stop
    echo -e "${GREEN}All services stopped successfully${NC}"
}

# Restart services
restart_services() {
    echo -e "${CYAN}Restarting all services...${NC}"
    docker-compose -f "$COMPOSE_FILE" restart
    echo -e "${GREEN}Services restarted successfully${NC}"
}

# Show logs
show_logs() {
    if [ -n "$SERVICE" ]; then
        echo -e "${CYAN}Showing logs for $SERVICE...${NC}"
        docker-compose -f "$COMPOSE_FILE" logs -f "$SERVICE"
    else
        echo -e "${CYAN}Showing logs for all services...${NC}"
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

# Show status
show_status() {
    echo -e "\n${CYAN}======== Service Status ========${NC}\n"
    docker-compose -f "$COMPOSE_FILE" ps
    echo -e "\n${GREEN}======== Available URLs ========${NC}\n"
    echo "User Service          http://localhost:8080/swagger-ui.html"
    echo "Ride Service          http://localhost:8081/swagger-ui.html"
    echo "Restaurant Service    http://localhost:8082/actuator/health"
    echo "Healthcare Gateway    http://localhost:9090/actuator/health"
    echo "TrueMe Gateway        http://localhost:9091/actuator/health"
    echo "Eureka Dashboard      http://localhost:8761"
    echo ""
}

# Build services
build_services() {
    echo -e "${CYAN}Building all services...${NC}"
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    echo -e "${GREEN}Build completed successfully${NC}"
}

# Clean services
clean_services() {
    read -p "This will remove all containers and volumes. Continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}Cleaning up...${NC}"
        docker-compose -f "$COMPOSE_FILE" down -v
        echo -e "${GREEN}Cleanup completed successfully${NC}"
    else
        echo -e "${YELLOW}Cleanup cancelled${NC}"
    fi
}

# Open shell
open_shell() {
    if [ -z "$SERVICE" ]; then
        echo -e "${RED}Please specify a service name${NC}"
        echo -e "${YELLOW}Example: ./deploy.sh shell gotogether-user-service${NC}"
        exit 1
    fi
    echo -e "${CYAN}Opening shell for $SERVICE...${NC}"
    docker-compose -f "$COMPOSE_FILE" exec "$SERVICE" bash
}

# Main script logic
COMMAND=$1
SERVICE=$2

verify_docker

case $COMMAND in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    ps)
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    build)
        build_services
        ;;
    clean)
        clean_services
        ;;
    status)
        show_status
        ;;
    shell)
        open_shell
        ;;
    help)
        show_menu
        ;;
    *)
        show_menu
        if [ -n "$COMMAND" ]; then
            echo -e "${RED}Invalid command: $COMMAND${NC}"
            exit 1
        fi
        ;;
esac
