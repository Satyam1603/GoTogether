#!/bin/bash

# GoTogether Docker Build and Deployment Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_info "Docker version: $(docker --version)"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_info "Docker Compose version: $(docker-compose --version)"
}

# Create .env file if it doesn't exist
setup_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please update .env file with your configuration before proceeding."
        exit 1
    fi
    print_info ".env file found"
}

# Build all services
build_all() {
    print_info "Building all services..."
    docker-compose build --parallel
    print_info "Build completed successfully!"
}

# Build specific service
build_service() {
    local service=$1
    print_info "Building $service..."
    docker-compose build "$service"
    print_info "$service build completed!"
}

# Start all services
start_all() {
    print_info "Starting all services..."
    docker-compose up -d
    print_info "All services started!"
    print_info "Frontend: http://localhost"
    print_info "API Gateway: http://localhost:8080"
}

# Start specific service
start_service() {
    local service=$1
    print_info "Starting $service..."
    docker-compose up -d "$service"
    print_info "$service started!"
}

# Stop all services
stop_all() {
    print_info "Stopping all services..."
    docker-compose down
    print_info "All services stopped!"
}

# Show logs
show_logs() {
    local service=$1
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Check service health
check_health() {
    print_info "Checking service health..."
    docker-compose ps
}

# Clean up
cleanup() {
    print_warning "This will remove all containers, volumes, and images. Are you sure? (y/n)"
    read -r response
    if [[ "$response" == "y" || "$response" == "Y" ]]; then
        print_info "Cleaning up..."
        docker-compose down -v --rmi all
        print_info "Cleanup completed!"
    else
        print_info "Cleanup cancelled"
    fi
}

# Production deployment
deploy_prod() {
    print_info "Deploying to production..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
    print_info "Production deployment completed!"
}

# Main script
main() {
    check_docker
    check_docker_compose
    
    case "$1" in
        build)
            setup_env
            if [ -z "$2" ]; then
                build_all
            else
                build_service "$2"
            fi
            ;;
        start)
            if [ -z "$2" ]; then
                start_all
            else
                start_service "$2"
            fi
            ;;
        stop)
            stop_all
            ;;
        restart)
            stop_all
            start_all
            ;;
        logs)
            show_logs "$2"
            ;;
        health)
            check_health
            ;;
        clean)
            cleanup
            ;;
        deploy)
            setup_env
            deploy_prod
            ;;
        *)
            echo "Usage: $0 {build|start|stop|restart|logs|health|clean|deploy} [service]"
            echo ""
            echo "Commands:"
            echo "  build [service]   - Build all services or specific service"
            echo "  start [service]   - Start all services or specific service"
            echo "  stop              - Stop all services"
            echo "  restart           - Restart all services"
            echo "  logs [service]    - Show logs for all services or specific service"
            echo "  health            - Check health of all services"
            echo "  clean             - Remove all containers, volumes, and images"
            echo "  deploy            - Deploy to production environment"
            echo ""
            echo "Services:"
            echo "  - user-service"
            echo "  - booking-service"
            echo "  - ride-service"
            echo "  - vehicle-service"
            echo "  - api-gateway"
            echo "  - frontend"
            echo ""
            echo "Examples:"
            echo "  $0 build                    # Build all services"
            echo "  $0 build user-service       # Build only user service"
            echo "  $0 start                    # Start all services"
            echo "  $0 logs user-service        # Show logs for user service"
            echo "  $0 deploy                   # Deploy to production"
            exit 1
            ;;
    esac
}

main "$@"
