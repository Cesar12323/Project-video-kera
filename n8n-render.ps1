<#
.SYNOPSIS
    n8n Video Render - Complete automation script
.DESCRIPTION
    1. Saves TSX code to input folder
    2. Starts Project Video app
    3. Sends code and renders to output folder
.PARAMETER Code
    Animation code as string
.PARAMETER FileName
    Name for the output file (default: animation)
.EXAMPLE
    .\n8n-render.ps1 -Code $codeFromAgent -FileName "my-video"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Code,

    [Parameter()]
    [string]$FileName = "animation"
)

$ErrorActionPreference = "Stop"

# ============================================
# CONFIGURATION - EDIT THESE PATHS FOR YOUR SYSTEM
# ============================================
# TODO: Update these paths to match your system
$BaseFolder = "<your-workflow-folder>"  # e.g., "C:\Users\YourName\Documents\n8n-workflows"
$InputFolder = Join-Path $BaseFolder "input"
$OutputFolder = Join-Path $BaseFolder "output"
$AppPath = "<path-to-project-video>"  # e.g., "C:\Users\YourName\project-video"

$ApiUrl = "http://127.0.0.1:3333/api/inject-code"
$StatusUrl = "http://127.0.0.1:3333/api/status"

# Generate unique filename with timestamp
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$TsxFileName = "${FileName}_${Timestamp}.tsx"
$TsxFilePath = Join-Path $InputFolder $TsxFileName

# ============================================
# STEP 1: Save code to input folder
# ============================================
Write-Host "Saving code to: $TsxFilePath" -ForegroundColor Cyan
$Code | Out-File -FilePath $TsxFilePath -Encoding UTF8
Write-Host "File saved!" -ForegroundColor Green

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

if (Test-AppRunning) {
    Write-Host "Project Video is already running" -ForegroundColor Green
} else {
    Write-Host "Starting Project Video..." -ForegroundColor Yellow

    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "cmd.exe"
    $startInfo.Arguments = "/c cd /d `"$AppPath`" && npm run electron:dev"
    $startInfo.WorkingDirectory = $AppPath
    $startInfo.UseShellExecute = $true
    $startInfo.WindowStyle = "Minimized"

    [System.Diagnostics.Process]::Start($startInfo) | Out-Null

    Write-Host "Waiting for app to be ready..." -ForegroundColor Yellow

    $timeout = 60
    $startTime = Get-Date

    while (-not (Test-AppRunning)) {
        Start-Sleep -Seconds 2
        $elapsed = ((Get-Date) - $startTime).TotalSeconds
        if ($elapsed -gt $timeout) {
            Write-Host "Error: Timeout waiting for app" -ForegroundColor Red
            exit 1
        }
        Write-Host "  Waiting... ($([int]$elapsed)s)" -ForegroundColor Gray
    }

    Write-Host "App is ready!" -ForegroundColor Green
    Start-Sleep -Seconds 3
}

# ============================================
# STEP 3: Send code with output path
# ============================================
$OutputVideoPath = Join-Path $OutputFolder "${FileName}_${Timestamp}.mp4"

$body = @{
    code = $Code
    autoRender = $true
    outputPath = $OutputVideoPath
} | ConvertTo-Json -Compress

try {
    Write-Host "Sending code to Project Video..." -ForegroundColor Cyan
    $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $body -ContentType "application/json"

    if ($response.success) {
        Write-Host "Success!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Files:" -ForegroundColor White
        Write-Host "  Input:  $TsxFilePath" -ForegroundColor Gray
        Write-Host "  Output: $OutputVideoPath" -ForegroundColor Gray

        # Return JSON for n8n
        @{
            success = $true
            inputFile = $TsxFilePath
            outputFile = $OutputVideoPath
            message = $response.message
        } | ConvertTo-Json
    } else {
        Write-Host "Error: $($response.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
