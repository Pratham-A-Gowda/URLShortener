import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(null);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);

    // Validation
    if (!email || !password) {
      setErr("Please fill in all fields");
      return;
    }
    if (!validateEmail(email)) {
      setErr("Please enter a valid email address");
      return;
    }
    if (password.length < 7) {
      setErr("Password must be at least 7 characters");
      return;
    }

    try {
      const r = await login({ email, password });
      if (r.error) {
        setErr(r.error);
      } else {
        nav("/dashboard");
      }
    } catch (error) {
      setErr("Login failed. Please check your credentials.");
    }
  };
  return (
    <div className="app-panel max-w-md mx-auto">
      <h2 className="panel-title">Log in</h2>
      <form className="grid gap-3 mt-3" onSubmit={submit}>
        <input
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button className="btn" style={{ color: "white" }}>
          Log in
        </button>
        {err && <div style={{ color: "#ff6b6b" }}>{err}</div>}
      </form>
    </div>
  );
}
