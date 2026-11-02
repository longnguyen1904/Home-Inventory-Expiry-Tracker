@echo off
title Expo Go Tunnel Mode (Expo SDK 58 - Account: longmoi)
color 0A
echo ========================================================
echo   Khoi dong Expo Go Tunnel (ngrok) + Proxy API (cong 5000)
echo   Luu y: Backend phai dang chay (cd backend ^&^& npm start)
echo ========================================================
echo.
cd /d "%~dp0mobile"
npx expo start --tunnel ngrok
pause
