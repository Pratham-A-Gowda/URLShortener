# URL Shortener - Complete Test & CI Suite Runner (Windows)
# This script runs all tests, coverage, and linting checks

Write-Host "===========================================" -ForegroundColor Blue
Write-Host "URL Shortener - Test & CI Suite Runner" -ForegroundColor Blue
Write-Host "===========================================" -ForegroundColor Blue
Write-Host ""

$PASSED = 0
$FAILED = 0

function Run-Test {
  param(
    [string]$Name,
    [string]$Command
  )
  
  Write-Host "▶ $Name..." -ForegroundColor Cyan
  try {
    Invoke-Expression $Command | Out-Null
    Write-Host "✓ $Name passed" -ForegroundColor Green
    Write-Host ""
    $global:PASSED++
  }
  catch {
    Write-Host "✗ $Name failed" -ForegroundColor Red
    Write-Host ""
    $global:FAILED++
  }
}

# Backend Tests
Write-Host "╔════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║       BACKEND TESTS            ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

Push-Location backend

Run-Test "Backend: Install Dependencies" "npm install"
Run-Test "Backend: Unit Tests" "npm test -- --testPathPattern='tests/unit' --passWithNoTests"
Run-Test "Backend: Integration Tests" "npm test -- --testPathPattern='tests/integration' --passWithNoTests"
Run-Test "Backend: System Tests" "npm test -- --testPathPattern='tests/system' --passWithNoTests"
Run-Test "Backend: Code Coverage" "npm run test:cov"
Run-Test "Backend: ESLint" "npx eslint . --max-warnings=10"
Run-Test "Backend: Security Audit" "npm audit --audit-level=high"

Pop-Location

# Frontend Tests
Write-Host "╔════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║      FRONTEND TESTS            ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

Push-Location frontend

Run-Test "Frontend: Install Dependencies" "npm install"
Run-Test "Frontend: Unit Tests" "npm test -- --run tests/unit"
Run-Test "Frontend: Integration Tests" "npm test -- --run tests/integration"
Run-Test "Frontend: System Tests" "npm test -- --run tests/system"
Run-Test "Frontend: Code Coverage" "npm run test:cov"
Run-Test "Frontend: Build" "npm run build"
Run-Test "Frontend: ESLint" "npx eslint src/ --max-warnings=10"
Run-Test "Frontend: Security Audit" "npm audit --audit-level=high"

Pop-Location

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║       TEST SUMMARY             ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""
Write-Host "Passed: $PASSED" -ForegroundColor Green
Write-Host "Failed: $FAILED" -ForegroundColor Red
Write-Host ""

if ($FAILED -eq 0) {
  Write-Host "✓ All tests passed!" -ForegroundColor Green
  Write-Host ""
  Write-Host "📊 Coverage Reports:"
  Write-Host "  Backend:  backend/coverage/index.html"
  Write-Host "  Frontend: frontend/coverage/index.html"
  exit 0
}
else {
  Write-Host "✗ Some tests failed!" -ForegroundColor Red
  exit 1
}
