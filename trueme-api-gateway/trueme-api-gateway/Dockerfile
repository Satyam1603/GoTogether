# Stage 1: Build stage
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:resolve

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the JAR file from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose the gateway port
EXPOSE 9090

# Set environment variables
ENV SERVER_PORT=9090
ENV SPRING_CLOUD_GATEWAY_DISCOVERY_LOCATOR_ENABLED=false

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
