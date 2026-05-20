@echo off
title SportClub - Iniciando Sistema
color 0A
mode con: cols=70 lines=25

echo.
echo    ============================================
echo         SportClub - Sistema Deportivo
echo    ============================================
echo.

REM Paso 1: Verificar Node.js
echo [1/5] Verificando Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo    ERROR: Node.js no esta instalado.
    echo    Descargalo desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo    Node.js encontrado:
node --version
echo.

REM Paso 2: Matar procesos anteriores del puerto 3000
echo [2/5] Limpiando procesos anteriores...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul
echo    Proceso limpiado.
echo.

REM Paso 3: Instalar dependencias si es necesario
echo [3/5] Verificando dependencias del backend...
if not exist "%~dp0backend\node_modules" (
    echo    Instalando dependencias...
    cd /d "%~dp0backend"
    call npm install >nul 2>&1
    echo    Dependencias instaladas.
) else (
    echo    Dependencias ya instaladas.
)
echo.

REM Paso 4: Iniciar backend
echo [4/5] Iniciando servidor backend...
cd /d "%~dp0backend"
start "SportClub Backend" /min cmd /c "echo Servidor iniciado en http://localhost:3000 && echo. && node server.js"

REM Esperar a que el backend este listo
echo    Esperando que el servidor este listo...
set /a attempts=0
:wait_for_server
timeout /t 1 /nobreak >nul
set /a attempts+=1
curl -s http://localhost:3000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo    Servidor conectado!
    goto server_ready
)
if %attempts% geq 10 (
    echo    ADVERTENCIA: El servidor tardó mas de lo esperado.
    echo    Revisa la ventana del backend para ver errores.
    goto server_ready
)
goto wait_for_server

:server_ready
echo.

REM Paso 5: Abrir navegador
echo [5/5] Abriendo navegador...
timeout /t 1 /nobreak >nul
start "" "%~dp0login.html"

echo.
echo    ============================================
echo         SportClub listo para usar!
echo    ============================================
echo.
echo    Cuentas de prueba:
echo      Admin:   admin1@demo.cl / 12345678
echo      Coach:   coach1@demo.cl / 12345678
echo      User:    usuario1@demo.cl / 12345678
echo.
echo    El indicador verde confirma conexion al backend.
echo    La ventana negra del backend debe permanecer abierta.
echo.
echo    ============================================
echo.
timeout /t 3 /nobreak
