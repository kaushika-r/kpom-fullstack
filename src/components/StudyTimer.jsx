import { useEffect, useState, useRef } from "react";

const METHOD_PRESETS = {
  pomodoro: { focus: 25, break: 5, label: "Pomodoro 25/5" },
  "52-17": { focus: 52, break: 17, label: "52 / 17" },
  "90-20": { focus: 90, break: 20, label: "90 / 20" },
};

export default function StudyTimer({ methodId = "pomodoro" }) {
  const preset = METHOD_PRESETS[methodId] || METHOD_PRESETS.pomodoro;
  const [secondsLeft, setSecondsLeft] = useState(preset.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState("focus"); // "focus" or "break"
  const intervalRef = useRef(null);

  const token = localStorage.getItem("token");

  function formatTime(totalSec) {
    const m = Math.floor(totalSec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(totalSec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  function resetTimer() {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setPhase("focus");
    setSecondsLeft(preset.focus * 60);
  }

  async function saveSession(focusMinutes) {
    if (!token) {
      // guest mode: don't save, just ignore
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/progress/session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify({
            methodId,
            focusMinutes,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Save session error:", data);
      }
    } catch (err) {
      console.error("Network error saving session:", err);
    }
  }

  // Timer ticking
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Handle when timer hits 0
  useEffect(() => {
    if (secondsLeft > 0) return;

    // Focus finished
    if (phase === "focus") {
      const focusMinutes = preset.focus;
      // Save completed focus block
      saveSession(focusMinutes);

      // Auto-switch to break
      setPhase("break");
      setSecondsLeft(preset.break * 60);
      setIsRunning(false);
      alert(`Nice! Completed ${focusMinutes} mins. Time for a break.`);
    } else {
      // Break finished
      alert("Break over! Ready for the next focus block?");
      resetTimer();
    }
  }, [secondsLeft, phase, preset.focus, preset.break]);

  function handleStartPause() {
    setIsRunning((prev) => !prev);
  }

  return (
    <div className="border rounded-2xl p-5 shadow-sm max-w-sm">
      <p className="text-sm text-gray-500 mb-1">
        Method: {preset.label}
      </p>
      <p className="text-xs text-gray-400 mb-3">
        {phase === "focus" ? "Focus time" : "Break time"}
      </p>
      <p className="text-5xl font-mono font-semibold mb-4">
        {formatTime(secondsLeft)}
      </p>

      <div className="flex gap-3">
        <button
          onClick={handleStartPause}
          className="flex-1 py-2 rounded-lg bg-black text-white text-sm"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={resetTimer}
          className="flex-1 py-2 rounded-lg border text-sm"
        >
          Reset
        </button>
      </div>

      {!token && (
        <p className="text-[11px] text-gray-500 mt-3">
          You’re in guest mode. Login to save your completed focus blocks
          to Progress.
        </p>
      )}
    </div>
  );
}
