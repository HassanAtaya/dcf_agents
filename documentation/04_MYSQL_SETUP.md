MYSQL SETUP
===========

Prerequisites:
- MySQL 8.0

Steps:
1. Install MySQL 8.0
2. Create the schema:
   CREATE SCHEMA `dcf_ai` DEFAULT CHARACTER SET utf8;
3. Tables and seed data are managed by Flyway migrations.
4. Default connection:
   - Host: localhost
   - Port: 3306
   - Database: dcf_ai
   - Username: root
   - Password: root

Docker:
- Port: 33306 (mapped to 3306 inside container)
