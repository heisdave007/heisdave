# Start the development server and open Chrome
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Opening Chrome in 2 seconds..." -ForegroundColor Yellow

# Start the dev server in background
Start-Process npm -ArgumentList "run dev" -WorkingDirectory $PSScriptRoot

# Wait 2 seconds for server to start
Start-Sleep -Seconds 2

# Open Chrome
$chromeUrl = "http://localhost:4000"
Write-Host "Opening $chromeUrl in Chrome..." -ForegroundColor Cyan
Start-Process "chrome" -ArgumentList $chromeUrl

Write-Host "Server is running! Refresh Chrome to see your changes." -ForegroundColor Green
