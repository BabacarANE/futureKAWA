pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'futurekawa'
        DOCKER_BUILDKIT = '1'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo "Branch: ${env.BRANCH_NAME}"
                echo "Commit: ${env.GIT_COMMIT}"
            }
        }

        stage('Build') {
            parallel {
                stage('Build backend-pays') {
                    steps {
                        sh 'docker build -t futurekawa/backend-pays:${GIT_COMMIT} ./backend-pays'
                        sh 'docker tag futurekawa/backend-pays:${GIT_COMMIT} futurekawa/backend-pays:latest'
                    }
                }
                stage('Build backend-siege') {
                    steps {
                        sh 'docker build -t futurekawa/backend-siege:${GIT_COMMIT} ./backend-siege'
                        sh 'docker tag futurekawa/backend-siege:${GIT_COMMIT} futurekawa/backend-siege:latest'
                    }
                }
                stage('Build frontend') {
                    steps {
                        sh 'docker build -t futurekawa/frontend:${GIT_COMMIT} ./frontend'
                        sh 'docker tag futurekawa/frontend:${GIT_COMMIT} futurekawa/frontend:latest'
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
                                -e MQTT_PORT=1883 \
                                -e SECRET_KEY=test-secret-key \
                                -e SEUIL_TEMP=29 \
                                -e SEUIL_HUMIDITE=55 \
                                -e TOLERANCE_TEMP=3 \
                                -e TOLERANCE_HUMIDITE=2 \
                                futurekawa/backend-pays:latest \
                                pytest tests/ -v --tb=short \
                                --junitxml=/tmp/results-pays.xml
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
                                -e SECRET_KEY=test-secret-key \
                                futurekawa/backend-siege:latest \
                                pytest tests/ -v --tb=short \
                                --junitxml=/tmp/results-siege.xml
                        '''
                    }
                }
                stage('Tests IoT mock') {
                    steps {
                        sh '''
                            docker run --rm \
                                futurekawa/backend-pays:latest \
                                pytest iot/tests/ -v --tb=short \
                                --junitxml=/tmp/results-iot.xml || true
                        '''
                    }
                }
            }
        }

        stage('Quality') {
            parallel {
                stage('Lint backend-pays') {
                    steps {
                        sh '''
                            docker run --rm \
                                futurekawa/backend-pays:latest \
                                sh -c "pip install flake8 --quiet && \
                                       flake8 app/ --max-line-length=100 \
                                       --exclude=__pycache__ \
                                       --format=default"
                        '''
                    }
                }
                stage('Lint backend-siege') {
                    steps {
                        sh '''
                            docker run --rm \
                                futurekawa/backend-siege:latest \
                                sh -c "pip install flake8 --quiet && \
                                       flake8 app/ --max-line-length=100 \
                                       --exclude=__pycache__ \
                                       --format=default"
                        '''
                    }
                }
            }
        }

        stage('Package') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                sh 'docker compose build'
                echo "Images packagées pour ${env.BRANCH_NAME}"
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Deploiement en production...'
                sh 'docker compose down || true'
                sh 'docker compose up -d'
                sh 'sleep 10'
                sh 'curl -f http://localhost:8000/health || exit 1'
                sh 'curl -f http://localhost:8001/health || exit 1'
                sh 'curl -f http://localhost:8002/health || exit 1'
                sh 'curl -f http://localhost:8003/health || exit 1'
                echo 'Deploiement reussi'
            }
        }
    }

    post {
        success {
            echo "Pipeline reussi — branch: ${env.BRANCH_NAME}"
        }
        failure {
            echo "Pipeline echoue — verifier les logs"
        }
        always {
            sh 'docker system prune -f || true'
        }
    }
}
