<#
.SYNOPSIS
    Start Project Video and inject animation code
.DESCRIPTION
    This script starts the Project Video app (if not running),
    waits for it to be ready, then sends the animation code.
    Perfect for n8n Execute Command integration.
.PARAMETER FilePath
    Path to the TSX file containing animation code
.PARAMETER Code
    Animation code as string (alternative to FilePath)
.PARAMETER NoRender
    If specified, only loads the code without auto-rendering
.PARAMETER Timeout
    Max seconds to wait for app to start (default: 60)
.EXAMPLE
    .\start-and-inject.ps1 -FilePath "animation.tsx"
.EXAMPLE
    .\start-and-inject.ps1 -Code $codeString
#>

param(
    [Parameter(Position=0)]
    [string]$FilePath,

    [Parameter()]
    [string]$Code,

    [Parameter()]
    [switch]$NoRender,

    [Parameter()]
    [int]$Timeout = 60
)

$ErrorActionPreference = "Stop"

# Configuration
$ApiUrl = "http://127.0.0.1:3333/api/inject-code"
$StatusUrl = "http://127.0.0.1:3333/api/status"
$AppPath = $PSScriptRoot  # Directory where this script is located
$AutoRender = -not $NoRender

# ============================================
# STEP 1: Get the code
# ============================================

if ($FilePath) {
    if (-not [System.IO.Path]::IsPathRooted($FilePath)) {
        $FilePath = Join-Path $PSScriptRoot $FilePath
    }

    if (-not (Test-Path $FilePath)) {
        Write-Host "Error: File not found: $FilePath" -ForegroundColor Red
        exit 1
    }

    $Code = Get-Content -Path $FilePath -Raw
    Write-Host "Reading code from: $FilePath" -ForegroundColor Cyan
}

if (-not $Code) {
    Write-Host "Error: Please provide either -FilePath or -Code parameter" -ForegroundColor Red
    exit 1
}

# ============================================
# STEP 2: Check if app is running, start if not
# ============================================

function Test-AppRunning {
    try {
        $response = Invoke-RestMethod -Uri $StatusUrl -Method Get -TimeoutSec 2
        return $response.success -eq $true
    } catch {
        return $false
    }
}

$appWasStarted = $false

if (Test-AppRunning) {
    Write-Host "Project Video is already running" -ForegroundColor Green
} else {
    Write-Host "Starting Project Video..." -ForegroundColor Yellow

    # Start the app
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "cmd.exe"
    $startInfo.Arguments = "/c cd /d `"$AppPath`" && npm run electron:dev"
    $startInfo.WorkingDirectory = $AppPath
    $startInfo.UseShellExecute = $true
    $startInfo.WindowStyle = "Minimized"

    $process = [System.Diagnostics.Process]::Start($startInfo)
    $appWasStarted = $true

    Write-Host "Waiting for app to be ready..." -ForegroundColor Yellow

    # Wait for API to be available
    $startTime = Get-Date
    $ready = $false

    while (-not $ready) {
        Start-Sleep -Seconds 2

        $elapsed = ((Get-Date) - $startTime).TotalSeconds
        if ($elapsed -gt $Timeout) {
            Write-Host "Error: Timeout waiting for app to start (${Timeout}s)" -ForegroundColor Red
            exit 1
        }

        Write-Host "  Checking... ($([int]$elapsed)s)" -ForegroundColor Gray
        $ready = Test-AppRunning
    }

    Write-Host "Project Video is ready!" -ForegroundColor Green

    # Extra delay to ensure renderer is fully loaded
    Start-Sleep -Seconds 3
}

# ============================================
# STEP 3: Send the code
# ============================================

$body = @{
    code = $Code
    autoRender = $AutoRender
} | ConvertTo-Json -Compress

try {
    Write-Host "Sending code to Project Video..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $body -ContentType "application/json"

    if ($response.success) {
        Write-Host "Success: $($response.message)" -ForegroundColor Green

        # Output JSON for n8n
        $output = @{
            success = $true
            message = $response.message
            autoRender = $AutoRender
            appStarted = $appWasStarted
        }
        $output | ConvertTo-Json
    } else {
        Write-Host "Error: $($response.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error sending code: $_" -ForegroundColor Red
    exit 1
}
