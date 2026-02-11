DOCKER DEPLOYMENT GUIDE
=======================

Prerequisites:
- Docker Desktop with Docker Compose v2
- Java 21 and Maven (for building the JAR)
- Node.js 18+ and npm (for building the Angular app)

Services:
- mysql_db:    MySQL 8.0          (host port 33306 -> container 3306)
- java_app:    Spring Boot backend (host port 18080 -> container 8080)
- python_app:  Flask + CrewAI      (host port 15000 -> container 5000)
- angular_app: Angular + Nginx     (host port 14200 -> container 4200)
                Nginx acts as a reverse proxy:
                  /api/   -> java_app:8080
                  /pyapi/ -> python_app:5000
                  /       -> serves Angular SPA

=== OPTION 1: Build and Run from Source (run-all.bat) ===

Steps:
1. Update PATH.txt in the project root with your local project path:
   PATH=C:\path\to\dcf_agents

2. Build Java JAR:
   cd back_end_javaspringboot
   mvn clean package -DskipTests

3. Build Angular:
   cd front_end_angular
   npm install
   npx ng build --configuration production

4. Run the batch script:
   cd docker
   run-all.bat

   This script:
   - Reads PROJECT_PATH from PATH.txt
   - Creates a .env file for docker-compose
   - Stops and removes old containers
   - Builds all Docker images from source
   - Starts all 4 services in detached mode

5. Access the application: http://localhost:14200

=== OPTION 2: Export and Run TAR Images ===

After a successful build (Option 1), you can export images for deployment
on machines without the source code:

1. Run: docker/tar-images.bat
   This saves all 4 Docker images as .tar files into docker/TAR_IMAGES/

2. Copy the TAR_IMAGES folder to the target machine.

3. On the target machine, run: TAR_IMAGES/run_project.bat
   This script:
   - Loads all .tar images into Docker
   - Starts all services via docker-compose.yml (inside TAR_IMAGES)
   - Uses different host ports to avoid conflicts:
     MySQL: 33306, Java: 18080, Angular: 14200, Python: 15000

=== Access URLs ===

- Application:  http://localhost:14200
- Java API:     http://localhost:18080
- Python API:   http://localhost:15000
- MySQL:        localhost:33306

Default Login:
- Username: admin
- Password: 123456

=== Useful Docker Commands ===

View logs:       docker compose logs -f
Stop all:        docker compose down
Stop + cleanup:  docker compose down -v --remove-orphans
Rebuild one:     docker compose build <service_name> --no-cache
