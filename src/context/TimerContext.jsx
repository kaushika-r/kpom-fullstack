// src/context/TimerContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";

const DURATIONS = {
  focus: 25, // minutes
  break: 5,  // minutes
};

const TimerContext = createContext(null);

function formatTime(totalSec) {
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(totalSec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function TimerProvider({ children }) {
  const [mode, setMode] = useState("focus"); // "focus" | "break"
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  function stopTimer() {
    setIsRunning(false);
    clearInterval(intervalRef.current);
  }

  function switchMode(newMode) {
    setMode(newMode);
    setSecondsLeft(DURATIONS[newMode] * 60);
    setIsRunning(false);
  }

  function resetCurrentMode() {
    setSecondsLeft(DURATIONS[mode] * 60);
    setIsRunning(false);
    clearInterval(intervalRef.current);
  }

  async function saveFocusSession() {
    // Only save focus sessions, and only if logged in
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("fetch(`${import.meta.env.VITE_API_URL}/api/progress/session`)", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          methodId: "pomodoro",
          focusMinutes: DURATIONS.focus,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Save session error:", data);
      }
    } catch (err) {
      console.error("Network error saving session:", err);
    }
  }

  // Global ticking logic
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

    stopTimer();

    if (mode === "focus") {
      // Save session, auto-switch to break
      saveFocusSession();
      alert("Focus block done ✔");
      setMode("break");
      setSecondsLeft(DURATIONS.break * 60);
    } else {
      alert("Break over ✨");
      setMode("focus");
      setSecondsLeft(DURATIONS.focus * 60);
    }
  }, [secondsLeft, mode]);

  const value = {
    mode,
    secondsLeft,
    isRunning,
    durations: DURATIONS,
    formatTime,
    startPause: () => setIsRunning((prev) => !prev),
    switchMode,
    resetCurrentMode,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error("useTimer must be used within TimerProvider");
  }
  return ctx;
}
