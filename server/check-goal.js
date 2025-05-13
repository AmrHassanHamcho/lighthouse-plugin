#!/usr/bin/env node
import axios from 'axios';

async function main() {
  const [,, url] = process.argv;
  if (!url) {
    console.error('Usage: node check-goal.js <url>');
    process.exit(1);
  }

  try {
    // 1) run the audit
    const auditRes = await axios.post(
      'http://localhost:3000/api/lighthouse/run',
      { url }
    );
    const co2Audit = auditRes.data.audits['co2-estimation-audit'];
    const totalCO2 = co2Audit.details.items
      .reduce((sum, item) => sum + parseFloat(item.co2 || 0), 0);

    // 2) fetch the saved goal
    const goalRes = await axios.get(
      `http://localhost:3000/api/goals?url=${encodeURIComponent(url)}`
    );
    const savedGoal = goalRes.data.sustainabilityGoal;
    if (savedGoal === undefined) {
      console.error('No goal set for this URL');
      process.exit(1);
    }

    // 3) compare and exit
    if (totalCO2 > savedGoal) {
      console.error(
        `🚨 CO₂ (${totalCO2.toFixed(2)} mg) exceeds goal (${savedGoal} mg)`
      );
      process.exit(1);
    } else {
      console.log(
        `✅ CO₂ (${totalCO2.toFixed(2)} mg) is within goal (${savedGoal} mg)`
      );
      process.exit(0);
    }
  } catch (err) {
    console.error('Error checking goal:', err.response?.data ?? err.message);
    process.exit(1);
  }
}

main();
