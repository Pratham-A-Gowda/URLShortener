import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Explicit ESM config to avoid require()/ESM issues on older Node setups
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
