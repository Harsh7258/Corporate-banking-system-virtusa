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
    }
    
    stages {
        stage('Cleanup Workspace') {
            steps {
                cleanWs()
            }
        }
        
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Harsh7258/Corporate-banking-system-virtusa.git'
            }
        }
        
        stage('Backend - Build & Test') {
            steps {
                dir("${BACKEND_DIR}") {
                    script {
                        echo 'Building Backend with Maven...'
                        sh 'mvn clean package -DskipTests'
                        
                        echo 'Running Backend Tests...'
                        sh 'mvn test'
                        
                        echo 'Generating Code Coverage Report...'
                        sh 'mvn jacoco:report'
                    }
                }
            }
        }
        
        stage('Frontend - Build & Test') {
            steps {
                dir("${FRONTEND_DIR}") {
                    script {
                        echo 'Installing Frontend Dependencies...'
                        sh 'npm ci'
                        
                        echo 'Running Frontend Tests...'
                        sh 'npm run test -- --watch=false --browsers=ChromeHeadless'
                        
                        echo 'Building Frontend for Production...'
                        sh 'npm run build --prod'
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                script {
                    echo 'Running SonarQube Analysis...'
                    dir("${BACKEND_DIR}") {
                        // If you have SonarQube server configured
                        // sh 'mvn sonar:sonar'
                        echo 'SonarQube analysis skipped (configure SonarQube server if needed)'
                    }
                }
            }
        }
        
        stage('Stop Previous Containers') {
            steps {
                script {
                    echo 'Stopping and removing previous containers...'
                    sh '''
                        docker-compose -f ${DOCKER_COMPOSE_FILE} down --remove-orphans || true
                        docker system prune -f
                    '''
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    echo 'Building Docker images...'
                    sh "docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache"
                }
            }
        }
        
        stage('Deploy Application') {
            steps {
                script {
                    echo 'Starting application with Docker Compose...'
                    sh "docker-compose -f ${DOCKER_COMPOSE_FILE} up -d"
                    
                    echo 'Waiting for services to be healthy...'
                    sh 'sleep 60'
                    
                    echo 'Checking service status...'
                    sh "docker-compose -f ${DOCKER_COMPOSE_FILE} ps"
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo 'Performing health checks...'
                    
                    // Check backend health
                    retry(5) {
                        sleep 10
                        sh '''
                            curl -f http://localhost:8888/actuator/health || exit 1
                        '''
                    }
                    
                    // Check frontend
                    retry(5) {
                        sleep 10
                        sh '''
                            curl -f http://localhost:4200 || exit 1
                        '''
                    }
                    
                    echo 'All services are healthy!'
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
            // Fetch EC2 public IP dynamically
                def PUBLIC_IP = sh(
                    script: "curl -s http://169.254.169.254/latest/meta-data/public-ipv4",
                    returnStdout: true
                ).trim()

            echo "Backend API: http://${PUBLIC_IP}:8888"
            echo "Frontend App: http://${PUBLIC_IP}:4200"
        }
        failure {
            echo 'Pipeline failed! Check logs for details.'
            sh "docker-compose -f ${DOCKER_COMPOSE_FILE} logs"
        }
        always {
            echo 'Cleaning up...'
            sh 'docker system prune -f'
        }
    }
}