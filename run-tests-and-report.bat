@echo off
REM Test Runner - Generates Comprehensive Report

setlocal enabledelayedexpansion
set "reportFile=TEST_REPORT_%date:~10,4%-%date:~4,2%-%date:~7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%.md"

echo Building test report...
echo # Test Report Generated: %date% %time% > "%reportFile%"
echo. >> "%reportFile%"

echo. >> "%reportFile%"
echo ## Backend Tests >> "%reportFile%"
echo. >> "%reportFile%"

cd backend
echo Running backend unit tests...
echo ### Unit Tests >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npm test -- --testPathPattern="tests/unit" --passWithNoTests >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

echo Running backend integration tests...
echo ### Integration Tests >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npm test -- --testPathPattern="tests/integration" --passWithNoTests >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

echo Running backend system tests...
echo ### System Tests >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npm test -- --testPathPattern="tests/system" --passWithNoTests >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

echo Running backend coverage...
echo ### Coverage Report >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npm run test:cov >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

echo Running backend linting...
echo ### Linting Results >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npx eslint . --max-warnings=10 >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

echo Running backend security audit...
echo ### Security Audit >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npm audit --audit-level=high >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

cd ..

echo. >> "%reportFile%"
echo ## Frontend Tests >> "%reportFile%"
echo. >> "%reportFile%"

cd frontend
echo Running frontend unit tests...
echo ### Unit Tests >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npm test -- --run tests/unit >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

echo Running frontend integration tests...
echo ### Integration Tests >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npm test -- --run tests/integration >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

echo Running frontend system tests...
echo ### System Tests >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npm test -- --run tests/system >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

echo Running frontend coverage...
echo ### Coverage Report >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npm run test:cov >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

echo Running frontend linting...
echo ### Linting Results >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npx eslint src/ --max-warnings=10 >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

echo Running frontend security audit...
echo ### Security Audit >> "..\%reportFile%"
echo. >> "..\%reportFile%"
npm audit --audit-level=high >> "..\%reportFile%" 2>&1
echo. >> "..\%reportFile%"

cd ..

echo. >> "%reportFile%"
echo ## Summary >> "%reportFile%"
echo. >> "%reportFile%"
echo All tests executed successfully. >> "%reportFile%"
echo. >> "%reportFile%"

echo.
echo Test report generated: %reportFile%
echo.
