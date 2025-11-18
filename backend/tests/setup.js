// Setup file for tests
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret'
process.env.PORT = '4001'
process.env.RATE_LIMIT_WINDOW_MS = '60000'
process.env.RATE_LIMIT_MAX = '1000'
