@echo off
REM Dorphin Backend Startup Script for Windows
REM This script starts the local backend server

echo.
echo ================================
echo    STARTING DORPHIN BACKEND
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo.

REM Navigate to backend directory
cd local-backend

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INSTALL] Installing dependencies...
    call npm install
    echo.
)

REM Start the server
echo [START] Starting backend server...
echo.
call npm start

pause
