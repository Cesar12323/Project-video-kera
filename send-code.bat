@echo off
setlocal enabledelayedexpansion

REM ============================================
REM Project Video - Code Injection Script
REM Send animation code to the running app
REM ============================================

set API_URL=http://127.0.0.1:3333/api/inject-code
set AUTO_RENDER=true

REM Check if curl is available
where curl >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: curl is not installed or not in PATH
    exit /b 1
)

REM Parse arguments
set CODE_FILE=
set CODE_DIRECT=

:parse_args
if "%~1"=="" goto check_args
if /i "%~1"=="--file" (
    set CODE_FILE=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="--code" (
    set CODE_DIRECT=%~2
    shift
    shift
    goto parse_args
)
if /i "%~1"=="--no-render" (
    set AUTO_RENDER=false
    shift
    goto parse_args
)
if /i "%~1"=="--help" (
    goto show_help
)
REM If no flag, treat as file path
if "!CODE_FILE!"=="" if "!CODE_DIRECT!"=="" (
    set CODE_FILE=%~1
)
shift
goto parse_args

:check_args
REM If no arguments, prompt for code file
if "!CODE_FILE!"=="" if "!CODE_DIRECT!"=="" (
    echo.
    echo Project Video - Code Injection
    echo ==============================
    echo.
    set /p CODE_FILE="Enter path to TSX file (or press Enter to type code): "

    if "!CODE_FILE!"=="" (
        echo.
        echo Paste your code below. When done, type END on a new line and press Enter:
        echo.
        set CODE_DIRECT=
        :read_code
        set /p LINE=
        if "!LINE!"=="END" goto send_code
        set CODE_DIRECT=!CODE_DIRECT!!LINE!\n
        goto read_code
    )
)

:send_code
REM Read code from file if specified
if not "!CODE_FILE!"=="" (
    if not exist "!CODE_FILE!" (
        echo ERROR: File not found: !CODE_FILE!
        exit /b 1
    )

    REM Read file content and escape for JSON
    set CODE=
    for /f "usebackq delims=" %%a in ("!CODE_FILE!") do (
        set "LINE=%%a"
        REM Escape backslashes and quotes
        set "LINE=!LINE:\=\\!"
        set "LINE=!LINE:"=\"!"
        set "CODE=!CODE!!LINE!\n"
    )
) else (
    set CODE=!CODE_DIRECT!
)

REM Check if app is running
curl -s -o nul -w "%%{http_code}" %API_URL:inject-code=status% | findstr "200" >nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Project Video app is not running or API not accessible
    echo Make sure the app is running before sending code.
    exit /b 1
)

REM Create temp JSON file for the request
set TEMP_JSON=%TEMP%\project-video-code-%RANDOM%.json
echo {"code": "!CODE!", "autoRender": !AUTO_RENDER!} > "!TEMP_JSON!"

REM Send code to API
echo Sending code to Project Video...
curl -s -X POST -H "Content-Type: application/json" -d @"!TEMP_JSON!" %API_URL%

REM Clean up
del "!TEMP_JSON!" 2>nul

echo.
echo Done!

exit /b 0

:show_help
echo.
echo Project Video - Code Injection Script
echo ======================================
echo.
echo Usage:
echo   send-code.bat [OPTIONS] [FILE]
echo.
echo Options:
echo   --file FILE     Path to TSX file containing animation code
echo   --code "CODE"   Animation code as string (escaped)
echo   --no-render     Only load code, don't auto-render
echo   --help          Show this help message
echo.
echo Examples:
echo   send-code.bat animation.tsx
echo   send-code.bat --file "C:\path\to\animation.tsx"
echo   send-code.bat --file animation.tsx --no-render
echo.
echo n8n Integration:
echo   Use "Execute Command" node with:
echo   Command: send-code.bat --file "{{$json.filePath}}"
echo.
exit /b 0
