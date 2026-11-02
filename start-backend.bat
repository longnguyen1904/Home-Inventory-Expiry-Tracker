@echo off
title Backend API Server
color 0B
echo ===================================================
echo   Starting Home Inventory Backend Server...
echo ===================================================
cd /d "%~dp0backend"
npm run dev
pause
