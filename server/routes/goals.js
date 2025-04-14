import express from 'express';
const router = express.Router();

// In-memory store keyed by URL
let goalStore = {};

// GET endpoint to retrieve a goal for a given URL
router.get('/', (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL query parameter is required' });
  }
  const goal = goalStore[url];
  if (goal) {
    res.status(200).json(goal);
  } else {
    res.status(404).json({ error: 'No goal set for this URL' });
  }
});

// POST endpoint to save a goal for a given URL
router.post('/', (req, res) => {
  const { url, sustainabilityGoal } = req.body;
  if (!url || sustainabilityGoal === undefined) {
    return res.status(400).json({ error: 'URL and sustainabilityGoal are required' });
  }
  goalStore[url] = { url, sustainabilityGoal };
  res.status(200).json({ message: 'Goal saved successfully', goal: goalStore[url] });
});

export default router;
