#!/bin/bash

# URL Shortener - Quick Development Test Script
# Run this during development for quick feedback

set -e

echo "Running quick tests..."
echo ""

# Quick backend tests
echo "🧪 Backend tests..."
cd backend
npm test -- --passWithNoTests --silent
cd ..

# Quick frontend tests
echo "🧪 Frontend tests..."
cd frontend
npm test -- --run --silent
cd ..

echo ""
echo "✅ Quick tests completed!"
