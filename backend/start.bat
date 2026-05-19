@echo off
title SportClub Backend - Servidor API
color 0B

echo.
echo ========================================
echo    SportClub Backend Server
echo ========================================
echo.
echo  Servidor corriendo en: http://localhost:3000
echo.
echo  Presiona Ctrl+C para detener el servidor.
echo.
echo ========================================
echo.

cd /d %~dp0
node server.js
