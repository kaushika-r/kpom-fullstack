// client/src/pages/Progress.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ---- format helpers ----
function minutesToHours(minutes) {
  return (minutes / 60).toFixed(1);
}

function minutesToReadable(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}`;
}

function formatYearLabel(period) {
  const [y, m] = period.split("-");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${monthNames[Number(m) - 1]}-${y}`;
}

export default function Progress() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weekHistory, setWeekHistory] = useState([]);
  const [monthHistory, setMonthHistory] = useState([]);
  const [yearHistory, setYearHistory] = useState([]);
  const [error, setError] = useState("");
  const [view, setView] = useState("week");

  // NEW toggle state
  const [showAverage, setShowAverage] = useState(true);

  const token = localStorage.getItem("token");

  // ---- weekly total & average ----
  const weekTotalMinutes = weekHistory.reduce(
    (sum, d) => sum + Number(d.totalMinutes || 0),
    0
  );

  const weekAverageHours = (() => {
    if (!weekHistory || weekHistory.length === 0) return 0;
    const avgMinutes = weekTotalMinutes / weekHistory.length;
    return Number((avgMinutes / 60).toFixed(1));
  })();

  // ---- graph data generator ----
  function getGraphData() {
    if (view === "week") {
      return weekHistory.map((d) => ({
        label: formatDateLabel(d.day),
        hours: Number(minutesToHours(d.totalMinutes)),
      }));
    }
    if (view === "month") {
      return monthHistory.map((d) => ({
        label: formatDateLabel(d.day),
        hours: Number(minutesToHours(d.totalMinutes)),
      }));
    }
    return yearHistory.map((d) => ({
      label: formatYearLabel(d.period),
      hours: Number(minutesToHours(d.totalMinutes)),
    }));
  }

  // ---- fetch summary ----
  async function fetchSummary() {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("fetch(`${import.meta.env.VITE_API_URL}/api/progress/summary`)", {
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!res.ok) {
        setError(data.message || "Failed to load summary");
        setLoading(false);
        return;
      }

      setStreak(data.streak || 0);
      setTodayMinutes(data.todayMinutes || 0);
      setWeekHistory(data.weekHistory || []);
      setMonthHistory(data.monthHistory || []);
      setYearHistory(data.yearHistory || []);
    } catch (err) {
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line
  }, []);

  if (!token) return null;

  const graphData = getGraphData();
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Your Progress{user ? `, ${user.name}` : ""}
      </h1>

      {loading && <p>Loading your stats...</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {!loading && !error && (
        <>
          {/* Summary cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {/* --- Streak card --- */}
            <div className="border rounded-xl p-4 kp-card">
              <p className="text-sm text-gray-500 mb-1">Current streak</p>
              <p className="text-3xl font-bold">
                {streak}
                <span className="ml-1">🔥</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Consecutive days you studied
              </p>
            </div>

            {/* --- Today card --- */}
            <div className="border rounded-xl p-4 bg-white">
              <p className="text-sm text-gray-500 mb-1">Today&apos;s study</p>
              <p className="text-3xl font-bold">
                {minutesToHours(todayMinutes)}
                <span className="text-base ml-1">h</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Total hours studied today
              </p>
            </div>

            {/* --- Weekly card with toggle --- */}
            <div className="border rounded-xl p-4 bg-white">
              <p className="text-sm text-gray-500 mb-1">Weekly Stats</p>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setShowAverage(true)}
                  className={`px-3 py-1 rounded-full border text-xs ${
                    showAverage ? "bg-black text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Average / day
                </button>

                <button
                  onClick={() => setShowAverage(false)}
                  className={`px-3 py-1 rounded-full border text-xs ${
                    !showAverage ? "bg-black text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Total week
                </button>
              </div>

              {showAverage ? (
                <p className="text-3xl font-bold">
                  {weekAverageHours.toFixed(1)}
                  <span className="text-base ml-1">h</span>
                </p>
              ) : (
                <p className="text-3xl font-bold">
                  {minutesToReadable(weekTotalMinutes)}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-1">
                {showAverage
                  ? "Average hours per day"
                  : "Total hours this week"}
              </p>
            </div>
          </div>

          {/* Graph */}
          <div className="border rounded-xl p-4 kp-card">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold">
                Study hours (
                {view === "week"
                  ? "last 7 days"
                  : view === "month"
                  ? "last 30 days"
                  : "last 12 months"}
                )
              </p>

              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setView("week")}
                  className={`px-3 py-1 rounded-full border ${
                    view === "week" ? "bg-black text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setView("month")}
                  className={`px-3 py-1 rounded-full border ${
                    view === "month" ? "bg-black text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView("year")}
                  className={`px-3 py-1 rounded-full border ${
                    view === "year" ? "bg-black text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Year
                </button>
              </div>
            </div>

            {graphData.length === 0 ? (
              <p className="text-sm text-gray-500">
                No sessions yet. Use your timers to start building data.
              </p>
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={graphData} margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      label={{
                        value: "Hours",
                        angle: -90,
                        position: "insideLeft",
                        offset: 10,
                        fontSize: 10,
                      }}
                    />
                    <Tooltip formatter={(v) => `${v} h`} />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#000"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
