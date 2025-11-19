module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom: [
    "app.js",
    "routes/**/*.js",
    "middlewares/**/*.js",
    "utils/**/*.js",
  ],
  coverageReporters: ["text", "lcov", "text-summary"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
