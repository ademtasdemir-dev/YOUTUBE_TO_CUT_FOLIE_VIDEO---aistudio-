@echo off
chcp 65001 >nul
title OSI-Modell 720p Studio - Windows Installer

echo ======================================================================
echo   OSI-Modell 720p Studio & YouTube Decomposer - Installation
echo   FISI Comcave / IHK-Pruefungsvorbereitung
echo ======================================================================
echo.

set "INSTALL_DIR=%LOCALAPPDATA%\Programs\OSI-720p-Studio"
set "EXE_NAME=OSI-720p-Studio.exe"
set "CURRENT_DIR=%~dp0"

echo [1/3] Erstelle Installationsverzeichnis: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo [2/3] Kopiere Programmdateien...
if exist "%CURRENT_DIR%OSI-720p-Studio-Setup.exe" (
    copy /y "%CURRENT_DIR%OSI-720p-Studio-Setup.exe" "%INSTALL_DIR%\%EXE_NAME%" >nul
) else if exist "%CURRENT_DIR%OSI-720p-Studio.exe" (
    copy /y "%CURRENT_DIR%OSI-720p-Studio.exe" "%INSTALL_DIR%\%EXE_NAME%" >nul
) else (
    echo Warnung: Hauptprogrammdatei im aktuellen Ordner belassen.
)

echo [3/3] Erstelle Desktop- und Startmenue-Verknuepfungen...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$WshShell = New-Object -comObject WScript.Shell; ^
     $DesktopPath = [Environment]::GetFolderPath('Desktop'); ^
     $Shortcut = $WshShell.CreateShortcut(\"$DesktopPath\OSI-Modell 720p Studio.lnk\"); ^
     $Shortcut.TargetPath = '%INSTALL_DIR%\%EXE_NAME%'; ^
     $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; ^
     $Shortcut.Description = 'OSI-Modell 720p Studio & YouTube Decomposer'; ^
     $Shortcut.Save(); ^
     $ProgramsPath = [Environment]::GetFolderPath('Programs'); ^
     $StartMenuShortcut = $WshShell.CreateShortcut(\"$ProgramsPath\OSI-Modell 720p Studio.lnk\"); ^
     $StartMenuShortcut.TargetPath = '%INSTALL_DIR%\%EXE_NAME%'; ^
     $StartMenuShortcut.WorkingDirectory = '%INSTALL_DIR%'; ^
     $StartMenuShortcut.Description = 'OSI-Modell 720p Studio & YouTube Decomposer'; ^
     $StartMenuShortcut.Save();"

echo.
echo ======================================================================
echo   Installation erfolgreich abgeschlossen!
echo   Eine Verknuepfung wurde auf deinem Desktop erstellt.
echo.
echo   Starte Anwendung jetzt...
echo ======================================================================
echo.

start "" "%INSTALL_DIR%\%EXE_NAME%"
timeout /t 3 >nul
exit
