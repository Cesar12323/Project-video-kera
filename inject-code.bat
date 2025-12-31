@echo off
REM ============================================
REM Project Video - Simple Code Injection
REM Wrapper for PowerShell script
REM ============================================

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Run PowerShell script with all arguments
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%send-code.ps1" %*

exit /b %ERRORLEVEL%
