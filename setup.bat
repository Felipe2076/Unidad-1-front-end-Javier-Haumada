@echo off
title SportClub - Instalacion Inicial
color 0B
mode con: cols=80 lines=30

echo.
echo    ============================================
echo         SportClub - Instalacion Inicial
echo    ============================================
echo.

REM Verificar Node.js
echo [1/3] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo    ERROR: Node.js no esta instalado.
    echo.
    echo    Pasos para instalar:
    echo      1. Ve a https://nodejs.org/
    echo      2. Descarga la version LTS (recomendada)
    echo      3. Instala con las opciones por defecto
    echo      4. Reinicia esta terminal y ejecuta setup.bat de nuevo
    echo.
    pause
    exit /b 1
)
echo    Node.js encontrado:
node --version
npm --version
echo.

REM Instalar dependencias del backend
echo [2/3] Instalando dependencias del backend...
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 (
    echo.
    echo    ERROR: No se pudieron instalar las dependencias.
    echo    Intenta ejecutar: npm install manualmente en la carpeta backend
    echo.
    pause
    exit /b 1
)
echo    Dependencias instaladas correctamente.
echo.

REM Verificar que el servidor funciona
echo [3/3] Verificando que el servidor funciona...
start "SportClub Test" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    Servidor funcionando correctamente!
) else (
    echo    ADVERTENCIA: El servidor no respondio inmediatamente.
    echo    Esto puede ser normal, intenta start.bat para verificar.
)

taskkill /F /IM node.exe >nul 2>&1

echo.
echo    ============================================
echo         Instalacion completada exitosamente!
echo    ============================================
echo.
echo    Ahora puedes usar SportClub facilmente:
echo.
echo      1. Haz doble clic en START.BAT para iniciar
echo      2. Haz doble clic en STOP.BAT para detener
echo.
echo    ============================================
echo.
pause
