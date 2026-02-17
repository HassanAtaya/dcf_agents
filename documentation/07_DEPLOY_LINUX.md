DCF AGENTS – FULL DEPLOYMENT GUIDE (UBUNTU 22.04+)
==================================================

ASSUMPTIONS
-----------
- Fresh Ubuntu 22.04+ server
- SSH access as user: ubuntu
- Project path: /home/ubuntu/dcf_agents
- Backend: Spring Boot (Maven)
- Frontend: Angular (served by nginx)
- Database: MySQL
- One systemd service for backend only
- Java logs must go to: /var/logs/dcf_logs


STEP 1 — PREPARE USER AND CLONE REPOSITORY
------------------------------------------

SSH into server:

    ssh ubuntu@your-server-ip

Prepare home directory (if needed):

    cd /home
    sudo mkdir -p /home/ubuntu
    sudo chown ubuntu:ubuntu /home/ubuntu

Clone repository:

    cd /home
    git clone https://your.git.repo.url.git dcf_agents
    cd dcf_agents


STEP 2 — INSTALL REQUIRED PACKAGES
----------------------------------

    sudo apt update

    # Java & Maven
    sudo apt install -y openjdk-17-jdk maven

    # Node & npm
    sudo apt install -y nodejs npm

    # Angular CLI
    sudo npm install -g @angular/cli

    # MySQL
    sudo apt install -y mysql-server

    # nginx
    sudo apt install -y nginx

Verify installations:

    java -version
    mvn -v
    node -v
    ng version


STEP 3 — CREATE DATABASE (MySQL 8.2)
------------------------------------

MySQL Version: 8.2
Host: localhost
Port: 3306
Root Credentials: root / root

Login to MySQL as root:

    mysql -u root -p

Enter password:
    root

Inside MySQL shell:

    CREATE DATABASE IF NOT EXISTS dcf_ai CHARACTER SET utf8 COLLATE utf8_general_ci;
    ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
    FLUSH PRIVILEGES;
    EXIT;

Remember:
    DB Name: dcf_ai
    DB User: root
    DB Password: root
    Host: localhost
    Port: 3306

STEP 4 — CONFIGURE SPRING BOOT PROPERTIES
------------------------------------------

Go to backend resources folder:

    cd /home/ubuntu/dcf_agents/back_end_javaspringboot/src/main/resources

Edit application.properties (or application-prod.properties):

    spring.datasource.url=jdbc:mysql://localhost:3306/dcf_ai
    spring.datasource.username=root
    spring.datasource.password=root
    spring.jpa.hibernate.ddl-auto=none
    spring.jpa.show-sql=false

    logging.file.name=/var/logs/dcf_logs/dcf_app.log
    logging.level.root=INFO

Create log directory:

    sudo mkdir -p /var/logs/dcf_logs
    sudo chown ubuntu:ubuntu /var/logs/dcf_logs
    sudo chmod 750 /var/logs/dcf_logs


STEP 5 — BUILD ANGULAR FRONTEND
--------------------------------

    cd /home/ubuntu/dcf_agents/front_end_angular
    npm install
    ng build --configuration production

Confirm build output:

    ls dist

Note your actual dist folder name (example: dist/dcf-app/).


STEP 6 — BUILD SPRING BOOT BACKEND
-----------------------------------

    cd /home/ubuntu/dcf_agents/back_end_javaspringboot
    mvn clean package -DskipTests

After build:

    ls target

Note exact jar file name (example:
    back_end_javaspringboot-0.0.1-SNAPSHOT.jar)


STEP 7 — CONFIGURE NGINX
------------------------

7.1 Copy Angular build to nginx root:

    sudo mkdir -p /var/www/dcf_frontend
    sudo cp -r /home/ubuntu/dcf_agents/front_end_angular/dist/* /var/www/dcf_frontend/
    sudo chown -R www-data:www-data /var/www/dcf_frontend

7.2 Create nginx site config:

    sudo nano /etc/nginx/sites-available/dcf_app

Paste:

    server {
        listen 80;
        server_name your-domain.com;

        root /var/www/dcf_frontend;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://127.0.0.1:8080/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection keep-alive;
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }

Enable site:

    sudo ln -s /etc/nginx/sites-available/dcf_app /etc/nginx/sites-enabled/dcf_app
    sudo rm /etc/nginx/sites-enabled/default 2>/dev/null || true
    sudo nginx -t
    sudo systemctl restart nginx
    sudo systemctl enable nginx


STEP 8 — CREATE SYSTEMD SERVICE FOR BACKEND
--------------------------------------------

8.1 Create dedicated user:

    sudo useradd -r -s /bin/false dcfuser
    sudo chown -R dcfuser:dcfuser /home/ubuntu/dcf_agents
    sudo chown -R dcfuser:dcfuser /var/logs/dcf_logs

8.2 Create systemd service:

    sudo nano /etc/systemd/system/dcf_app.service

Paste (replace YOUR_JAR_NAME.jar):

    [Unit]
    Description=DCF Agents Spring Boot Application
    After=network.target mysql.service

    [Service]
    User=dcfuser
    WorkingDirectory=/home/ubuntu/dcf_agents/back_end_javaspringboot
    ExecStart=/usr/bin/java -jar /home/ubuntu/dcf_agents/back_end_javaspringboot/target/YOUR_JAR_NAME.jar
    SuccessExitStatus=143
    Restart=always
    RestartSec=10
    Environment=SPRING_PROFILES_ACTIVE=prod
    StandardOutput=journal
    StandardError=journal

    [Install]
    WantedBy=multi-user.target

Reload and start service:

    sudo systemctl daemon-reload
    sudo systemctl start dcf_app
    sudo systemctl enable dcf_app

Check service:

    sudo systemctl status dcf_app


STEP 9 — VERIFY SYSTEM
----------------------

Check MySQL:

    sudo systemctl status mysql

Test backend locally:

    curl http://127.0.0.1:8080/actuator/health

Check Java logs:

    ls -l /var/logs/dcf_logs
    tail -f /var/logs/dcf_logs/dcf_app.log

Check nginx logs:

    sudo tail -f /var/log/nginx/access.log

Open browser:

    http://your-domain.com


STEP 10 — DEPLOY NEW VERSION
-----------------------------

    cd /home/ubuntu/dcf_agents
    git pull

Rebuild frontend:

    cd front_end_angular
    ng build --configuration production
    sudo cp -r dist/* /var/www/dcf_frontend/

Rebuild backend:

    cd ../back_end_javaspringboot
    mvn clean package -DskipTests

Restart service:

    sudo systemctl restart dcf_app

All Java logs remain under:

    /var/logs/dcf_logs


DEPLOYMENT COMPLETE
===================
