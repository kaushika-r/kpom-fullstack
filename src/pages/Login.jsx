import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`)", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/progress";
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto border rounded-xl shadow-sm p-6 kp-card">
        <h1 className="text-xl font-bold mb-1 text-main">Login</h1>
        <p className="text-sm text-muted mb-4">
          Continue your streaks and track your Pomodoros.
        </p>

        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
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
              Password
            </label>
            <input
              type="password"
              className="w-full border rounded-md px-3 py-2 text-sm text-main bg-white/80"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mt-1 text-right">
              <Link
                to="/forgot-password"
                className="text-[11px] text-muted hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-accent py-2 rounded-md disabled:opacity-70 text-sm"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
