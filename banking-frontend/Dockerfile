# Optimized Dockerfile - Jenkins builds app, Docker serves it
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy pre-built Angular app from Jenkins workspace
COPY dist/banking-frontend/browser /usr/share/nginx/html

# Verify files
RUN echo "=== Nginx HTML Directory ===" && \
    ls -la /usr/share/nginx/html/ && \
    test -f /usr/share/nginx/html/index.html && echo "✓ index.html found" || echo "✗ index.html NOT found"

# Expose ports
EXPOSE 80 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]