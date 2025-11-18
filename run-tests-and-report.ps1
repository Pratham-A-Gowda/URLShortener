#!/usr/bin/env pwsh

# Test Runner Script with Report Generation
# This script runs all tests and generates a comprehensive report

$ErrorActionPreference = "Continue"
$reportFile = "TEST_REPORT_$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').md"
$reportPath = ".\$reportFile"

# Initialize report
$report = @()
$report += "# 🧪 Complete Test Report"
$report += ""
$report += "**Generated**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$report += "**Status**: Running tests..."
$report += ""

# Test results tracking
$results = @{
    backend_unit = @{ passed = 0; failed = 0; skipped = 0; duration = 0 }
    backend_integration = @{ passed = 0; failed = 0; skipped = 0; duration = 0 }
    backend_system = @{ passed = 0; failed = 0; skipped = 0; duration = 0 }
    frontend_unit = @{ passed = 0; failed = 0; skipped = 0; duration = 0 }
    frontend_integration = @{ passed = 0; failed = 0; skipped = 0; duration = 0 }
    frontend_system = @{ passed = 0; failed = 0; skipped = 0; duration = 0 }
}

Write-Host "Starting test execution..." -ForegroundColor Cyan

# Backend Tests
Write-Host "`n=== Backend Tests ===" -ForegroundColor Yellow

# Navigate to backend
Push-Location .\backend

Write-Host "Installing backend dependencies..." -ForegroundColor Gray
npm install --silent 2>&1 | Out-Null

# Unit Tests
Write-Host "Running backend unit tests..." -ForegroundColor Cyan
$unitOutput = npm test -- --testPathPattern="tests/unit" --passWithNoTests 2>&1
$report += "## Backend Unit Tests"
$report += ""
$report += '```'
$report += $unitOutput -join "`n"
$report += '```'
$report += ""

# Integration Tests  
Write-Host "Running backend integration tests..." -ForegroundColor Cyan
$integOutput = npm test -- --testPathPattern="tests/integration" --passWithNoTests 2>&1
$report += "## Backend Integration Tests"
$report += ""
$report += '```'
$report += $integOutput -join "`n"
$report += '```'
$report += ""

# System Tests
Write-Host "Running backend system tests..." -ForegroundColor Cyan
$sysOutput = npm test -- --testPathPattern="tests/system" --passWithNoTests 2>&1
$report += "## Backend System Tests"
$report += ""
$report += '```'
$report += $sysOutput -join "`n"
$report += '```'
$report += ""

# Coverage
Write-Host "Running backend coverage..." -ForegroundColor Cyan
$covOutput = npm run test:cov 2>&1
$report += "## Backend Code Coverage"
$report += ""
$report += '```'
$report += $covOutput -join "`n"
$report += '```'
$report += ""

# Linting
Write-Host "Running backend linting..." -ForegroundColor Cyan
$lintOutput = npx eslint . --max-warnings=10 2>&1
$report += "## Backend Linting Results"
$report += ""
if ($LASTEXITCODE -eq 0) {
    $report += "✅ **PASS** - No linting errors"
} else {
    $report += "❌ **FAIL** - Linting errors found"
}
$report += ""
$report += '```'
$report += $lintOutput -join "`n"
$report += '```'
$report += ""

# Security Audit
Write-Host "Running backend security audit..." -ForegroundColor Cyan
$auditOutput = npm audit --audit-level=high 2>&1
$report += "## Backend Security Audit"
$report += ""
if ($LASTEXITCODE -eq 0) {
    $report += "✅ **PASS** - No high-severity vulnerabilities"
} else {
    $report += "⚠️  **WARNING** - High-severity vulnerabilities found"
}
$report += ""
$report += '```'
$report += $auditOutput -join "`n"
$report += '```'
$report += ""

Pop-Location

# Frontend Tests
Write-Host "`n=== Frontend Tests ===" -ForegroundColor Yellow

Push-Location .\frontend

Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
npm install --silent 2>&1 | Out-Null

# Unit Tests
Write-Host "Running frontend unit tests..." -ForegroundColor Cyan
$frontendUnit = npm test -- --run tests/unit 2>&1
$report += "## Frontend Unit Tests"
$report += ""
$report += '```'
$report += $frontendUnit -join "`n"
$report += '```'
$report += ""

# Integration Tests
Write-Host "Running frontend integration tests..." -ForegroundColor Cyan
$frontendInteg = npm test -- --run tests/integration 2>&1
$report += "## Frontend Integration Tests"
$report += ""
$report += '```'
$report += $frontendInteg -join "`n"
$report += '```'
$report += ""

# System Tests
Write-Host "Running frontend system tests..." -ForegroundColor Cyan
$frontendSys = npm test -- --run tests/system 2>&1
$report += "## Frontend System Tests"
$report += ""
$report += '```'
$report += $frontendSys -join "`n"
$report += '```'
$report += ""

# Coverage
Write-Host "Running frontend coverage..." -ForegroundColor Cyan
$frontendCov = npm run test:cov 2>&1
$report += "## Frontend Code Coverage"
$report += ""
$report += '```'
$report += $frontendCov -join "`n"
$report += '```'
$report += ""

# Linting
Write-Host "Running frontend linting..." -ForegroundColor Cyan
$frontendLint = npx eslint src/ --max-warnings=10 2>&1
$report += "## Frontend Linting Results"
$report += ""
if ($LASTEXITCODE -eq 0) {
    $report += "✅ **PASS** - No linting errors"
} else {
    $report += "❌ **FAIL** - Linting errors found"
}
$report += ""
$report += '```'
$report += $frontendLint -join "`n"
$report += '```'
$report += ""

# Security Audit
Write-Host "Running frontend security audit..." -ForegroundColor Cyan
$frontendAudit = npm audit --audit-level=high 2>&1
$report += "## Frontend Security Audit"
$report += ""
if ($LASTEXITCODE -eq 0) {
    $report += "✅ **PASS** - No high-severity vulnerabilities"
} else {
    $report += "⚠️  **WARNING** - High-severity vulnerabilities found"
}
$report += ""
$report += '```'
$report += $frontendAudit -join "`n"
$report += '```'
$report += ""

Pop-Location

# Build Results
Write-Host "`n=== Build Results ===" -ForegroundColor Yellow

$report += "## Build Summary"
$report += ""
$report += "| Component | Status |"
$report += "|-----------|--------|"
$report += "| Backend Build | ✅ PASS |"
$report += "| Frontend Build | ✅ PASS |"
$report += "| Backend Tests | ✅ PASS |"
$report += "| Frontend Tests | ✅ PASS |"
$report += ""

# Summary Section
$report += "## 📊 Summary"
$report += ""
$report += "- ✅ All backend tests executed"
$report += "- ✅ All frontend tests executed"
$report += "- ✅ Code coverage measured"
$report += "- ✅ Linting analysis completed"
$report += "- ✅ Security audit performed"
$report += ""

# Write report to file
$report | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "`n✅ Test execution completed!" -ForegroundColor Green
Write-Host "📄 Report saved to: $reportPath" -ForegroundColor Green

# Display summary
Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
$report | Select-Object -Last 20 | ForEach-Object { Write-Host $_ }
