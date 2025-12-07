// server/routes/progress.js
import express from "express";
import { pool } from "../db.js";
import { authRequired } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Save a finished study session
 * POST /api/progress/session
 * body: { methodId, focusMinutes }
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
 * Summary + history
 * GET /api/progress/summary
 */
router.get("/summary", authRequired, async (req, res) => {
  const userId = req.user.id;

  try {
    // Today
    const [todayRows] = await pool.query(
      `SELECT COALESCE(SUM(focus_minutes), 0) AS todayMinutes
       FROM sessions
       WHERE user_id = ? AND DATE(finished_at) = CURDATE()`,
      [userId]
    );
    const todayMinutes = todayRows[0]?.todayMinutes || 0;

    // Daily history for last 365 days
    const [dailyRows] = await pool.query(
      `SELECT DATE(finished_at) AS day, SUM(focus_minutes) AS totalMinutes
       FROM sessions
       WHERE user_id = ?
         AND finished_at >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
       GROUP BY DATE(finished_at)
       ORDER BY day ASC`,
      [userId]
    );

    const dailyHistory = dailyRows.map((r) => ({
      day: r.day.toISOString().slice(0, 10), // "YYYY-MM-DD"
      totalMinutes: r.totalMinutes,
    }));

    // Streak
    const daysSet = new Set(dailyHistory.map((d) => d.day));
    let streak = 0;
    let current = new Date();

    while (true) {
      const key = current.toISOString().slice(0, 10);
      if (daysSet.has(key)) {
        streak++;
        current.setDate(current.getDate() - 1);
      } else break;
    }

    // WEEK
    const now = new Date();
    const weekCutoff = new Date(now);
    weekCutoff.setDate(now.getDate() - 6);

    const weekHistory = dailyHistory.filter(
      (d) => new Date(d.day) >= weekCutoff
    );

    const weekTotalMinutes = weekHistory.reduce(
      (sum, d) => sum + d.totalMinutes,
      0
    );

    const daysWithStudy = weekHistory.length;
    const weekAverageMinutes =
      daysWithStudy > 0 ? weekTotalMinutes / daysWithStudy : 0;

    // MONTH
    const monthCutoff = new Date(now);
    monthCutoff.setDate(now.getDate() - 29);

    const monthHistory = dailyHistory.filter(
      (d) => new Date(d.day) >= monthCutoff
    );

// Year history: last 12 months aggregated by month
const yearCutoff = new Date(now);
yearCutoff.setMonth(now.getMonth() - 11);
yearCutoff.setDate(1);

// Create an ordered list of 12 months
const months = [];
let cursor = new Date(yearCutoff);

for (let i = 0; i < 12; i++) {
  const key = `${cursor.getFullYear()}-${String(
    cursor.getMonth() + 1
  ).padStart(2, "0")}`;

  months.push(key);
  cursor.setMonth(cursor.getMonth() + 1);
}

// Fill month totals
const monthTotals = {};
months.forEach((m) => (monthTotals[m] = 0));

dailyHistory.forEach((d) => {
  const dateObj = new Date(d.day);
  if (dateObj >= yearCutoff) {
    const key = `${dateObj.getFullYear()}-${String(
      dateObj.getMonth() + 1
    ).padStart(2, "0")}`;

    monthTotals[key] += d.totalMinutes;
  }
});

// Output sorted result
const yearHistory = months.map((m) => ({
  period: m,
  totalMinutes: monthTotals[m],
}));

    return res.json({
      todayMinutes,
      streak,
      weekAverageMinutes,
      weekHistory,
      monthHistory,
      yearHistory,
    });
  } catch (err) {
    console.error("Summary error", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
