// // server/routes/goals.js
// import express from 'express';
// const router = express.Router();

// // In-memory or DB-backed store of user goals
// let goalStore = {};

// // GET /api/goals?url=…
// router.get('/', (req, res) => {
//   const { url } = req.query;
//   if (!url) {
//     return res
//       .status(400)
//       .json({ error: 'URL query parameter is required' });
//   }

//   // Always 200: if we have a goal, return it; otherwise return null
//   const entry = goalStore[url];
//   return res.status(200).json({
//     url,
//     sustainabilityGoal: entry ? entry.sustainabilityGoal : null
//   });
// });

// // POST /api/goals  { url, sustainabilityGoal }
// router.post('/', (req, res) => {
//   const { url, sustainabilityGoal } = req.body;
//   if (!url || sustainabilityGoal === undefined) {
//     return res
//       .status(400)
//       .json({ error: 'URL and sustainabilityGoal are required' });
//   }

//   goalStore[url] = { url, sustainabilityGoal };
//   return res
//     .status(200)
//     .json({ message: 'Goal saved successfully', goal: goalStore[url] });
// });

// export default router;
// server/routes/goals.js
import express from 'express';
const router = express.Router();

/**  
 * GET /api/goals?url=…  
 * Returns { url, sustainabilityGoal } or 404  
 */
router.get('/', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL query parameter is required' });

  const db = req.app.locals.db;
  try {
    const row = await db.get(
      `SELECT sustainability_goal AS sustainabilityGoal FROM goals WHERE url = ?`,
      [url]
    );
    if (!row) return res.status(404).json({ error: 'No goal set for this URL' });
    res.json({ url, sustainabilityGoal: row.sustainabilityGoal });
  } catch (err) {
    console.error('Failed to fetch goal:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

/**  
 * POST /api/goals  
 * Body: { url, sustainabilityGoal }  
 * Inserts or updates the goal for that URL  
 */
router.post('/', async (req, res) => {
  const { url, sustainabilityGoal } = req.body;
  if (!url || sustainabilityGoal === undefined) {
    return res.status(400).json({ error: 'URL and sustainabilityGoal are required' });
  }

  const db = req.app.locals.db;
  try {
    await db.run(
      `INSERT INTO goals (url, sustainability_goal, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(url) 
       DO UPDATE SET
         sustainability_goal = excluded.sustainability_goal,
         updated_at = excluded.updated_at;`,
      [url, sustainabilityGoal, Math.floor(Date.now() / 1000)]
    );

    res.json({ message: 'Goal saved successfully', goal: { url, sustainabilityGoal } });
  } catch (err) {
    console.error('Failed to save goal:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
