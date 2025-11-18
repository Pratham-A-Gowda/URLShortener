import React from "react";
export default function Footer() {
  return (
    <footer className="py-8 text-center small opacity-70">
      <div className="container">© {new Date().getFullYear()} Shortly</div>
    </footer>
  );
}
