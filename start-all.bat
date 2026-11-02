@echo off
title Home Inventory & Expiry Tracker Launcher
color 0A
echo ========================================================
echo   HOME INVENTORY & EXPIRY TRACKER (SMARTBOX MOBILE)
echo ========================================================
echo.
echo [1/3] Khoi dong Backend Server tai port 5000...
start "Home Inventory Backend API (Port 5000)" cmd /k "cd /d %~dp0backend && npm start"

echo [2/3] Cho Backend khoi dong (3 giay)...
timeout /t 3 /nobreak >nul

echo [3/3] Khoi dong Mobile App (Expo Web / Metro)...
start "Home Inventory Mobile App (Expo Metro)" cmd /k "cd /d %~dp0mobile && npm run web"

echo.
echo ========================================================
echo   HE THONG DA DUOC KHOI CHAY THANH CONG!
echo   - Backend API: http://localhost:5000
echo   - Mobile App Web: http://localhost:8081
echo ========================================================
echo.
timeout /t 5 /nobreak >nul
start http://localhost:8081
pause
