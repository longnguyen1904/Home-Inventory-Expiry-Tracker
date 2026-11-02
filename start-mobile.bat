@echo off
title Mobile App Expo Metro
color 0E
echo ===================================================
echo   Starting Home Inventory Mobile App (Expo Web)...
echo ===================================================
cd /d "%~dp0mobile"
npm run web
pause
