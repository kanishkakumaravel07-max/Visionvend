@echo off
echo ===================================================
echo   Starting VisionVend Application
echo ===================================================

echo Starting Backend Server (Flask API on port 5000)...
start cmd /k "npm run start-backend"

echo Starting Frontend Server (Vite App on port 5173)...
start cmd /k "npm run start-frontend"

echo ===================================================
echo   Servers are launching!
echo   Frontend: http://localhost:5173
echo   Backend API: http://localhost:5000
echo ===================================================
pause
