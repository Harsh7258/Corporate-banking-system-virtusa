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
                        docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
                        docker container prune -f || true
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
                        
                        echo '=== Verifying JAR ==='
                        sh 'ls -lh target/*.jar'
                    }
                }
            }
        }
        
        stage('Frontend - Build Production') {
            steps {
                dir("${FRONTEND_DIR}") {
                    script {
                        echo '=== Building Frontend with Angular ==='
                        
                        sh 'npm ci --prefer-offline --no-audit --progress=false'
                        sh 'npm run build -- --configuration production'
                        
                        echo '=== Verifying build output ==='
                        sh 'ls -lR dist/banking-frontend/browser/'
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
                        docker build -t corporate-bank-backend:latest \
                          -f ${BACKEND_DIR}/Dockerfile \
                          ${BACKEND_DIR}
                        
                        echo "Cleaning intermediate images..."
                        docker image prune -f
                        
                        echo "Building Frontend Docker image..."
                        docker build -t corporate-bank-frontend:latest \
                          -f ${FRONTEND_DIR}/Dockerfile \
                          ${FRONTEND_DIR}
                        
                        echo "Final cleanup..."
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
                    
                    sh 'sleep 30'
                    
                    retry(5) {
                        sleep 15
                        sh 'curl -f http://localhost:8888/actuator/health || exit 1'
                    }
                    
                    retry(3) {
                        sleep 10
                        sh 'curl -f http://localhost:4200 || exit 1'
                    }
                    
                    echo '✓ All services are healthy!'
                }
            }
        }
        
        stage('Show Logs') {
            steps {
                script {
                    echo '=== Application Logs ==='
                    sh '''
                        echo "--- Backend Logs ---"
                        docker logs corporate-bank-backend --tail=20 || true
                    '''
                }
            }
        }
    }
    
    post {
        success {
            script {
                def TOKEN = sh(
                    script: '''
                    curl -s -X PUT "http://169.254.169.254/latest/api/token" \
                    -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"
                    ''',
                    returnStdout: true
                ).trim()

                def PUBLIC_IP = sh(
                    script: '''
                    echo "$(curl -s -H "X-aws-ec2-metadata-token: ''' + TOKEN + '''" \
                    http://169.254.169.254/latest/meta-data/public-ipv4)"
                    ''',
                    returnStdout: true
                ).trim()

                echo '✓ DEPLOYMENT SUCCESSFUL!'
                echo ''
                echo "Frontend:  http://${PUBLIC_IP}:4200"
                echo "Backend:   http://${PUBLIC_IP}:8888"
                echo ''
            }
        }
        failure {
            echo '✗ DEPLOYMENT FAILED!'
            
            sh '''
                docker-compose -f ${DOCKER_COMPOSE_FILE} ps
                docker logs corporate-bank-backend --tail=50 || true
            '''
        }
        always {
            echo 'Cleaning up...'
            sh '''
                docker image prune -f || true
                docker container prune -f || true
            '''
        }
    }
}