#!/bin/bash

# URL Shortener - Coverage Report Generator
# Generates and opens coverage reports

echo "Generating coverage reports..."
echo ""

# Backend coverage
echo "📊 Backend coverage..."
cd backend
npm run test:cov
cd ..

# Frontend coverage
echo "📊 Frontend coverage..."
cd frontend
npm run test:cov
cd ..

echo ""
echo "✅ Coverage reports generated!"
echo ""
echo "📁 Coverage Reports:"
echo "  Backend:  ./backend/coverage/index.html"
echo "  Frontend: ./frontend/coverage/index.html"
echo ""

# Try to open in default browser (works on macOS and Linux)
if command -v open &> /dev/null; then
  echo "Opening backend coverage report..."
  open backend/coverage/index.html
  sleep 1
  echo "Opening frontend coverage report..."
  open frontend/coverage/index.html
fi
