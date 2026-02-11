TECHNOLOGY VERSIONS
===================

Backend (Java / Spring Boot):
- Java: 21 (Eclipse Temurin)
- Spring Boot: 3.2.0
- Spring Security: HTTP Basic Authentication
- Spring Data JPA / Hibernate
- Flyway: Database migrations (managed by Spring Boot)
- MySQL Connector: 8.0.32

Frontend (Angular):
- Angular: 17.3.0
- PrimeNG: 17.18.0
- PrimeIcons: 7.0.0
- Chart.js: (via PrimeNG ChartModule)
- TypeScript: 5.4.x

AI Service (Python / Flask):
- Python: 3.11
- Flask: 3.0.0
- Flask-CORS: 4.0.0
- CrewAI: >= 0.100.1
- CrewAI-Tools: >= 0.36.0
- OpenAI: >= 1.68.0
- openpyxl: >= 3.1.2 (Excel generation)
- python-docx: >= 1.1.0 (Word document generation)

Database:
- MySQL: 8.0
- Schema: dcf_ai (UTF-8)

Containerization:
- Docker Compose v2
- Nginx Alpine (Angular serving + reverse proxy)

IDE:
- Cursor AI IDE / VS Code compatible
- Task runner: Ctrl+Alt+8 to start all 3 services
