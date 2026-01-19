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
        // CRITICAL: Limit Maven memory
        MAVEN_OPTS = '-Xmx512m -XX:MaxMetaspaceSize=256m'
        // CRITICAL: Limit Node memory
        NODE_OPTIONS = '--max-old-space-size=768'
    }
    
    stages {
        stage('Cleanup') {
            steps {
                script {
                    echo '=== Cleaning workspace and Docker resources ==='
                    cleanWs()
                    
                    // Aggressive Docker cleanup
                    sh '''
                        # Stop all containers
                        docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
                        
                        # Remove all stopped containers
                        docker container prune -f || true
                        
                        # Remove dangling images
                        docker image prune -f || true
                        
                        # Show current usage
                        echo "=== Docker Disk Usage ==="
                        docker system df
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
                        // Build JAR that Docker will copy (no double build)
                        sh 'mvn clean package -DskipTests -T 1C'
                        
                        // Verify JAR was created
                        sh '''
                            echo "=== Checking for JAR file ==="
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
                        echo '=== Building Frontend with Angular ==='
                        
                        // Install dependencies
                        sh 'npm ci --prefer-offline --no-audit --progress=false'
                        
                        // Build for production (Docker will just copy the dist folder)
                        sh 'npm run build -- --configuration production'
                        
                        // Verify build output
                        sh '''
                            echo "=== Checking build output ==="
                            ls -lR dist/
                        '''
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    echo '=== Building Docker Images (Sequential) ==='
                    
                    // Build images one at a time to save memory
                    sh '''
                        echo "Building Backend Docker image..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache backend
                        
                        echo "Cleaning up intermediate images..."
                        docker image prune -f
                        
                        echo "Building Frontend Docker image..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache frontend
                        
                        echo "Final cleanup of build cache..."
                        docker image prune -f
                        
                        echo "=== Docker Images Created ==="
                        docker images | grep corporate-bank
                    '''
                }
            }
        }
        
        stage('Deploy Application') {
            steps {
                script {
                    echo '=== Starting Application Services ==='
                    
                    // Start services in order with delays for stability
                    sh '''
                        echo "Starting infrastructure services..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d mongodb zookeeper
                        sleep 20
                        
                        echo "Starting Kafka..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d kafka
                        sleep 25
                        
                        echo "Initializing Kafka topics..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d kafka-init
                        sleep 15
                        
                        echo "Starting Backend..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d backend
                        sleep 30
                        
                        echo "Starting Frontend..."
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d frontend
                        sleep 10
                        
                        echo "=== All services started ==="
                        docker-compose -f ${DOCKER_COMPOSE_FILE} ps
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo '=== Performing Health Checks ==='
                    
                    // Wait for services to be ready
                    sh 'sleep 30'
                    
                    // Check backend health
                    retry(5) {
                        sleep 15
                        sh '''
                            echo "Checking Backend health..."
                            curl -f http://localhost:8888/actuator/health || exit 1
                        '''
                    }
                    
                    // Check frontend
                    retry(3) {
                        sleep 10
                        sh '''
                            echo "Checking Frontend..."
                            curl -f http://localhost:4200 || exit 1
                        '''
                    }
                    
                    echo '✓ All services are healthy!'
                }
            }
        }
        
        stage('Show Logs') {
            steps {
                script {
                    echo '=== Application Logs (Last 20 lines) ==='
                    sh '''
                        echo "--- Backend Logs ---"
                        docker logs corporate-bank-backend --tail=20 || true
                        
                        echo "--- Kafka Logs ---"
                        docker logs corporate-bank-kafka --tail=10 || true
                    '''
                }
            }
        }
    }
    
    post {
        success {
            script {
                def PUBLIC_IP = sh(
                    script: "curl -s http://169.254.169.254/latest/meta-data/public-ipv4 || echo 'localhost'",
                    returnStdout: true
                ).trim()

                echo 'DEPLOYMENT SUCCESSFUL!'
                echo ''
                echo "Frontend:  http://${PUBLIC_IP}:4200"
                echo "Backend:   http://${PUBLIC_IP}:8888"
                echo ''
                echo 'Services may take 2-3 minutes to fully initialize'
                echo '────────────────────────────────────────────────'
            }
        }
        failure {
            echo 'DEPLOYMENT FAILED!'
            
            sh '''
                echo "=== Container Status ==="
                docker-compose -f ${DOCKER_COMPOSE_FILE} ps
                
                echo "=== Backend Logs ==="
                docker logs corporate-bank-backend --tail=50 || true
                
                echo "=== Frontend Logs ==="
                docker logs corporate-bank-frontend --tail=30 || true
            '''
        }
        always {
            echo 'Cleaning up unused Docker resources...'
            sh '''
                docker image prune -f || true
                docker container prune -f || true
                echo "=== Final Docker Usage ==="
                docker system df
            '''
        }
    }
}