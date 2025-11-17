import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <h1 className="text-2xl font-semibold">Phase 0: Frontend scaffold</h1>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
