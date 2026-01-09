import { useState, useEffect } from "react";

const THEMES = [
  { id: "default", name: "Clean light", preview: ["#111827", "#f3f4f6", "#ffffff"] },
  { id: "barbie", name: "Barbie pastel", preview: ["#ec4899", "#fff1f5", "#fdf2f8"] },
  { id: "mint", name: "Soft mint", preview: ["#16a34a", "#ecfdf3", "#dcfce7"] },
  { id: "lavender", name: "Soft lavender", preview: ["#8b5cf6", "#f5f3ff", "#ede9fe"] },
  { id: "spidey", name: "Spidey bold", preview: ["#ef4444", "#020617", "#111827"] },
  { id: "invincible", name: "Invincible bold", preview: ["#facc15", "#020617", "#0f172a"] },
  { id: "peach", name: "Peachy", preview: ["#fb923c", "#fff7ed", "#ffedd5"] },
  { id: "ocean", name: "Ocean deep", preview: ["#0ea5e9", "#0b1120", "#0f172a"] },
  { id: "forest", name: "Forest", preview: ["#16a34a", "#052e16", "#064e3b"] },
  { id: "noir", name: "Soft dark", preview: ["#f9fafb", "#020617", "#020617"] },
];

export default function Settings() {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  const [activeTheme, setActiveTheme] = useState("default");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNew, setConfirmNew] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [openPassword, setOpenPassword] = useState(false);
  const [openTheme, setOpenTheme] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kpom-theme") || "default";
    setActiveTheme(saved);
  }, []);

  function applyTheme(id) {
    setActiveTheme(id);
    localStorage.setItem("kpom-theme", id);
    document.documentElement.setAttribute("data-theme", id);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwMessage("");
    setPwError("");

    if (!currentPassword || !newPassword || !confirmNew) {
      setPwError("Fill all fields.");
      return;
    }
    if (newPassword !== confirmNew) {
      setPwError("New passwords do not match.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setPwError("You must be logged in to change password.");
      return;
    }

    setPwLoading(true);

    try {
      const res = await fetch("fetch(`${import.meta.env.VITE_API_URL}/api/auth/change-password`)", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setPwError(data.message || "Could not change password.");
      } else {
        setPwMessage("Password updated successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNew("");
      }
    } catch (err) {
      setPwError("Network error: " + err.message);
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1 text-main">Settings</h1>
        <p className="text-sm text-muted">
          View your profile, change password, and customise Kpom.
        </p>
      </div>

      {/* Profile always visible */}
      <section className="kp-card p-4 rounded-2xl border shadow-sm">
        <h2 className="text-sm font-semibold mb-3 text-main">Profile</h2>
        {user ? (
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-muted mr-2">Name:</span>
              <span className="text-main">{user.name}</span>
            </p>
            <p>
              <span className="text-muted mr-2">Email:</span>
              <span className="text-main">{user.email}</span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            You&apos;re in guest mode. Log in to see your profile.
          </p>
        )}
      </section>

      {/* Change password - collapsible */}
      <section className="kp-card rounded-2xl border shadow-sm">
        <button
          type="button"
          onClick={() => setOpenPassword((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm"
        >
          <span className="font-semibold text-main">Change password</span>
          <span className="text-xs text-muted">
            {openPassword ? "Hide" : "Open"}
          </span>
        </button>

        {openPassword && (
          <div className="px-4 pb-4">
            {!user ? (
              <p className="text-sm text-muted">
                Log in to change your password.
              </p>
            ) : (
              <>
                {pwError && (
                  <p className="text-xs text-red-600 mb-2">{pwError}</p>
                )}
                {pwMessage && (
                  <p className="text-xs text-emerald-600 mb-2">
                    {pwMessage}
                  </p>
                )}
                <form className="space-y-3" onSubmit={handleChangePassword}>
                  <div>
                    <label className="block text-xs text-muted mb-1">
                      Current password
                    </label>
                    <input
                      type="password"
                      className="w-full border rounded-md px-3 py-2 text-sm text-main bg-white/80"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
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
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="px-4 py-2 rounded-md btn-accent text-xs disabled:opacity-70"
                  >
                    {pwLoading ? "Updating..." : "Update password"}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </section>

      {/* Theme - collapsible */}
      <section className="kp-card rounded-2xl border shadow-sm">
        <button
          type="button"
          onClick={() => setOpenTheme((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm"
        >
          <span className="font-semibold text-main">Theme</span>
          <span className="text-xs text-muted">
            {openTheme ? "Hide" : "Open"}
          </span>
        </button>

        {openTheme && (
          <div className="px-4 pb-4">
            <p className="text-xs text-muted mb-3">
              Pick a mood. This changes colours across the app.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => applyTheme(theme.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left text-sm transition
                    ${
                      activeTheme === theme.id
                        ? "border-accent ring-1 ring-[var(--kp-accent)]/40"
                        : "border-gray-200"
                    }
                  `}
                >
                  <div>
                    <p className="font-medium text-main">{theme.name}</p>
                    <p className="text-[11px] text-muted mt-1">
                      {theme.id === "barbie"
                        ? "Pink and playful"
                        : theme.id === "spidey"
                        ? "Comic red & dark"
                        : theme.id === "invincible"
                        ? "Yellow hero vibes"
                        : theme.id === "noir"
                        ? "Calm dark mode"
                        : "Soft, readable colours"}
                    </p>
                  </div>
                  <div className="flex -space-x-1">
                    {theme.preview.map((c, i) => (
                      <span
                        key={i}
                        className="w-5 h-5 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
