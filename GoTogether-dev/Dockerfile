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

# Expose the application port
EXPOSE 8080

# Set environment variables for application configuration
ENV SPRING_DATASOURCE_URL=jdbc:mysql://mysql-service:3306/gotogether_users_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
ENV SPRING_DATASOURCE_USERNAME=root
ENV SPRING_DATASOURCE_PASSWORD=root123
ENV SPRING_JPA_HIBERNATE_DDL_AUTO=update
ENV EUREKA_CLIENT_SERVICE_URL_DEFAULT_ZONE=http://eureka-server:8761/eureka/

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
