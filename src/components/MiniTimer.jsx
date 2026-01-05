import { useLocation, useNavigate } from "react-router-dom";
import { useTimer } from "../context/TimerContext";
import { useEffect, useState, useRef } from "react";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function MiniTimer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, secondsLeft, isRunning, formatTime, startPause } = useTimer();

  const cardRef = useRef(null);

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    mouseX: 0,
    mouseY: 0,
    x: 0,
    y: 0,
  });

  // ✅ Initial position (fully visible, bottom-right)
  useEffect(() => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const SAFE_MARGIN = 199; // 👈 only change

    setPos({
      x: window.innerWidth - rect.width - SAFE_MARGIN,
      y: window.innerHeight - rect.height - SAFE_MARGIN,
    });
  }, []);

  function handleMouseDown(e) {
    e.preventDefault();
    setDragging(true);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      x: pos.x,
      y: pos.y,
    });
  }

  useEffect(() => {
    if (!dragging) return;

    function onMove(e) {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const dx = e.clientX - dragStart.mouseX;
      const dy = e.clientY - dragStart.mouseY;

      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      setPos({
        x: clamp(dragStart.x + dx, 0, maxX),
        y: clamp(dragStart.y + dy, 0, maxY),
      });
    }

    function onUp() {
      setDragging(false);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging, dragStart]);

  return (
    <div
      className={`fixed z-40 ${location.pathname === "/" ? "hidden" : ""}`}
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        ref={cardRef}
        className="kp-card border rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3 text-xs cursor-move"
        onMouseDown={handleMouseDown}
      >
        <button
          onMouseDown={(e) => e.stopPropagation()}
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
          onMouseDown={(e) => e.stopPropagation()}
          onClick={startPause}
          className="px-2 py-1 rounded-full btn-accent text-[10px] min-w-[54px] text-center"
        >
          {isRunning ? "Pause" : "Start"}
        </button>
      </div>
    </div>
  );
}
