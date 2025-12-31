<#
.SYNOPSIS
    Send animation code to Project Video app
.DESCRIPTION
    This script sends TSX animation code to the running Project Video app
    for rendering. Can be used with n8n Execute Command node.
.PARAMETER FilePath
    Path to the TSX file containing animation code
.PARAMETER Code
    Animation code as string (alternative to FilePath)
.PARAMETER NoRender
    If specified, only loads the code without auto-rendering
.EXAMPLE
    .\send-code.ps1 -FilePath "animation.tsx"
.EXAMPLE
    .\send-code.ps1 -Code $codeString -NoRender
#>

param(
    [Parameter(Position=0)]
    [string]$FilePath,

    [Parameter()]
    [string]$Code,

    [Parameter()]
    [string]$OutputPath,

    [Parameter()]
    [switch]$NoRender
)

$ApiUrl = "http://127.0.0.1:3333/api/inject-code"
$StatusUrl = "http://127.0.0.1:3333/api/status"
$AutoRender = -not $NoRender

# Read code from file or use provided code
if ($FilePath -and (Test-Path $FilePath)) {
    $Code = Get-Content -Path $FilePath -Raw
    Write-Host "Reading code from: $FilePath"
} elseif (-not $Code) {
    Write-Host "Error: Please provide either -FilePath or -Code parameter" -ForegroundColor Red
    exit 1
}

if (-not $Code) {
    Write-Host "Error: No code provided" -ForegroundColor Red
    exit 1
}

# Check if app is running
try {
    $status = Invoke-RestMethod -Uri $StatusUrl -Method Get -TimeoutSec 5
    if (-not $status.success) {
        Write-Host "Error: Project Video app is not responding correctly" -ForegroundColor Red
        exit 1
    }
    Write-Host "Project Video app is running" -ForegroundColor Green
} catch {
    Write-Host "Error: Project Video app is not running or API not accessible" -ForegroundColor Red
    Write-Host "Make sure the app is running before sending code." -ForegroundColor Yellow
    exit 1
}

# Prepare JSON body
$bodyObj = @{
    code = $Code
    autoRender = $AutoRender
}
if ($OutputPath) {
    $bodyObj.outputPath = $OutputPath
}
$body = $bodyObj | ConvertTo-Json -Compress

# Send code to API
try {
    Write-Host "Sending code to Project Video..."
    $response = Invoke-RestMethod -Uri $ApiUrl -Method Post -Body $body -ContentType "application/json"

    if ($response.success) {
        Write-Host "Success: $($response.message)" -ForegroundColor Green

        # Output for n8n
        $output = @{
            success = $true
            message = $response.message
            autoRender = $AutoRender
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
