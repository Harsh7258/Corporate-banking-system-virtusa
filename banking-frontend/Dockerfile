# Multi-stage build for Angular Frontend Application
# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Angular application for production
RUN npm run build -- --configuration production

# Debug: Show what was built
RUN echo "=== Build Output ===" && \
    ls -laR dist/

# Stage 2: Runtime stage with Nginx
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from build stage
# Angular 18 with application builder outputs to dist/banking-frontend/browser
COPY --from=build /app/dist/banking-frontend/browser /usr/share/nginx/html

# Ensure favicon PNGs are properly placed in assets
RUN echo "=== Checking for favicon files ===" && \
    if [ -f /usr/share/nginx/html/assets/favicon-32x32.png ]; then \
      echo "favicon-32x32.png found"; \
    else \
      echo "favicon-32x32.png not found"; \
    fi && \
    if [ -f /usr/share/nginx/html/assets/favicon-16x16.png ]; then \
      echo "favicon-16x16.png found"; \
    else \
      echo "favicon-16x16.png not found"; \
    fi

# Verify files were copied
RUN echo "=== Nginx HTML Directory ===" && \
    ls -la /usr/share/nginx/html/ && \
    echo "=== Assets Directory ===" && \
    ls -la /usr/share/nginx/html/assets/ && \
    echo "=== Checking index.html ===" && \
    test -f /usr/share/nginx/html/index.html && echo "index.html found" || echo "index.html NOT found"

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]