// src/components/MiniTimer.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useTimer } from "../context/TimerContext";

export default function MiniTimer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, secondsLeft, isRunning, formatTime, startPause } = useTimer();

  // Do NOT show on Home page ("/")
  if (location.pathname === "/") return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="kp-card border rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 text-xs">
        <button
          onClick={() => navigate("/")}
          className="text-[10px] px-2 py-1 rounded-full border border-accent text-main hover:bg-white/70"
        >
          Open
        </button>

        <div className="flex flex-col items-start">
          <span className="uppercase tracking-wide text-[10px] text-muted mb-0.5">
            {mode === "focus" ? "Focus" : "Break"}
          </span>
          <span className="font-mono font-semibold text-base">
            {formatTime(secondsLeft)}
          </span>
        </div>

        <button
          onClick={startPause}
          className="px-2 py-1 rounded-full btn-accent text-[10px] min-w-[54px] text-center"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
      </div>
    </div>
  );
}
