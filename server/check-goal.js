#!/usr/bin/env node
import axios from 'axios';
import { initDb } from './db.js';

async function main() {
  const [, , rawUrl] = process.argv;
  const url = rawUrl || 'https://apw.bss.design/';
  console.log(`🔍 Auditing URL: ${url}`);

  try {
    // 1) Run the Lighthouse audit
    const auditRes = await axios.post(
      'http://localhost:3000/api/lighthouse/run',
      { url }
    );
    const co2Items =
      auditRes.data?.audits?.['co2-estimation-audit']?.details?.items || [];
    const measured = co2Items
      .reduce((sum, item) => sum + parseFloat(item.co2 || item.value || 0), 0);

    let target;

    try {
      // 2) Try fetching saved goal
      const goalRes = await axios.get(
        `http://localhost:3000/api/goals?url=${encodeURIComponent(url)}`
      );
      target = parseFloat(goalRes.data.sustainabilityGoal);
      console.log(`🔖 Using saved goal from DB: ${target.toFixed(4)} g`);
    } catch (e) {
      if (e.response?.status === 404) {
        // 3) Adaptive/history logic
        const historyRes = await axios.get(
          `http://localhost:3000/api/history?url=${encodeURIComponent(url)}`
        );
        const history = historyRes.data || [];
        if (history.length >= 2) {
          const Cprev   = parseFloat(history[0].co2);
          const Clatest = parseFloat(history[1].co2);
          const r       = (Cprev - Clatest) / Cprev;
          target = +(Clatest * (1 - r)).toFixed(4);
          console.log(`🧠 Adaptive goal based on history: ${target.toFixed(4)} g`);
        } else {
          // 4) Fallback: 10% reduction
          target = +(measured * 0.9).toFixed(4);
          console.log(`⚠️ No history → fallback goal = 90% of current = ${target.toFixed(4)} g`);
        }
      } else {
        throw e;
      }
    }

    // 5) Print measured & target
    console.log(`📊 Measured CO₂: ${measured.toFixed(4)} g`);
    console.log(`🎯 Target CO₂:   ${target.toFixed(4)} g`);

    // 6) Pass or fail
    if (measured > target) {
      console.error(`🚨 FAIL: ${measured.toFixed(4)} g > ${target.toFixed(4)} g`);
      // **On failure: fetch last audit from DB**
      const db = await initDb();
      const row = await db.get(
        'SELECT measured_co2, created_at FROM audits WHERE url = ? ORDER BY created_at DESC LIMIT 1',
        url
      );
      if (row) {
        console.log(`🔄 Last stored audit: ${row.measured_co2.toFixed(4)} g (at ${new Date(row.created_at).toISOString()})`);
      } else {
        console.log('ℹ️  No previous audit record found in database.');
      }
      process.exit(1);
    }

    console.log(`✅ PASS: ${measured.toFixed(4)} g ≤ ${target.toFixed(4)} g`);
    process.exit(0);

  } catch (err) {
    console.error('Error in check-goal:', err.response?.data ?? err.message);
    process.exit(1);
  }
}

main();
