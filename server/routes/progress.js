// server/routes/progress.js
import express from "express";
import { pool } from "../db.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/progress/session
 * Body: { methodId: "pomodoro", focusMinutes: 25 }
 * Saves one finished study session for the logged-in user.
 */
router.post("/session", authRequired, async (req, res) => {
  const { methodId, focusMinutes } = req.body;
  const userId = req.user.id;

  if (!methodId || !focusMinutes) {
    return res
      .status(400)
      .json({ message: "methodId and focusMinutes required" });
  }

  try {
    await pool.query(
      "INSERT INTO sessions (user_id, method_id, focus_minutes, finished_at) VALUES (?, ?, ?, NOW())",
      [userId, methodId, focusMinutes]
    );

    return res.json({ message: "Session saved" });
  } catch (err) {
    console.error("Save session error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /api/progress/summary
 * Returns last 14 days of study + streak + total minutes.
 */
router.get("/summary", authRequired, async (req, res) => {
  const userId = req.user.id;

  try {
    // history: last 14 days total minutes per day
    const [rows] = await pool.query(
      `SELECT DATE(finished_at) AS day, SUM(focus_minutes) AS totalMinutes
       FROM sessions
       WHERE user_id = ?
         AND finished_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY DATE(finished_at)
       ORDER BY day ASC`,
      [userId]
    );

    // total minutes overall (all time)
    const [totalRows] = await pool.query(
      `SELECT COALESCE(SUM(focus_minutes), 0) AS totalMinutes
       FROM sessions
       WHERE user_id = ?`,
      [userId]
    );

    const totalMinutes = totalRows[0]?.totalMinutes || 0;

    // streak calculation: consecutive days including today
    const daysSet = new Set(
      rows.map((r) =>
        r.day.toISOString().slice(0, 10) // "YYYY-MM-DD"
      )
    );

    let streak = 0;
    let current = new Date();

    while (true) {
      const key = current.toISOString().slice(0, 10);
      if (daysSet.has(key)) {
        streak += 1;
        current.setDate(current.getDate() - 1);
      } else {
        break;
      }
    }

    // format history for frontend
    const history = rows.map((r) => ({
      day: r.day.toISOString().slice(0, 10),
      totalMinutes: r.totalMinutes,
    }));

    return res.json({ history, streak, totalMinutes });
  } catch (err) {
    console.error("Summary error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
