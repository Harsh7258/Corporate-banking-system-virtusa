# Optimized Dockerfile for Spring Boot Backend
# Jenkins will build the JAR, Docker will just package it

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for healthcheck (alpine version)
RUN apk add --no-cache curl

# Create logs directory
RUN mkdir -p /app/logs

# CRITICAL: Copy pre-built JAR from Jenkins workspace
# Jenkins builds it, Docker just packages it (no double build)
COPY target/*.jar app.jar

# Expose port
EXPOSE 8888

# Health check
HEALTHCHECK --interval=45s --timeout=15s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:8888/actuator/health || exit 1

# Run with optimized JVM settings for low memory
ENTRYPOINT ["java", \
    "-Xmx384m", \
    "-Xms256m", \
    "-XX:MaxMetaspaceSize=128m", \
    "-XX:+UseG1GC", \
    "-XX:MaxGCPauseMillis=200", \
    "-jar", \
    "app.jar"]