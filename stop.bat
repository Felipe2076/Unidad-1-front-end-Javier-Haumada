@echo off
title Detener SportClub
color 0C

echo.
echo ========================================
echo    Deteniendo SportClub Backend
echo ========================================
echo.

taskkill /FI "WINDOWTITLE eq SportClub Backend*" /T /F >nul 2>&1

if %errorlevel% equ 0 (
    echo  Servidor detenido correctamente.
) else (
    echo  No se encontro el servidor corriendo.
)

echo.
pause
