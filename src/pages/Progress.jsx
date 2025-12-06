import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Progress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  async function fetchSummary() {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/progress/summary", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json().catch(() => ({}));

      console.log("SUMMARY response:", res.status, data); // debug

      if (res.status === 401) {
        // ❌ invalid or expired token → logout + redirect
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setError(data.message || "Failed to load summary");
        setLoading(false);
        return;
      }

      setStreak(data.streak);
      setTotalMinutes(data.totalMinutes);
      setHistory(data.history || []);
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addTestSession() {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/progress/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          methodId: "pomodoro",
          focusMinutes: 25,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        alert(data.message || "Failed to save session");
        return;
      }

      await fetchSummary();
    } catch (err) {
      alert("Network error: " + err.message);
    }
  }

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!token) {
    return null; // route guard + useEffect will handle redirect
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Progress</h1>

      {loading && <p>Loading your stats...</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="border rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Current streak</p>
              <p className="text-3xl font-bold">{streak}🔥</p>
              <p className="text-xs text-gray-500 mt-1">
                Consecutive days you studied
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Total focus time</p>
              <p className="text-3xl font-bold">
                {totalMinutes}
                <span className="text-base ml-1">min</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Lifetime minutes across all sessions
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">Days with study</p>
              <p className="text-3xl font-bold">{history.length}</p>
              <p className="text-xs text-gray-500 mt-1">
                In the last 14 days
              </p>
            </div>
          </div>

          <div className="border rounded-xl p-4 mb-4">
            <p className="font-semibold mb-2">Recent days</p>
            {history.length === 0 && (
              <p className="text-sm text-gray-500">
                No sessions yet. Add one to see your progress.
              </p>
            )}

            {history.length > 0 && (
              <ul className="text-sm space-y-1">
                {history.map((h) => (
                  <li key={h.day} className="flex justify-between">
                    <span>{h.day}</span>
                    <span>{h.totalMinutes} min</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={addTestSession}
            className="px-4 py-2 rounded-lg bg-black text-white text-sm"
          >
            + Add test Pomodoro session (25 min)
          </button>
        </>
      )}
    </div>
  );
}
