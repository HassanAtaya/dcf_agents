MYSQL SETUP
===========

Prerequisites:
- MySQL 8.0

Steps:
1. Install MySQL 8.0
2. Create the schema:
   CREATE SCHEMA `dcf_ai` DEFAULT CHARACTER SET utf8;
3. Tables and seed data are managed automatically by Flyway migrations
   when the Java Spring Boot backend starts for the first time.

Tables Created by Flyway:
- users             : Application users (username, password, firstName, lastName, language)
- roles             : User roles (e.g., ADMIN)
- permissions       : Granular permissions (e.g., add_permission, use_dcf, view_kpi)
- roles_permissions : Many-to-many mapping between roles and permissions
- ai_keys           : Stores OpenAI API key and 4 agent prompt configurations
- dcf_logs          : Logs each DCF analysis download for the KPI dashboard

Default Connection (Local):
- Host: localhost
- Port: 3306
- Database: dcf_ai
- Username: root
- Password: root

Docker Connection:
- Host: localhost
- Port: 33306 (mapped to 3306 inside container)
- Database: dcf_ai
- Username: root
- Password: root
