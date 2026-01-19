# Optimized Dockerfile - Jenkins builds JAR, Docker packages it
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create logs directory
RUN mkdir -p /app/logs

# Copy pre-built JAR from Jenkins workspace (built in previous stage)
COPY target/*.jar app.jar

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