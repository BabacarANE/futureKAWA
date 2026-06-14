pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = 'docker compose'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}"
            }
        }

        stage('Build') {
            parallel {
                stage('Build backend-pays') {
                    steps {
                        sh 'docker build -t futurekawa/backend-pays:latest ./backend-pays'
                    }
                }
                stage('Build backend-siege') {
                    steps {
                        sh 'docker build -t futurekawa/backend-siege:latest ./backend-siege'
                    }
                }
                stage('Build frontend') {
                    steps {
                        sh 'docker build -t futurekawa/frontend:latest ./frontend'
                    }
                }
            }
        }

        stage('Tests') {
            parallel {
                stage('Tests backend-pays') {
                    steps {
                        sh '''
                            docker run --rm \
                                -e PAYS=bresil \
                                -e DATABASE_URL=sqlite:///./test.db \
                                -e MQTT_BROKER=localhost \
                                -e SECRET_KEY=test-secret \
                                futurekawa/backend-pays:latest \
                                pytest tests/ -v --tb=short
                        '''
                    }
                }
                stage('Tests backend-siege') {
                    steps {
                        sh '''
                            docker run --rm \
                                -e API_BRESIL=http://localhost:8001 \
                                -e API_EQUATEUR=http://localhost:8002 \
                                -e API_COLOMBIE=http://localhost:8003 \
                                -e SECRET_KEY=test-secret \
                                futurekawa/backend-siege:latest \
                                pytest tests/ -v --tb=short
                        '''
                    }
                }
            }
        }

        stage('Quality') {
            steps {
                sh '''
                    docker run --rm \
                        -v $(pwd)/backend-pays:/app \
                        futurekawa/backend-pays:latest \
                        sh -c "pip install flake8 --quiet && flake8 app/ --max-line-length=100"
                '''
            }
        }

        stage('Package') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker compose build'
                echo 'Images Docker pretes pour le deploiement'
            }
        }
    }

    post {
        success {
            echo 'Pipeline termine avec succes'
        }
        failure {
            echo 'Pipeline echoue — verifier les logs'
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
