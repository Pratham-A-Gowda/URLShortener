import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <header className="header container flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="brand">
          Shortly
        </Link>
        <nav className="flex items-center gap-4">
          <Link className="navlink" to="/shorten">
            Shorten
          </Link>
          <Link className="navlink" to="/dashboard">
            Dashboard
          </Link>
          <Link className="navlink" to="/qr">
            QR
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="small" style={{ color: "white" }}>
              Hi, {user.email}
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded border"
              style={{ color: "white" }}
            >
              Logout
            </button>
            {user.is_admin && (
              <Link
                to="/admin"
                className="px-3 py-1 rounded bg-white/5 small"
                style={{ color: "white" }}
              >
                Admin
              </Link>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className="small" style={{ color: "white" }}>
              Log in
            </Link>
            <Link
              to="/register"
              className="btn small"
              style={{ color: "white" }}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
