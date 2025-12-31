@echo off
REM ============================================
REM n8n Video Render - Full automation
REM
REM Usage in n8n Execute Command:
REM   n8n-render.bat -Code "your tsx code here"
REM   n8n-render.bat -Code "code" -FileName "my-video"
REM ============================================

set SCRIPT_DIR=%~dp0
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%n8n-render.ps1" %*
exit /b %ERRORLEVEL%
