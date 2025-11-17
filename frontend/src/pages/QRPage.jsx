import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/AuthContext";

export default function QRPage() {
  const [alias, setAlias] = useState("");
  const [url, setUrl] = useState("");
  const [generatedAlias, setGeneratedAlias] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();
  const { token } = useAuth();
  const apiBase = api?.defaults?.baseURL || "http://localhost:4000";

  const generate = async () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(
        "/api/shorten",
        { longUrl: url, alias, hasQR: true },
        { headers: { Authorization: "Bearer " + token } }
      );
      const link = res.data.link;
      setGeneratedAlias(link.alias);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create short link");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qr-${generatedAlias}.png`;
      link.href = url;
      link.click();
    }
  };

  const copyToClipboard = () => {
    const shortUrl = `${apiBase}/r/${generatedAlias}`;
    navigator.clipboard.writeText(shortUrl);
  };

  const reset = () => {
    setUrl("");
    setAlias("");
    setGeneratedAlias("");
    setError(null);
  };
  return (
    <div className="app-panel max-w-md mx-auto">
      <h2 className="panel-title">QR Code Generator</h2>

      {!generatedAlias ? (
        <>
          <input
            className="input mt-3"
            placeholder="Enter your long URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <input
            className="input mt-2"
            placeholder="Custom alias (optional)"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
          <div className="mt-3">
            <button
              className="btn w-full"
              onClick={generate}
              disabled={loading}
              style={{ color: "white" }}
            >
              {loading ? "Generating..." : "Create QR Code"}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300">
              {error}
            </div>
          )}
        </>
      ) : (
        <div className="mt-4">
          <div className="text-center p-6 bg-white rounded-lg">
            <QRCodeCanvas
              id="qr-canvas"
              value={`${apiBase}/r/${generatedAlias}`}
              size={240}
              level="H"
            />
          </div>

          <div className="mt-4 p-3 bg-white/5 rounded">
            <div className="small text-gray-400 mb-1">Your short link:</div>
            <div className="flex items-center justify-between">
              <div className="text-cyan-300 font-semibold break-all">
                {apiBase}/r/{generatedAlias}
              </div>
              <button
                onClick={copyToClipboard}
                className="ml-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-all"
                style={{ color: "white" }}
              >
                📋 Copy
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={downloadQR}
              className="btn flex-1"
              style={{ color: "white" }}
            >
              💾 Download QR
            </button>
            <button
              onClick={reset}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-semibold transition-all"
              style={{ color: "white" }}
            >
              Create Another
            </button>
          </div>

          <div className="mt-3 text-center small text-gray-400">
            ✓ QR Code saved! You can also view it in your Dashboard.
          </div>
        </div>
      )}
    </div>
  );
}
