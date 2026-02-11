JAVA BACKEND SETUP
==================

Prerequisites:
- Java 21 (JDK) - Eclipse Temurin recommended
- Maven 3.8+
- MySQL 8.0 running with database `dcf_ai`

Steps:
1. Navigate to: back_end_javaspringboot/
2. Create the database (if not already created):
   CREATE SCHEMA `dcf_ai` DEFAULT CHARACTER SET utf8;
3. For local development, set the Spring config location:
   SET SPRING_CONFIG_LOCATION=classpath:/LOCALapplication.properties
   (or in PowerShell: $env:SPRING_CONFIG_LOCATION = 'classpath:/LOCALapplication.properties')
4. Run: mvn spring-boot:run
5. The app starts on http://localhost:8080
6. Flyway automatically creates tables and seeds data on first run.

Flyway Migrations:
- V1__create_tables.sql     : Creates users, roles, permissions, ai_keys tables
- V2__seed_data.sql         : Seeds admin user, roles, permissions, default AI prompts
- V3__create_dcf_logs.sql   : Creates dcf_logs table for KPI tracking + view_kpi permission

Build for Docker:
  mvn clean package -DskipTests
  Output: target/dcf-production-0.0.1-SNAPSHOT.jar

API Endpoints:

  Authentication:
  - POST /api/auth/login       - Login (HTTP Basic)
  - GET  /api/auth/me          - Current user info
  - PUT  /api/auth/profile     - Update profile (name, password, language)
  - GET  /api/auth/health      - Health check

  Permissions:
  - GET/POST/PUT/DELETE /api/permissions - Permission CRUD

  Roles:
  - GET/POST/PUT/DELETE /api/roles       - Role CRUD

  Users:
  - GET/POST/PUT/DELETE /api/users       - User CRUD

  Settings:
  - GET /api/settings          - Get AI settings (API key + 4 agent prompts)
  - PUT /api/settings          - Update AI settings

  DCF Logs (KPI):
  - GET  /api/dcf-logs         - List all DCF analysis logs (newest first)
  - POST /api/dcf-logs         - Create a new DCF log entry
