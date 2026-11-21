@echo off
title Exchange App Local Server
cd /d "%~dp0"
echo ===================================================
echo   Starting Exchange App Local Server on Port 8080
echo   URL: http://localhost:8080/
echo ===================================================
echo Press Ctrl+C in this window to stop the server.
echo.
python -m http.server 8080
pause
