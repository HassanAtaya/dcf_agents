JAVA BACKEND SETUP
==================

Prerequisites:
- Java 21 (JDK)
- Maven 3.8+
- MySQL 8.0 running with database `dcf_ai`

Steps:
1. Navigate to: back_end_javaspringboot/
2. Create the database:
   CREATE SCHEMA `dcf_ai` DEFAULT CHARACTER SET utf8;
3. For local development, use LOCALapplication.properties:
   Set SPRING_CONFIG_LOCATION=classpath:/LOCALapplication.properties
4. Run: mvn spring-boot:run
5. The app starts on http://localhost:8080
6. Flyway automatically creates tables and seeds data on first run.

API Endpoints:
- POST /api/auth/login     - Login
- GET  /api/auth/me        - Current user info
- PUT  /api/auth/profile   - Update profile
- GET  /api/auth/health    - Health check
- GET/POST/PUT/DELETE /api/permissions - Permission CRUD
- GET/POST/PUT/DELETE /api/roles       - Role CRUD
- GET/POST/PUT/DELETE /api/users       - User CRUD
- GET/PUT /api/settings    - AI Settings management
