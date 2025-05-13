// routes/goalSuggestions.js
import express from 'express';
const router = express.Router();

/**
 * GET /api/goals/suggest?url=…
 * Looks up your audit history in SQLite and returns:
 *   { suggestedGoal: <g>, fallbackReduction: <r> }
 */
router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL query parameter is required' });

  const db = req.app.locals.db;
  try {
    // Fetch last two audits for this URL (newest first)
    const rows = await db.all(
      `SELECT measured_co2 FROM audits
       WHERE url = ?
       ORDER BY created_at DESC
       LIMIT 2`,
      [url]
    );
    if (rows.length < 2) {
      // Not enough history → use 10% as fallback
      return res.json({
        suggestedGoal: null,
        fallbackReduction: 0.10
      });
    }

    const [latest, previous] = rows;
    const reduction = (previous.measured_co2 - latest.measured_co2) / previous.measured_co2;
    const adaptive = latest.measured_co2 * (1 - reduction);

    return res.json({
      suggestedGoal: +adaptive.toFixed(4),    // in grams
      fallbackReduction: null
    });
  } catch (err) {
    console.error('Error computing suggestion:', err);
    res.status(500).json({ error: 'Failed to compute suggestion' });
  }
});

export default router;
