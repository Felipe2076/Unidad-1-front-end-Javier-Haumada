@echo off
title SportClub - Iniciando Sistema
color 0A
mode con: cols=70 lines=20

echo.
echo    ========================================
echo         SportClub - Iniciando Sistema
echo    ========================================
echo.

REM Verificar si el backend ya está corriendo
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] El servidor ya esta corriendo.
) else (
    echo    [1/2] Iniciando servidor backend...
    start "SportClub Backend" /min cmd /c "cd /d %~dp0backend && node server.js"
    timeout /t 3 /nobreak >nul
    echo    [OK] Servidor iniciado.
)

echo.
echo    [2/2] Abriendo navegador en http://localhost:3000/login.html
start "" "http://localhost:3000/login.html"

echo.
echo    ========================================
echo         Sistema listo para usar!
echo    ========================================
echo.
echo    Cuentas de prueba:
echo      Admin:   admin1@demo.cl / 12345678
echo      Coach:   coach1@demo.cl / 12345678
echo      User:    usuario1@demo.cl / 12345678
echo.
echo    El indicador verde confirma conexion al backend.
echo    NO usar GitHub Pages para demostraciones.
echo.
echo    ========================================
echo.
timeout /t 3 /nobreak
