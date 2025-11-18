import React, { useEffect, useState } from "react";
import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const api = useApi();
  const { token } = useAuth();
  const navigate = useNavigate();
  const apiBase = api?.defaults?.baseURL || "http://localhost:4000";
  const [links, setLinks] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ show: false, link: null });
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadLinks();
  }, [token]);

  const loadLinks = () => {
    if (!token) return;
    api
      .get("/api/links", { headers: { Authorization: "Bearer " + token } })
      .then((r) => setLinks(r.data.links));
  };

  const openDeleteModal = (link) => {
    setDeleteModal({ show: true, link });
    setDeleteInput("");
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, link: null });
    setDeleteInput("");
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (deleteInput !== deleteModal.link.alias) {
      setDeleteError("Alias does not match!");
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/api/links/${deleteModal.link.id}`, {
        headers: { Authorization: "Bearer " + token },
        data: { alias: deleteInput },
      });
      loadLinks();
      closeDeleteModal();
    } catch (err) {
      setDeleteError(err.response?.data?.error || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <h2 className="panel-title">Dashboard</h2>
      <div className="mt-4 card-grid">
        {links.map((l) => (
          <div className="app-panel" key={l.id}>
            <div className="flex items-start justify-between mb-2">
              <div style={{ fontWeight: 700, color: "white" }}>{l.alias}</div>
              <button
                onClick={() => openDeleteModal(l)}
                className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-xs transition-all"
              >
                🗑️
              </button>
            </div>
            <div className="small break-all text-gray-400 line-clamp-2">
              {l.long_url}
            </div>
            <div className="small mt-2">
              <span className="text-cyan-400 font-semibold">{l.clicks}</span>{" "}
              Clicks
            </div>

            {/* Action buttons - properly aligned */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                className="btn small text-center"
                to={`/link/${l.id}`}
                style={{ color: "white" }}
              >
                Open
              </Link>
              <Link
                className="btn small text-center"
                to={`/analytics/${l.id}`}
                style={{ color: "white" }}
              >
                Analytics
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={closeDeleteModal}
        >
          <div
            className="app-panel max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-xl mb-2">Delete Link</h3>
            <p className="small mb-4">
              To confirm deletion, please type the alias:{" "}
              <span className="text-cyan-400 font-semibold">
                {deleteModal.link.alias}
              </span>
            </p>
            <input
              className="input w-full"
              placeholder="Type alias here"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              autoFocus
            />
            {deleteError && (
              <div className="mt-2 text-red-400 small">{deleteError}</div>
            )}
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 rounded font-semibold transition-all disabled:opacity-50"
                style={{ color: "white" }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded font-semibold transition-all"
                style={{ color: "white" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
