import { useState } from "react";
import StudyTimer from "../components/StudyTimer";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");

  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  function addTask(e) {
    e.preventDefault();
    if (!taskText.trim()) return;

    setTasks((prev) => [
      ...prev,
      { id: Date.now(), text: taskText.trim(), done: false },
    ]);
    setTaskText("");
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    );
  }

  function clearCompleted() {
    setTasks((prev) => prev.filter((t) => !t.done));
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md mx-auto flex flex-col items-stretch gap-6 px-4 pb-8 pt-4">
        {/* Heading */}
        <div className="text-center mb-2">
          <p className="text-xs text-gray-500 mb-1">
            {user ? `Hi, ${user.name}` : "Kpom"}
          </p>
          <h1 className="text-2xl font-bold">Pomodoro</h1>
        </div>

        {/* Centered timer with toggle */}
        <StudyTimer />

        {/* Tasks */}
        <div className="w-full border rounded-2xl p-5 kp-card shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Tasks</h2>
            {tasks.length > 0 && (
              <button
                onClick={clearCompleted}
                className="text-[11px] text-gray-500 hover:underline"
              >
                Clear done
              </button>
            )}
          </div>

          <form onSubmit={addTask} className="flex gap-2 mb-3">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder="Add a task"
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-lg btn-accent text-xs"
            >
              Add
            </button>
          </form>

          {tasks.length === 0 ? (
            <p className="text-[11px] text-gray-500">
              Simple list for this session.
            </p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={task.done}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span
                    className={`flex-1 ${
                      task.done
                        ? "line-through text-gray-400"
                        : "text-main"

                    }`}
                  >
                    {task.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
