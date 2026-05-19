@echo off
title SportClub Backend Server
color 0A
mode con: cols=60 lines=10

echo.
echo    ========================================
echo         SportClub Backend Server
echo    ========================================
echo.
echo    Servidor corriendo en: http://localhost:3000
echo.
echo    NO CIERRES esta ventana mientras uses el sistema.
echo    Para detener el servidor, cierra esta ventana.
echo.
echo    ========================================
echo.

cd /d "%~dp0"
node server.js
