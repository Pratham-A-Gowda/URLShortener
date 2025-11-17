import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";

export default function LinkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const { token } = useAuth();
  const apiBase = api?.defaults?.baseURL || "http://localhost:4000";
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    // Fetch link details
    api
      .get("/api/links", { headers: { Authorization: "Bearer " + token } })
      .then((r) => {
        const foundLink = r.data.links.find((l) => l.id === id);
        if (foundLink) {
          setLink(foundLink);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, token]);

  const copyToClipboard = () => {
    const shortUrl = `${apiBase}/r/${link.alias}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.getElementById("qr-canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `qr-${link.alias}.png`;
      downloadLink.href = url;
      downloadLink.click();
    }
  };

  if (loading) {
    return (
      <div className="app-panel text-center">
        <div className="small">Loading...</div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="app-panel text-center">
        <div className="small text-red-400">Link not found</div>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn mt-4"
          style={{ color: "white" }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/dashboard")}
        className="mb-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded transition-all"
        style={{ color: "white" }}
      >
        ← Back to Dashboard
      </button>

      <div className="app-panel">
        <h2 className="panel-title">{link.alias}</h2>

        {/* Long URL */}
        <div className="mt-4">
          <div className="small text-gray-400 mb-2">Original URL:</div>
          <div className="p-3 bg-white/5 rounded break-all text-white">
            {link.long_url}
          </div>
        </div>

        {/* Short URL */}
        <div className="mt-4">
          <div className="small text-gray-400 mb-2">Short URL:</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 p-3 bg-white/5 rounded text-cyan-300 font-semibold">
              {apiBase}/r/{link.alias}
            </div>
            <button
              onClick={copyToClipboard}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded transition-all"
              style={{ color: "white" }}
            >
              {copied ? "✓ Copied" : "📋 Copy"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/5 rounded">
            <div className="text-cyan-400 font-bold text-2xl">
              {link.clicks}
            </div>
            <div className="small">Total Clicks</div>
          </div>
          <div className="p-3 bg-white/5 rounded">
            <div className="text-white font-bold text-lg">
              {new Date(link.created_at).toLocaleDateString()}
            </div>
            <div className="small">Created</div>
          </div>
        </div>

        {/* QR Code (only if generated with QR) */}
        {link.has_qr && (
          <div className="mt-6">
            <div className="small text-gray-400 mb-3">QR Code:</div>
            <div className="text-center p-6 bg-white rounded-lg">
              <QRCodeCanvas
                id="qr-canvas"
                value={`${apiBase}/r/${link.alias}`}
                size={240}
                level="H"
              />
            </div>
            <button
              onClick={downloadQR}
              className="btn w-full mt-4"
              style={{ color: "white" }}
            >
              💾 Download QR Code
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <a
            className="btn flex-1"
            href={`${apiBase}/r/${link.alias}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "white" }}
          >
            🔗 Open Link
          </a>
          <button
            onClick={() => navigate(`/analytics/${link.id}`)}
            className="btn flex-1"
            style={{ color: "white" }}
          >
            📊 View Analytics
          </button>
        </div>
      </div>
    </div>
  );
}
