// Simple frontend smoke tests to lint-import main modules without building the app
// Ensures basic syntax/imports are valid. These do not mount the DOM or run Vite.

test("smoke-import App.jsx", async () => {
  // dynamic import avoids running vite plugins; we only test syntax and export
  const mod = await import("../src/App.jsx");
  expect(mod).toBeDefined();
});

test("smoke-import pages", async () => {
  const pages = [
    "../src/pages/Home.jsx",
    "../src/pages/Login.jsx",
    "../src/pages/Register.jsx",
    "../src/pages/Dashboard.jsx",
    "../src/pages/Shorten.jsx",
    "../src/pages/Analytics.jsx",
    "../src/pages/LinkDetails.jsx",
    "../src/pages/Admin.jsx",
    "../src/pages/QRPage.jsx",
  ];
  for (const p of pages) {
    const mod = await import(p);
    expect(mod).toBeDefined();
  }
});
