@echo off
setlocal EnableDelayedExpansion

REM ── Read project path from PATH.txt ──
set "PATH_FILE=%~dp0..\..\PATH.txt"
if not exist "%PATH_FILE%" (
    echo ERROR: PATH.txt not found at "%PATH_FILE%"
    pause
    exit /b 1
)
for /f "tokens=1,* delims==" %%a in ('type "%PATH_FILE%"') do (
    if "%%a"=="PATH" set "PROJECT_PATH=%%b"
)
if not defined PROJECT_PATH (
    echo ERROR: PATH variable not found in PATH.txt
    pause
    exit /b 1
)
echo Project path: %PROJECT_PATH%

REM ── Load TAR images ──
cd /d "%PROJECT_PATH%\docker\TAR_IMAGES"

echo Loading Docker images...
docker load -i "docker-mysql_db.tar"
docker load -i "docker-java_app.tar"
docker load -i "docker-angular_app.tar"
docker load -i "docker-python_app.tar"

echo All images loaded.

REM ── Start containers ──
echo Starting containers with docker-compose...
docker compose up -d

echo Done! All services are up.
echo MySQL:   localhost:33306
echo Java:    localhost:18080
echo Angular: localhost:14200
echo Python:  localhost:15000
pause
