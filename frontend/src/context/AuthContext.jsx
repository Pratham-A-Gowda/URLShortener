import React, { createContext, useContext, useEffect, useState } from "react";
import { useApi } from "./ApiContext";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const api = useApi();
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("shortly_user") || "null")
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("shortly_token") || null
  );

  useEffect(() => {
    localStorage.setItem("shortly_user", JSON.stringify(user));
  }, [user]);
  useEffect(() => {
    if (token) localStorage.setItem("shortly_token", token);
    else localStorage.removeItem("shortly_token");
  }, [token]);

  const register = async ({ email, password }) => {
    try {
      const res = await api.post("/api/auth/register", { email, password });
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
      }
      return res.data;
    } catch (error) {
      return { error: error.response?.data?.error || "Registration failed" };
    }
  };
  const login = async ({ email, password }) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      if (res.data.token) {
        setToken(res.data.token);
        setUser(res.data.user);
      }
      return res.data;
    } catch (error) {
      return {
        error: error.response?.data?.error || "Invalid email or password",
      };
    }
  };
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
