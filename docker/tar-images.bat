@echo off
setlocal EnableDelayedExpansion

REM ── Read project path from PATH.txt ──
set "PATH_FILE=%~dp0..\PATH.txt"
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

REM ── Save images to TAR_IMAGES folder ──
cd /d "%PROJECT_PATH%\docker"

echo Saving docker-mysql_db...
docker save -o TAR_IMAGES/docker-mysql_db.tar docker-mysql_db:latest

echo Saving docker-java_app...
docker save -o TAR_IMAGES/docker-java_app.tar docker-java_app:latest

echo Saving docker-angular_app...
docker save -o TAR_IMAGES/docker-angular_app.tar docker-angular_app:latest

echo Saving docker-python_app...
docker save -o TAR_IMAGES/docker-python_app.tar docker-python_app:latest

echo DONE!
pause
