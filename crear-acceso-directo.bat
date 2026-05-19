@echo off
title Crear Acceso Directo en Escritorio
color 0E
mode con: cols=60 lines=15

echo.
echo    ========================================
echo       Creando Acceso Directo
echo    ========================================
echo.

set DESKTOP=%USERPROFILE%\Desktop
set PROJECT=%~dp0

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%DESKTOP%\SportClub.lnk'); $Shortcut.TargetPath = '%PROJECT%INICIAR-SPORTCLUB.bat'; $Shortcut.WorkingDirectory = '%PROJECT%'; $Shortcut.Description = 'Iniciar SportClub'; $Shortcut.IconLocation = 'shell32.dll,13'; $Shortcut.Save()"

echo    Acceso directo creado en el escritorio!
echo.
echo    Ahora puedes hacer doble clic en "SportClub.lnk"
echo    en tu escritorio para iniciar todo el sistema.
echo.
echo    ========================================
echo.
timeout /t 3 /nobreak
