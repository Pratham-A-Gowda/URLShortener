import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./tests/setup.js",
		coverage: {
			provider: "v8",
			reporter: ["text", "text-summary", "html", "lcov"],
			exclude: [
				"node_modules/",
				"tests/",
				"**/*.test.jsx",
				"**/vite.config.js",
				"**/vite.config.mjs",
				"src/main.jsx",
				"src/index.css",
				"src/App.jsx",
				"src/pages/**",
				"src/ui/**",
				"src/context/**",
			],
			thresholds: {
				lines: 75,
				functions: 75,
				branches: 75,
				statements: 75,
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
});
