@echo off
setlocal EnableDelayedExpansion

REM =============================================
REM n8n-send.bat - Send code to KERA Project Video
REM Automatically starts the app if not running
REM =============================================

set "INPUT=%~1"
set "OUTPUT=%~2"
set "APP_PATH=%~dp0"

REM Check if API is running
curl -s -o nul -w "%%{http_code}" http://127.0.0.1:3333/api/status | findstr "200" >nul
if errorlevel 1 (
    echo [n8n-send] App not running, starting...
    
    REM Start the app in background
    start "" /min cmd /c "cd /d "%APP_PATH%" && npm run electron:dev"
    
    REM Wait for API to be ready (max 60 seconds)
    set /a "timeout=0"
    :waitloop
    timeout /t 2 /nobreak >nul
    set /a "timeout+=2"
    
    curl -s -o nul -w "%%{http_code}" http://127.0.0.1:3333/api/status | findstr "200" >nul
    if errorlevel 1 (
        if !timeout! lss 60 (
            echo [n8n-send] Waiting for app... (!timeout!s)
            goto waitloop
        ) else (
            echo [n8n-send] ERROR: App failed to start after 60 seconds
            exit /b 1
        )
    )
    
    echo [n8n-send] App is ready!
    REM Extra wait for window to fully load
    timeout /t 3 /nobreak >nul
)

REM Escape backslashes for JSON
set "INPUT=!INPUT:\=\\!"
set "OUTPUT=!OUTPUT:\=\\!"

REM Send the request
echo [n8n-send] Sending file to render...
curl -X POST http://127.0.0.1:3333/api/inject-file -H "Content-Type: application/json" -d "{\"filePath\":\"!INPUT!\",\"outputPath\":\"!OUTPUT!\",\"autoRender\":true}"

echo.
echo [n8n-send] Request sent!
