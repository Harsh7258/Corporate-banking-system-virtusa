# Multi-stage build - Stage 1 just copies existing JAR
FROM busybox:latest AS jarcopy

WORKDIR /build

# Copy the JAR that Jenkins already built
COPY target/*.jar app.jar

# Stage 2 - Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create logs directory
RUN mkdir -p /app/logs

# Copy JAR from previous stage
COPY --from=jarcopy /build/app.jar app.jar

# Expose port
EXPOSE 8888

# Health check
HEALTHCHECK --interval=45s --timeout=15s --start-period=120s --retries=3 \
  CMD curl -f http://localhost:8888/actuator/health || exit 1

# Run with optimized JVM settings for t2.micro
ENTRYPOINT ["java", \
    "-Xmx384m", \
    "-Xms256m", \
    "-XX:MaxMetaspaceSize=128m", \
    "-XX:+UseG1GC", \
    "-XX:MaxGCPauseMillis=200", \
    "-jar", \
    "app.jar"]