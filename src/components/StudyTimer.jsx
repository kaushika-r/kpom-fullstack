// src/components/StudyTimer.jsx
import { useTimer } from "../context/TimerContext";

export default function StudyTimer() {
  const {
    mode,
    secondsLeft,
    isRunning,
    durations,
    formatTime,
    startPause,
    switchMode,
    resetCurrentMode,
  } = useTimer();

  const token = localStorage.getItem("token");

  return (
    <div className="w-full border rounded-2xl p-6 shadow-sm kp-card text-center">
      {/* Toggle */}
      <div className="flex justify-center mb-4 text-xs">
        <div className="inline-flex border rounded-full p-1 bg-gray-50/70">
          <button
            type="button"
            onClick={() => switchMode("focus")}
            className={`px-3 py-1 rounded-full ${
              mode === "focus" ? "bg-black text-white" : "text-gray-700"
            }`}
          >
            Focus
          </button>
          <button
            type="button"
            onClick={() => switchMode("break")}
            className={`px-3 py-1 rounded-full ${
              mode === "break" ? "bg-black text-white" : "text-gray-700"
            }`}
          >
            Break
          </button>
        </div>
      </div>

      <p className="text-[11px] text-muted mb-3">
        {mode === "focus"
          ? `${durations.focus} min focus`
          : `${durations.break} min break`}
      </p>

      <p className="text-5xl sm:text-6xl font-mono font-semibold mb-4">
        {formatTime(secondsLeft)}
      </p>

      <div className="flex gap-3">
        <button
          onClick={startPause}
          className="flex-1 py-2 rounded-lg btn-accent text-sm"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={resetCurrentMode}
          className="flex-1 py-2 rounded-lg border text-sm"
        >
          Reset
        </button>
      </div>

      {!token && (
        <p className="text-[11px] text-muted mt-3">
          Login to save focus blocks.
        </p>
      )}
    </div>
  );
}
