DOCKER DEPLOYMENT GUIDE
=======================

Prerequisites:
- Docker Desktop with Docker Compose v2

Services:
- mysql_db:    MySQL 8.0 (port 33306)
- java_app:    Spring Boot backend (port 18080)
- angular_app: Angular + Nginx (port 14200)
- python_app:  Flask + CrewAI (port 15000)

Steps:
1. Update PATH.txt with your project path
2. Build Java: cd back_end_javaspringboot && mvn clean package -DskipTests
3. Build Angular: cd front_end_angular && npm install && npm run build
4. Run: cd docker && docker compose up -d

Or use the batch script:
  docker/run-all.bat

Access:
- Application: http://localhost:14200
- Java API:    http://localhost:18080
- Python API:  http://localhost:15000
- MySQL:       localhost:33306

Default Login:
- Username: admin
- Password: 123456
