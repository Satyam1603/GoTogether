# Multi-stage build for Vehicle Service (.NET 8.0)
# Stage 1: Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build

WORKDIR /app

# Copy csproj and restore dependencies
COPY VehicleService/*.csproj ./VehicleService/
WORKDIR /app/VehicleService
RUN dotnet restore

# Copy everything else and build
WORKDIR /app
COPY VehicleService/. ./VehicleService/
WORKDIR /app/VehicleService
RUN dotnet publish -c Release -o /app/publish

# Stage 2: Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine

WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

# Copy published app from build stage
COPY --from=build /app/publish .

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 8084

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8084/health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "VehicleService.dll"]
