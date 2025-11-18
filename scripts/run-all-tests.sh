#!/bin/bash

# URL Shortener - Complete Test & CI Suite Runner
# This script runs all tests, coverage, and linting checks

set -e

echo "=========================================="
echo "URL Shortener - Test & CI Suite Runner"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

run_test() {
  local name=$1
  local command=$2
  
  echo -e "${BLUE}▶ ${name}...${NC}"
  if eval "$command"; then
    echo -e "${GREEN}✓ ${name} passed${NC}\n"
    ((PASSED++))
  else
    echo -e "${RED}✗ ${name} failed${NC}\n"
    ((FAILED++))
  fi
}

# Backend Tests
echo -e "${BLUE}╔════════════════════════════════╗${NC}"
echo -e "${BLUE}║       BACKEND TESTS            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════╝${NC}"
echo ""

cd backend

run_test "Backend: Install Dependencies" "npm install"
run_test "Backend: Unit Tests" "npm test -- --testPathPattern='tests/unit' --passWithNoTests"
run_test "Backend: Integration Tests" "npm test -- --testPathPattern='tests/integration' --passWithNoTests"
run_test "Backend: System Tests" "npm test -- --testPathPattern='tests/system' --passWithNoTests"
run_test "Backend: Code Coverage" "npm run test:cov"
run_test "Backend: ESLint" "npx eslint . --max-warnings=10"
run_test "Backend: Security Audit" "npm audit --audit-level=high"

cd ..

# Frontend Tests
echo -e "${BLUE}╔════════════════════════════════╗${NC}"
echo -e "${BLUE}║      FRONTEND TESTS            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════╝${NC}"
echo ""

cd frontend

run_test "Frontend: Install Dependencies" "npm install"
run_test "Frontend: Unit Tests" "npm test -- --run tests/unit"
run_test "Frontend: Integration Tests" "npm test -- --run tests/integration"
run_test "Frontend: System Tests" "npm test -- --run tests/system"
run_test "Frontend: Code Coverage" "npm run test:cov"
run_test "Frontend: Build" "npm run build"
run_test "Frontend: ESLint" "npx eslint src/ --max-warnings=10"
run_test "Frontend: Security Audit" "npm audit --audit-level=high"

cd ..

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════╗${NC}"
echo -e "${BLUE}║       TEST SUMMARY             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  echo "📊 Coverage Reports:"
  echo "  Backend:  backend/coverage/index.html"
  echo "  Frontend: frontend/coverage/index.html"
  exit 0
else
  echo -e "${RED}✗ Some tests failed!${NC}"
  exit 1
fi
