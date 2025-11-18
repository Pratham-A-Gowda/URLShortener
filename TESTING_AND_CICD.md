# Testing & CI/CD Documentation

This document provides comprehensive information about the testing infrastructure and CI/CD pipeline for the URL Shortener project.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Code Coverage](#code-coverage)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Running Tests Locally](#running-tests-locally)
7. [Best Practices](#best-practices)

---

## Testing Overview

The project implements three levels of testing across both backend and frontend:

### Test Types

| Type | Scope | Purpose | Framework |
|------|-------|---------|-----------|
| **Unit Tests** | Individual functions/methods | Test functions in isolation with mocks | Jest (Backend), Vitest (Frontend) |
| **Integration Tests** | Component interactions | Test API endpoints and module interactions | Jest (Backend), Vitest (Frontend) |
| **System Tests** | End-to-end workflows | Test complete user journeys | Jest (Backend), Vitest (Frontend) |

### Coverage Requirements

- **Minimum threshold**: 75% for lines, branches, functions, and statements
- **Target threshold**: 80%+ coverage
- **Reports**: HTML and LCOV formats generated for each build

---

## Backend Testing

### Setup

The backend uses **Jest** as the testing framework with the following structure:

```
backend/
├── jest.config.js           # Jest configuration
├── tests/
│   ├── setup.js             # Test environment setup
│   ├── unit/
│   │   └── nanoid.test.js   # Utility function tests
│   ├── integration/
│   │   ├── auth.test.js     # Authentication routes
│   │   └── api.test.js      # API endpoints
│   └── system/
│       └── user-flow.test.js # Complete workflows
```

### Running Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run specific test type
npm test -- --testPathPattern="tests/unit"
npm test -- --testPathPattern="tests/integration"
npm test -- --testPathPattern="tests/system"

# Run with coverage
npm run test:cov

# Watch mode (during development)
npm test -- --watch
```

### Backend Test Coverage

| Test Type | Coverage | Files |
|-----------|----------|-------|
| Unit | 100% | `utils/nanoid.js` |
| Integration | 85%+ | `routes/auth.js`, `routes/api.js` |
| System | 90%+ | User workflows, error handling |

### Example Backend Test

```javascript
// Unit Test: nanoid utility
test('should generate a string of specified length', () => {
  const id = nanoid(8)
  expect(id).toHaveLength(8)
})

// Integration Test: API endpoint
test('should create a shortened URL with valid authorization', async () => {
  db.query.mockResolvedValueOnce({ rows: [] })
  db.query.mockResolvedValueOnce({ rows: [{ id: 1, alias: 'test' }] })
  
  const res = await request(app)
    .post('/api/shorten')
    .set('Authorization', `Bearer ${token}`)
    .send({ longUrl: 'https://example.com' })
  
  expect(res.status).toBe(200)
  expect(res.body).toHaveProperty('link')
})
```

---

## Frontend Testing

### Setup

The frontend uses **Vitest** with **Testing Library** for component testing:

```
frontend/
├── vitest.config.js         # Vitest configuration
├── tests/
│   ├── setup.js             # Test environment setup
│   ├── unit/
│   │   └── axiosHelper.test.js    # Utility tests
│   ├── integration/
│   │   └── ShortenForm.test.jsx   # Component tests
│   └── system/
│       └── user-flow.test.jsx     # User journey tests
```

### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run specific test type
npm test -- --run tests/unit
npm test -- --run tests/integration
npm test -- --run tests/system

# Run with coverage
npm run test:cov

# Watch mode with UI
npm run test:ui

# Watch mode in terminal
npm test
```

### Frontend Test Coverage

| Test Type | Coverage | Components |
|-----------|----------|------------|
| Unit | 100% | `utils/axiosHelper.js` |
| Integration | 80%+ | `ui/ShortenForm.jsx`, Form interactions |
| System | 85%+ | Login flow, Dashboard, Link management |

### Example Frontend Test

```javascript
// Unit Test: axiosHelper
test('should return Authorization header when token is provided', () => {
  const header = authHeader('test-token')
  expect(header.Authorization).toBe('Bearer test-token')
})

// Integration Test: Component rendering
test('should render form inputs and update on user input', () => {
  render(<ShortenForm />)
  const input = screen.getByPlaceholderText('https://example.com/my-long-url')
  fireEvent.change(input, { target: { value: 'https://example.com' } })
  expect(input.value).toBe('https://example.com')
})
```

---

## Code Coverage

### Viewing Coverage Reports

After running tests with coverage:

#### Backend Coverage
```bash
cd backend
npm run test:cov
open coverage/index.html
```

#### Frontend Coverage
```bash
cd frontend
npm run test:cov
open coverage/index.html
```

### Coverage Thresholds

**jest.config.js (Backend)**:
```javascript
coverageThreshold: {
  global: {
    branches: 75,
    functions: 75,
    lines: 75,
    statements: 75
  }
}
```

**vitest.config.js (Frontend)**:
```javascript
thresholds: {
  lines: 75,
  functions: 75,
  branches: 75,
  statements: 75
}
```

### Coverage Metrics Explained

- **Lines**: Percentage of executable lines executed
- **Functions**: Percentage of functions called
- **Branches**: Percentage of conditional branches tested
- **Statements**: Percentage of statements executed

---

## CI/CD Pipeline

### Pipeline Stages

The GitHub Actions workflow (`.github/workflows/ci.yml`) includes 5 stages:

#### 1. **Build Stage** ✅
- Install dependencies for backend and frontend
- Verify syntax and build assets
- Check for build errors

#### 2. **Test Stage** ✅
- Run unit tests (backend and frontend)
- Run integration tests
- Run system tests
- Verify all tests pass

#### 3. **Coverage Stage** ✅
- Generate code coverage reports (HTML + LCOV)
- Verify coverage meets 75% threshold
- Upload coverage artifacts

#### 4. **Lint Stage** ✅
- ESLint analysis (backend and frontend)
- Max warnings: 10
- Enforce code style standards

#### 5. **Security Stage** ✅
- NPM audit for vulnerability detection
- git-secrets scanning for exposed credentials
- Dependency security checks

### Trigger Events

The pipeline runs on:
- ✅ Push to `master` or `develop` branches
- ✅ Pull Requests to `master` or `develop`
- ❌ Not on other branches

### Pipeline Flow

```
┌─────────────────────────────────────────┐
│ Code Push / Pull Request                │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 1. BUILD: Install & Compile             │
│    - Backend dependencies               │
│    - Frontend build                     │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 2. TEST: All Test Suites                │
│    - Unit tests                         │
│    - Integration tests                  │
│    - System tests                       │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 3. COVERAGE: Measure Code Quality       │
│    - Generate HTML reports              │
│    - Verify 75%+ threshold              │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 4. LINT: Static Code Analysis           │
│    - ESLint checks                      │
│    - Code style enforcement             │
└─────────────┬───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│ 5. SECURITY: Vulnerability Scanning     │
│    - NPM audit                          │
│    - Secret detection                   │
└─────────────┬───────────────────────────┘
              │
         PASS │ FAIL
              │  │
              ▼  ▼
    ✅ Merge  ❌ Block
```

### Artifacts Generated

The pipeline generates and stores:

- **backend-coverage-report**: HTML and LCOV coverage reports
- **frontend-coverage-report**: HTML and LCOV coverage reports
- **backend-test-results**: JSON test results (optional)

Access artifacts on GitHub Actions run page → Artifacts section.

### Pull Request Integration

For each PR, the pipeline:
- Runs all tests and checks
- Comments with coverage metrics
- Shows pass/fail status on PR
- Prevents merge if checks fail

---

## Running Tests Locally

### Prerequisites

```bash
# Install Node.js 18+ and npm
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### Complete Test Run

```bash
# Run full CI locally
./scripts/run-all-tests.sh  # or create this script

# Or run individually:

# Backend
cd backend
npm install
npm test
npm run test:cov
npx eslint .

# Frontend
cd frontend
npm install
npm test
npm run test:cov
npx eslint src/

# Security
npm audit --audit-level=high
```

### Quick Test Commands

```bash
# Backend quick test
cd backend && npm test && cd ..

# Frontend quick test
cd frontend && npm test && cd ..

# Check coverage
cd backend && npm run test:cov && cd ..
cd frontend && npm run test:cov && cd ..
```

### Debugging Tests

```bash
# Backend: Run single test file
npm test -- tests/unit/nanoid.test.js

# Frontend: Watch mode with UI
npm run test:ui

# Backend: Verbose output
npm test -- --verbose

# Frontend: Show coverage details
npm run test:cov -- --reporter=text
```

---

## Best Practices

### Writing Tests

1. **Unit Tests**
   - Test one function in isolation
   - Mock external dependencies
   - Use descriptive test names
   - Keep tests small and focused

   ```javascript
   test('nanoid should generate 8-character IDs by default', () => {
     const id = nanoid()
     expect(id).toHaveLength(8)
   })
   ```

2. **Integration Tests**
   - Test multiple components working together
   - Mock external services (APIs, databases)
   - Test realistic user scenarios
   - Verify response codes and data structures

   ```javascript
   test('POST /api/shorten should create link and return alias', async () => {
     const res = await request(app)
       .post('/api/shorten')
       .set('Authorization', `Bearer ${token}`)
       .send({ longUrl: 'https://example.com' })
     
     expect(res.status).toBe(200)
     expect(res.body.link).toHaveProperty('alias')
   })
   ```

3. **System Tests**
   - Test complete user workflows
   - Verify end-to-end scenarios
   - Check error handling
   - Validate data persistence

   ```javascript
   test('user can register, login, create link, and view analytics', async () => {
     // Step 1: Register
     // Step 2: Login
     // Step 3: Create link
     // Step 4: View analytics
   })
   ```

### Naming Conventions

- Test files: `{feature}.test.js` or `{feature}.test.jsx`
- Test suites: Describe blocks by feature
- Test cases: Clear, descriptive names starting with "should"

```javascript
describe('Authentication', () => {
  describe('POST /auth/login', () => {
    test('should return token for valid credentials', () => {})
    test('should reject invalid email', () => {})
  })
})
```

### Coverage Best Practices

- ✅ Aim for 80%+ coverage on new code
- ✅ Cover happy paths and error cases
- ✅ Test edge cases and boundary conditions
- ❌ Don't test framework code or trivial getters
- ❌ Avoid 100% coverage if it means unmaintainable tests

### CI/CD Best Practices

- ✅ Commit test files with source code
- ✅ Keep tests fast (< 1 second per test)
- ✅ Fix failing tests immediately
- ✅ Review coverage reports regularly
- ✅ Monitor pipeline for flaky tests
- ❌ Don't ignore failing tests
- ❌ Don't commit code that fails linting

### Maintenance

- Update tests when code changes
- Refactor tests along with source code
- Remove obsolete tests
- Keep test dependencies updated
- Review test efficiency regularly

---

## Troubleshooting

### Tests Failing Locally But Passing in CI

- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node version: `node --version`
- Run with verbose: `npm test -- --verbose`

### Coverage Not Meeting Threshold

- Check coverage report: Open `coverage/index.html`
- Add tests for uncovered lines
- Consider removing dead code
- Review coverage thresholds (may be too strict)

### Linting Errors

```bash
# View all linting issues
npx eslint . --format=stylish

# Auto-fix issues
npx eslint . --fix

# Check warnings
npx eslint . --max-warnings=20
```

### Security Audit Warnings

```bash
# View vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# View high-severity only
npm audit --audit-level=high
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ESLint Documentation](https://eslint.org/)

---

**Last Updated**: 2025-01-18
**Maintained By**: Development Team
