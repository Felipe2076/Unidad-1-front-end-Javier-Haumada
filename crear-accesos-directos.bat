@echo off
title Crear Accesos Directos
color 0E
mode con: cols=60 lines=20

echo.
echo    ============================================
echo       Creando Accesos Directos en Escritorio
echo    ============================================
echo.

set DESKTOP=%USERPROFILE%\Desktop
set PROJECT=%~dp0

echo [1/2] Creando acceso directo para INICIAR...

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\SportClub - INICIAR.lnk'); $Shortcut.TargetPath = '%PROJECT%start.bat'; $Shortcut.WorkingDirectory = '%PROJECT%'; $Shortcut.Description = 'Iniciar SportClub'; $Shortcut.IconLocation = 'shell32.dll,13'; $Shortcut.Save()"

echo    Acceso directo creado: SportClub - INICIAR.lnk
echo.

echo [2/2] Creando acceso directo para DETENER...

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\SportClub - DETENER.lnk'); $Shortcut.TargetPath = '%PROJECT%stop.bat'; $Shortcut.WorkingDirectory = '%PROJECT%'; $Shortcut.Description = 'Detener SportClub'; $Shortcut.IconLocation = 'shell32.dll,132'; $Shortcut.Save()"

echo    Acceso directo creado: SportClub - DETENER.lnk
echo.

echo    ============================================
echo       Accesos directos creados en el escritorio!
echo    ============================================
echo.
echo    Ahora puedes:
echo      - Doble clic en "SportClub - INICIAR" para empezar
echo      - Doble clic en "SportClub - DETENER" para parar
echo.
echo    ============================================
echo.
pause
