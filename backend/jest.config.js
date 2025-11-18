module.exports = {
	testEnvironment: "node",
	collectCoverage: true,
	collectCoverageFrom: [
		"**/*.js",
		"!**/node_modules/**",
		"!**/tests/**",
		"!jest.config.js",
		"!coverage/**",
		"!index.js",
		"!db.js",
		"!routes/**",
		"!middlewares/**",
		"!seed_admin.js",
		"!add_has_qr.js",
	],
	coverageThreshold: {
		global: {
			branches: 75,
			functions: 75,
			lines: 75,
			statements: 75,
		},
	},
	coverageReporters: ["text", "text-summary", "html", "lcov"],
	testMatch: [
		"**/tests/unit/**/*.test.js",
		"**/tests/integration/**/*.test.js",
		"**/tests/system/**/*.test.js",
	],
	verbose: true,
};
