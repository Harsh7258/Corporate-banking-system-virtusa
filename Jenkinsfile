pipeline {
    agent any
    
    tools {
        maven 'Maven-3'
        nodejs 'NodeJS-20'
        jdk 'JDK-17'
    }
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        BACKEND_DIR = 'CropBankingSystemBackend'
        FRONTEND_DIR = 'banking-frontend'
        PROJECT_NAME = 'corporate-bank'
        MAVEN_OPTS = '-Xmx512m -XX:MaxMetaspaceSize=256m'
        NODE_OPTIONS = '--max-old-space-size=512'
    }
    
    stages {
        stage('Cleanup Docker Only') {
            steps {
                script {
                    echo '=== Cleaning Docker resources (NOT workspace) ==='
                    
                    sh '''
                        # Stop and remove all containers
                        docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
                        
                        # Remove stopped containers
                        docker container prune -f || true
                        
                        # Remove dangling images only (not all images)
                        docker image prune -f || true
                        
                        echo "=== Docker Disk Usage ==="
                        docker system df
                        
                        echo "=== Disk Space ==="
                        df -h
                    '''
                }
            }
        }
        
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Harsh7258/Corporate-banking-system-virtusa.git'
            }
        }
        
        stage('Backend - Build JAR') {
            steps {
                dir("${BACKEND_DIR}") {
                    script {
                        echo '=== Building Backend JAR with Maven ==='
                        sh 'mvn clean package -DskipTests -T 1C'
                        
                        echo '=== Verifying JAR was created ==='
                        sh '''
                            if [ ! -f target/*.jar ]; then
                                echo "ERROR: JAR file not found!"
                                exit 1
                            fi
                            ls -lh target/*.jar
                        '''
                    }
                }
            }
        }
        
        stage('Frontend - Build Production') {
            steps {
                dir("${FRONTEND_DIR}") {
                    script {
                        echo '=== Installing Frontend Dependencies ==='
                        sh 'npm ci --prefer-offline --no-audit --progress=false'
                        
                        echo '=== Building Frontend for Production ==='
                        sh 'npm run build -- --configuration production'
                        
                        echo '=== Verifying build output ==='
                        sh '''
                            if [ ! -d dist/banking-frontend/browser ]; then
                                echo "ERROR: Build output not found!"
                                exit 1
                            fi
                            ls -lR dist/banking-frontend/browser/
                            
                            if [ ! -f dist/banking-frontend/browser/index.html ]; then
                                echo "ERROR: index.html not found in build!"
                                exit 1
                            fi
                            echo "✓ Frontend build successful"
                        '''
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    echo '=== Building Docker Images (Sequential - Memory Optimized) ==='
                    
                    sh '''
                        echo "Building Backend Docker image..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache backend
                        
                        echo "Cleaning intermediate images..."
                        docker image prune -f
                        
                        echo "Building Frontend Docker image..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache frontend
                        
                        echo "Final cleanup of build cache..."
                        docker image prune -f
                        
                        echo "=== Docker Images Created ==="
                        docker images | grep corporate-bank || echo "No images found with corporate-bank prefix"
                    '''
                }
            }
        }
        
        stage('Deploy Application') {
            steps {
                script {
                    echo '=== Starting Application Services (With --no-deps for reliability) ==='
                    
                    sh '''
                        echo "Starting infrastructure services..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --no-deps mongodb zookeeper
                        sleep 25
                        
                        echo "Checking infrastructure health..."
                        docker ps | grep -E "mongodb|zookeeper"
                        
                        echo "Starting Kafka..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --no-deps kafka
                        sleep 30
                        
                        echo "Checking Kafka status..."
                        docker ps | grep kafka
                        
                        echo "Initializing Kafka topics..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --no-deps kafka-init
                        sleep 20
                        
                        echo "Starting Backend..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --no-deps backend
                        sleep 35
                        
                        echo "Checking Backend status..."
                        docker logs corporate-bank-backend --tail=10
                        
                        echo "Starting Frontend..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --no-deps frontend
                        sleep 15
                        
                        echo "=== All services started ==="
                        docker-compose -f ${DOCKER_COMPOSE_FILE} ps
                        
                        echo "=== Container Status Details ==="
                        docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo '=== Performing Health Checks ==='
                    
                    echo 'Waiting for services to initialize...'
                    sh 'sleep 30'
                    
                    echo 'Checking Backend health...'
                    retry(5) {
                        sleep 15
                        sh '''
                            echo "Attempting backend health check..."
                            curl -f http://localhost:8888/actuator/health || exit 1
                            echo "✓ Backend is healthy"
                        '''
                    }
                    
                    echo 'Checking Frontend availability...'
                    retry(3) {
                        sleep 10
                        sh '''
                            echo "Attempting frontend check..."
                            curl -f http://localhost:4200 || exit 1
                            echo "✓ Frontend is accessible"
                        '''
                    }
                    
                    echo ' All services are healthy and accessible!'
                }
            }
        }
        
        stage('Show Logs') {
            steps {
                script {
                    echo '=== Application Logs (Last 30 lines) ==='
                    sh '''
                        echo "━━━━━━━━━━ Backend Logs ━━━━━━━━━━"
                        docker logs corporate-bank-backend --tail=30 || true
                        
                        echo ""
                        echo "━━━━━━━━━━ Frontend Logs ━━━━━━━━━━"
                        docker logs corporate-bank-frontend --tail=15 || true
                        
                        echo ""
                        echo "━━━━━━━━━━ Kafka Logs ━━━━━━━━━━"
                        docker logs corporate-bank-kafka --tail=10 || true
                    '''
                }
            }
        }
    }
    
    post {
        success {
            script {
                // Get EC2 metadata token
                def TOKEN = sh(
                    script: '''
                    curl -s -X PUT "http://169.254.169.254/latest/api/token" \
                    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"
                    ''',
                    returnStdout: true
                ).trim()

                // Get public IP using token
                def PUBLIC_IP = sh(
                    script: """
                    curl -s -H "X-aws-ec2-metadata-token: ${TOKEN}" \
                    http://169.254.169.254/latest/meta-data/public-ipv4
                    """,
                    returnStdout: true
                ).trim()

                echo 'DEPLOYMENT SUCCESSFUL!'
                echo ''
                echo "Frontend App:  http://${PUBLIC_IP}:4200"
                echo "Backend API:   http://${PUBLIC_IP}:8888"
                echo "Health Check:  http://${PUBLIC_IP}:8888/actuator/health"
                echo ''
                echo 'Services may take 2-3 minutes to fully initialize'
                echo '────────────────────────────────────────────────'
            }
        }
        failure {
            echo '╔════════════════════════════════════════════════╗'
            echo '║         DEPLOYMENT FAILED!                     ║'
            echo '╚════════════════════════════════════════════════╝'
            
            sh '''
                echo "=== Container Status ==="
                docker-compose -f ${DOCKER_COMPOSE_FILE} ps
                
                echo ""
                echo "=== Backend Logs (Last 50 lines) ==="
                docker logs corporate-bank-backend --tail=50 || echo "Backend container not found"
                
                echo ""
                echo "=== Frontend Logs (Last 30 lines) ==="
                docker logs corporate-bank-frontend --tail=30 || echo "Frontend container not found"
                
                echo ""
                echo "=== All Running Containers ==="
                docker ps -a
            '''
        }
        always {
            echo 'Performing final cleanup...'
            sh '''
                # Only remove dangling images, not all
                docker image prune -f || true
                
                # Remove stopped containers
                docker container prune -f || true
                
                echo "=== Final Docker Status ==="
                docker system df
            '''
        }
    }
}