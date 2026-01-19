# Optimized Dockerfile for Angular Frontend
# Jenkins will build the app, Docker will just serve it with Nginx

FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# CRITICAL: Copy pre-built Angular app from Jenkins workspace
# Jenkins builds it, Docker just serves it (no double build)
COPY dist/banking-frontend/browser /usr/share/nginx/html

# Verify files were copied
RUN echo "=== Nginx HTML Directory ===" && \
    ls -la /usr/share/nginx/html/ && \
    echo "=== Checking index.html ===" && \
    test -f /usr/share/nginx/html/index.html && echo "✓ index.html found" || echo "✗ index.html NOT found"

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]