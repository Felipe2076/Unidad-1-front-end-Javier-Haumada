@echo off
title SportClub - Iniciando Servidor
color 0A

echo.
echo ========================================
echo    SportClub - Iniciando Sistema
echo ========================================
echo.

echo [1/3] Iniciando servidor backend...
start "SportClub Backend" cmd /k "cd /d %~dp0backend && node server.js"

timeout /t 3 /nobreak >nul

echo [2/3] Verificando conexion...
echo.

echo [3/3] Abriendo navegador...
start "" "%~dp0login.html"

echo.
echo ========================================
echo    SportClub listo para usar!
echo ========================================
echo.
echo  Cuentas de prueba:
echo    Admin:   admin1@demo.cl / 12345678
echo    Coach:   coach1@demo.cl / 12345678
echo    User:    usuario1@demo.cl / 12345678
echo.
echo  NO CIERRES la ventana del backend.
echo  Para detener el servidor, cierra esa ventana.
echo.
pause
