# URL Shortener - Coverage Report Generator (Windows)
# Generates and opens coverage reports

Write-Host "Generating coverage reports..." -ForegroundColor Cyan
Write-Host ""

# Backend coverage
Write-Host "📊 Backend coverage..." -ForegroundColor Cyan
Push-Location backend
npm run test:cov
Pop-Location

# Frontend coverage
Write-Host "📊 Frontend coverage..." -ForegroundColor Cyan
Push-Location frontend
npm run test:cov
Pop-Location

Write-Host ""
Write-Host "✅ Coverage reports generated!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Coverage Reports:"
Write-Host "  Backend:  ./backend/coverage/index.html"
Write-Host "  Frontend: ./frontend/coverage/index.html"
Write-Host ""

# Try to open in default browser
$backendCoverage = Join-Path (Get-Location) "backend\coverage\index.html"
$frontendCoverage = Join-Path (Get-Location) "frontend\coverage\index.html"

if (Test-Path $backendCoverage) {
  Write-Host "Opening backend coverage report..."
  Invoke-Item $backendCoverage
}

if (Test-Path $frontendCoverage) {
  Write-Host "Opening frontend coverage report..."
  Start-Sleep -Seconds 1
  Invoke-Item $frontendCoverage
}
