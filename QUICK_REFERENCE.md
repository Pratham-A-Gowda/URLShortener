# Quick Reference Card - Testing & CI/CD

## 🚀 Quick Start (5 minutes)

### Windows (PowerShell)
```powershell
# Install dependencies
cd backend; npm install; cd ..
cd frontend; npm install; cd ..

# Run all tests
.\scripts\run-all-tests.ps1

# View coverage
.\scripts\generate-coverage.ps1
```

### Mac/Linux (Bash)
```bash
# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Run all tests
bash scripts/run-all-tests.sh

# View coverage
bash scripts/generate-coverage.sh
```

---

## 📊 Key Commands

### Backend
```bash
cd backend

npm test                    # All tests
npm test -- --watch        # Watch mode
npm run test:cov          # With coverage report
npm test -- --testPathPattern="unit"         # Unit tests only
npm test -- --testPathPattern="integration"  # Integration only
npm test -- --testPathPattern="system"       # System only
npx eslint .              # Lint code
npx eslint . --fix        # Auto-fix linting
npm audit                 # Check vulnerabilities
```

### Frontend
```bash
cd frontend

npm test                   # All tests (watch mode)
npm test -- --run        # Single run
npm run test:cov         # With coverage report
npm run test:ui          # Interactive test UI
npm run build            # Build bundle
npx eslint src/          # Lint code
npx eslint src/ --fix    # Auto-fix linting
npm audit                # Check vulnerabilities
```

---

## 🧪 Test Structure

```
backend/tests/
├── unit/           # Single function tests
├── integration/    # API endpoint tests
└── system/         # Complete workflow tests

frontend/tests/
├── unit/           # Utility function tests
├── integration/    # Component tests
└── system/         # User journey tests
```

---

## 📈 Coverage Targets

| Metric | Threshold | Goal |
|--------|-----------|------|
| Lines | 75% | 80%+ |
| Branches | 75% | 80%+ |
| Functions | 75% | 80%+ |
| Statements | 75% | 80%+ |

**After running tests:**
- Backend: `backend/coverage/index.html`
- Frontend: `frontend/coverage/index.html`

---

## 🔄 CI/CD Pipeline Stages

```
1. BUILD       ✓ Install, compile, verify
2. TEST        ✓ Unit, integration, system tests
3. COVERAGE    ✓ Generate reports, verify 75%+
4. LINT        ✓ ESLint, max 10 warnings
5. SECURITY    ✓ npm audit, git-secrets
```

**Triggers:** Push to master/develop, Pull Requests

---

## ✅ Pre-Commit Checklist

Before committing:
```bash
# 1. Run all tests
npm test                # Backend
cd ../frontend && npm test -- --run  # Frontend

# 2. Check coverage
npm run test:cov

# 3. Fix linting
npx eslint . --fix

# 4. Check for vulnerabilities
npm audit --audit-level=high

# 5. If all green, commit!
git add .
git commit -m "Add features and tests"
```

---

## 🐛 Troubleshooting

### Tests fail locally but pass in CI
```bash
rm -rf node_modules package-lock.json
npm install
npm test
```

### Coverage below 75%
```bash
npm run test:cov
# Open coverage/index.html
# Add tests for red (uncovered) lines
```

### Linting errors
```bash
npx eslint . --format=stylish  # See all issues
npx eslint . --fix              # Auto-fix most
```

### Port already in use
```bash
# Find process using port 4000 or 4001
# Kill it or change PORT env var
PORT=4002 npm test
```

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | CI/CD pipeline definition |
| `backend/jest.config.js` | Backend testing config |
| `frontend/vitest.config.js` | Frontend testing config |
| `backend/.eslintrc.js` | Backend linting rules |
| `frontend/.eslintrc.js` | Frontend linting rules |
| `backend/tests/` | Backend test files |
| `frontend/tests/` | Frontend test files |
| `TESTING_SETUP.md` | Developer guide |
| `TESTING_AND_CICD.md` | Full documentation |
| `IMPLEMENTATION_SUMMARY.md` | Requirements checklist |

---

## 🎯 Success Criteria

✅ All tests pass
✅ Coverage ≥ 75%
✅ ESLint warnings ≤ 10
✅ No critical vulnerabilities
✅ PR checks pass

---

## 📞 Getting Help

1. **Quick issues**: Check `TESTING_SETUP.md`
2. **Detailed guide**: See `TESTING_AND_CICD.md`
3. **Requirements**: Read `IMPLEMENTATION_SUMMARY.md`
4. **Examples**: Review test files in `backend/tests/` and `frontend/tests/`

---

## ⚡ Pro Tips

1. **Fast tests**: Use `npm test -- --watch` during development
2. **Debug tests**: Run single test with `npm test -- path/to/test`
3. **Fix all lint issues**: `npx eslint . --fix` (backend/frontend)
4. **Interactive UI**: `npm run test:ui` (frontend only)
5. **Coverage trends**: Track percentage over time in CI logs

---

## 🔐 Security Commands

```bash
# Check for vulnerabilities
npm audit

# View only high-severity
npm audit --audit-level=high

# Fix issues (if available)
npm audit fix

# Scan for exposed secrets
git secrets --scan
```

---

## 📊 Reading Coverage Reports

After `npm run test:cov`:

1. Open `coverage/index.html` in browser
2. Green = covered, Red = uncovered
3. Click filenames to see line-by-line coverage
4. Aim for 80%+ coverage

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Ready for use
