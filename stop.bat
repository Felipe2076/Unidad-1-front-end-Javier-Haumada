@echo off
title SportClub - Deteniendo Servidor
color 0C
mode con: cols=60 lines=15

echo.
echo    ============================================
echo         Deteniendo SportClub Backend
echo    ============================================
echo.

taskkill /F /IM node.exe >nul 2>&1

if %errorlevel% equ 0 (
    echo    Servidor detenido correctamente.
) else (
    echo    No se encontro el servidor corriendo.
    echo    (Ya estaba detenido)
)

echo.
echo    ============================================
echo.
timeout /t 2 /nobreak
