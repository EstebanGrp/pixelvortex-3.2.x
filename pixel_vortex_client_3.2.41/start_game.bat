@echo off
title Pixel Vortex Client Server
echo ===================================================
echo   Starting Pixel Vortex Client (Offline Mode)
echo ===================================================
echo.
echo Launching local server on port 8000...
echo Opening game in default browser...
echo.
echo NOTE: Keep this window OPEN while playing!
echo.

start "" "http://localhost:8000"
python -m http.server 8000

pause
