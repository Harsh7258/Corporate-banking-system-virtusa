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
    
    options {
        // Timeout for the whole job (optional)
        timeout(time: 30, unit: 'MINUTES')
        // Discard old builds to save disk space
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Check for Code Changes') {
            steps {
                script {
                    echo "=== Checking if code has changed since last build ==="
                    // Fetch latest changes
                    sh 'git fetch origin main'
                    // Check if there are changes in backend or frontend
                    def changes = sh(
                        script: "git diff --name-only origin/main HEAD | grep -E '${BACKEND_DIR}|${FRONTEND_DIR}' || true",
                        returnStdout: true
                    ).trim()
                    if (changes == '') {
                        echo "No changes detected in backend/frontend. Skipping build & deploy."
                        currentBuild.result = 'SUCCESS'
                        // Stop the pipeline here
                        error("No relevant code changes.")
                    } else {
                        echo "Changes detected in: ${changes}. Proceeding with build."
                    }
                }
            }
        }

        stage('Cleanup Docker Only') {
            steps {
                script {
                    echo '=== Cleaning dangling Docker resources ==='
                    sh '''
                        # Remove stopped containers
                        docker container prune -f || true
                        # Remove dangling images
                        docker image prune -f || true
                        echo "=== Docker Disk Usage ==="
                        docker system df
                    '''
                }
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Harsh7258/Corporate-banking-system-virtusa.git'
            }
        }

        stage('Backend - Build JAR') {
            steps {
                dir("${BACKEND_DIR}") {
                    script {
                        echo '=== Building Backend JAR ==='
                        sh 'mvn clean package -DskipTests -T 1C'
                        sh '''
                            if [ ! -f target/*.jar ]; then
                                echo "ERROR: JAR file not found!"
                                exit 1
                            fi
                        '''
                    }
                }
            }
        }

        stage('Frontend - Build Production') {
            steps {
                dir("${FRONTEND_DIR}") {
                    script {
                        echo '=== Building Frontend ==='
                        sh 'npm ci --prefer-offline --no-audit --progress=false'
                        sh 'npm run build -- --configuration production'
                        sh '''
                            if [ ! -d dist/banking-frontend/browser ]; then
                                echo "ERROR: Build output not found!"
                                exit 1
                            fi
                        '''
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo '=== Building Docker Images ==='
                    sh '''
                        docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache backend frontend
                        docker image prune -f
                    '''
                }
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    echo '=== Deploying Backend & Frontend Only ==='
                    sh '''
                        # Backend
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --no-deps backend
                        sleep 30

                        # Frontend
                        docker-compose -f ${DOCKER_COMPOSE_FILE} up -d --no-deps frontend
                        sleep 15

                        echo "=== Containers Status ==="
                        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo '=== Health Checks ==='
                    retry(5) {
                        sleep 15
                        sh '''
                            curl -f http://localhost:8888/actuator/health || exit 1
                            echo "✓ Backend healthy"
                        '''
                    }
                    retry(3) {
                        sleep 10
                        sh '''
                            curl -f http://localhost:4200 || exit 1
                            echo "✓ Frontend accessible"
                        '''
                    }
                }
            }
        }

        stage('Show Logs') {
            steps {
                script {
                    sh '''
                        echo "━━━━━━━━━━ Backend Logs ━━━━━━━━━━"
                        docker logs corporate-bank-backend --tail=30 || true

                        echo "━━━━━━━━━━ Frontend Logs ━━━━━━━━━━"
                        docker logs corporate-bank-frontend --tail=15 || true
                    '''
                }
            }
        }
    }

    post {
        success {
            script {
                def TOKEN = sh(
                    script: 'curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"',
                    returnStdout: true
                ).trim()

                def PUBLIC_IP = sh(
                    script: "curl -s -H 'X-aws-ec2-metadata-token: ${TOKEN}' http://169.254.169.254/latest/meta-data/public-ipv4",
                    returnStdout: true
                ).trim()

                echo "DEPLOYMENT SUCCESSFUL!"
                echo "Frontend: http://${PUBLIC_IP}:4200"
                echo "Backend: http://${PUBLIC_IP}:8888"
            }
        }
        failure {
            echo " DEPLOYMENT FAILED"
            sh '''
                docker ps -a
                docker logs corporate-bank-backend --tail=30 || true
                docker logs corporate-bank-frontend --tail=30 || true
            '''
        }
        always {
            sh '''
                docker image prune -f || true
                docker container prune -f || true
                docker system df
            '''
        }
    }
}