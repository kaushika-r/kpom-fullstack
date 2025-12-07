// src/pages/ForgotPassword.jsx
import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!email || !newPassword || !confirmNew) {
      setError("Fill all fields.");
      return;
    }
    if (newPassword !== confirmNew) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, newPassword }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Could not reset password.");
      } else {
        setMsg(
          data.message ||
            "If this email is registered, the password has been updated."
        );
        setNewPassword("");
        setConfirmNew("");
      }
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto border rounded-xl shadow-sm p-6 kp-card">
        <h1 className="text-xl font-bold mb-1 text-main">
          Forgot password
        </h1>
        <p className="text-sm text-muted mb-4">
          Set a new password for your account.
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}
        {msg && (
          <p className="text-sm text-emerald-600 mb-3">{msg}</p>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs text-muted mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded-md px-3 py-2 text-sm text-main bg-white/80"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">
              New password
            </label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 text-sm text-main bg-white/80"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-muted mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 text-sm text-main bg-white/80"
              value={confirmNew}
              onChange={(e) => setConfirmNew(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-accent py-2 rounded-md disabled:opacity-70 text-sm"
          >
            {loading ? "Updating..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}
