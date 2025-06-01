#!/usr/bin/env node
import axios from 'axios';

async function main() {
  const [,, url] = process.argv;
  if (!url) {
    console.error('Usage: node check-goal.js <url>');
    process.exit(1);
  }

  try {
    // 1) Run the Lighthouse audit
    const auditRes = await axios.post(
      'http://localhost:3000/api/lighthouse/run',
      { url }
    );
    const co2Items = auditRes.data.audits['co2-estimation-audit']?.details.items || [];
    const measured   = co2Items.reduce((sum, item) => sum + parseFloat(item.co2 || item.value || 0), 0);

    // 2) Try fetching a saved goal
    let target = null;
    try {
      const goalRes = await axios.get(
        `http://localhost:3000/api/goals?url=${encodeURIComponent(url)}`
      );
      target = parseFloat(goalRes.data.sustainabilityGoal);
      console.log(`🔖 Using saved goal: ${target.toFixed(4)} g`);
    } catch (e) {
      if (e.response?.status === 404) {
        // 3) No saved goal → fall back to history-based suggestion
        const suggestRes = await axios.get(
          `http://localhost:3000/api/goals/suggest?url=${encodeURIComponent(url)}`
        );
        if (suggestRes.data.suggestedGoal != null) {
          target = parseFloat(suggestRes.data.suggestedGoal);
          console.log(`🔮 Using history-based suggestion: ${target.toFixed(4)} g`);
        } else {
          // 4) Finally, fall back to your 10% static
          const measuredStatic = measured;
          target = +(measuredStatic * 0.9).toFixed(4);
          console.log(`⚠️ Not enough history → 10% static fallback: ${target.toFixed(4)} g`);
        }
      } else {
        throw e;
      }
    }

    // 5) Compare
    console.log(`📊 Measured: ${measured.toFixed(4)} g  vs.  Target: ${target.toFixed(4)} g`);
    if (measured > target) {
      console.error(`🚨 FAIL: ${measured.toFixed(4)} g > ${target.toFixed(4)} g`);
      process.exit(1);
    } else {
      console.log(`✅ PASS: ${measured.toFixed(4)} g ≤ ${target.toFixed(4)} g`);
      process.exit(0);
    }

  } catch (err) {
    console.error('Error in check-goal:', err.response?.data ?? err.message);
    process.exit(1);
  }
}

main();
