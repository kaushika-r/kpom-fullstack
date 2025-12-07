import { useEffect } from "react";
import { Routes, Route, Navigate, NavLink } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";

import { TimerProvider } from "./context/TimerContext";
import MiniTimer from "./components/MiniTimer";

export default function App() {
  const token = localStorage.getItem("token");

  // Load saved theme on app start
  useEffect(() => {
    const saved = localStorage.getItem("kpom-theme") || "default";
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const linkClass = ({ isActive }) =>
    `hover:underline ${
      isActive ? "font-semibold text-main" : "text-muted"
    }`;

  return (
    <TimerProvider>
      <div className="min-h-screen bg-page text-main">
        {/* Top nav */}
        <header className="w-full bg-nav">
          <nav className="max-w-5xl mx-auto flex items-center justify-between py-4 px-4">
            <NavLink
              to="/"
              className="text-2xl font-bold tracking-tight text-main"
            >
              Kpom
            </NavLink>
            <div className="flex gap-4 text-sm items-center">
              <NavLink to="/" className={linkClass} end>
                Home
              </NavLink>
              <NavLink to="/progress" className={linkClass}>
                Progress
              </NavLink>
              <NavLink to="/settings" className={linkClass}>
                Settings
              </NavLink>
              {token ? (
                <button
                  className="text-muted hover:underline text-sm"
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
                >
                  Logout
                </button>
              ) : (
                <>
                  <NavLink to="/login" className={linkClass}>
                    Login
                  </NavLink>
                  <NavLink to="/signup" className={linkClass}>
                    Signup
                  </NavLink>
                </>
              )}
            </div>
          </nav>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected */}
            <Route
              path="/progress"
              element={token ? <Progress /> : <Navigate to="/login" />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Picture-in-picture mini timer (hidden on Home) */}
        <MiniTimer />
      </div>
    </TimerProvider>
  );
}
