import { Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Progress from "./pages/Progress";

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple top nav for all pages */}
      <header className="w-full border-b bg-white">
        <nav className="max-w-5xl mx-auto flex items-center justify-between py-4 px-4">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Kpom
          </Link>
          <div className="flex gap-3 text-sm">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/progress" className="hover:underline">
              Progress
            </Link>
            {token ? (
              <button
                className="hover:underline"
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
                <Link to="/signup" className="hover:underline">
                  Signup
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected */}
          <Route
            path="/progress"
            element={token ? <Progress /> : <Navigate to="/login" />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}
