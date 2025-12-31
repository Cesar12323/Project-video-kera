@echo off
REM ============================================
REM Project Video - Start App and Inject Code
REM Full automation script for n8n integration
REM ============================================

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Run PowerShell script with all arguments
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start-and-inject.ps1" %*

exit /b %ERRORLEVEL%
