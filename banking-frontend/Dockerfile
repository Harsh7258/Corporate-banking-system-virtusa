# Multi-stage build - Stage 1 just copies existing dist
FROM busybox:latest AS distcopy

WORKDIR /build

# Copy the dist folder that Jenkins already built
COPY dist/banking-frontend/browser ./html

# Stage 2 - Runtime with Nginx
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy pre-built Angular app from previous stage
COPY --from=distcopy /build/html /usr/share/nginx/html

# Verify files
RUN echo "=== Nginx HTML Directory ===" && \
    ls -la /usr/share/nginx/html/ && \
    test -f /usr/share/nginx/html/index.html && echo "✓ index.html found" || echo "✗ index.html NOT found"

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]