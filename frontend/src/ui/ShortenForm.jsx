import React, { useState } from "react";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/AuthContext";

export default function ShortenForm() {
  const api = useApi();
  const { token } = useAuth();
  const apiBase = api?.defaults?.baseURL || "http://localhost:4000";
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [res, setRes] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setRes(null);
    setLoading(true);
    try {
      const r = await api.post(
        "/api/shorten",
        { longUrl, alias },
        { headers: { Authorization: "Bearer " + token } }
      );
      setRes(r.data.link);
    } catch (ex) {
      setErr(ex.response?.data?.error || ex.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label className="small">Paste your long link here</label>
      <input
        className="input"
        value={longUrl}
        onChange={(e) => setLongUrl(e.target.value)}
        placeholder="https://example.com/my-long-url"
      />
      <label className="small">Custom alias (optional)</label>
      <input
        className="input"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        placeholder="my-alias"
      />
      <div className="flex gap-3">
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create short link"}
        </button>
      </div>

      {err && (
        <div className="mt-2" style={{ color: "#ff6b6b" }}>
          {err}
        </div>
      )}
      {res && (
        <div className="mt-2 app-panel small" style={{ color: "#e6eef8" }}>
          Short URL:{" "}
          <a href={`${apiBase}/r/${res.alias}`} className="text-blue-300">
            {apiBase}/r/{res.alias}
          </a>
        </div>
      )}
    </form>
  );
}
