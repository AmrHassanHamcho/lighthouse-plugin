// // lighthouse.js
// import express from 'express';
// import { launch } from 'chrome-launcher';
// import lighthouse from 'lighthouse';
// import config from '../lighthouse-config.js';

// const router = express.Router();

// router.post('/run', async (req, res) => {
//     const { url } = req.body;

//     if (!url) {
//         return res.status(400).json({ error: 'URL is required' });
//     }

//     try {
//         const chrome = await launch({ chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'] });
//         const options = {
//             port: chrome.port,
//             output: 'json',
//             logLevel: 'info',
//             onlyCategories: ['performance', 'sustainability'], // Include both categories 'performance', 
//         };

//         console.log('Running Lighthouse with Config:', config);

//         const runnerResult = await lighthouse(url, options, config);

//         console.log('Audits in Result:', Object.keys(runnerResult.lhr.audits));
//         console.log('Categories in Result:', Object.keys(runnerResult.lhr.categories));
//         console.log('Artifacts:', Object.keys(runnerResult.artifacts)); // Debug artifacts

//         await chrome.kill();

//         res.status(200).json({
//             categories: runnerResult.lhr.categories,
//             audits: runnerResult.lhr.audits,
//         });
//     } catch (error) {
//         console.error('Error running Lighthouse:', error.message);
//         res.status(500).json({ error: 'Failed to run Lighthouse' });
//     }
// });

// export default router;

// server/routes/lighthouse.js

import express from 'express';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import config from '../lighthouse-config.js';

const router = express.Router();

router.post('/run', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const chrome = await launch({
            chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage']
        });
        const options = {
            port: chrome.port,
            output: 'json',
            logLevel: 'info',
            onlyCategories: ['performance', 'sustainability'],
        };

        console.log('Running Lighthouse with Config:', config);
        const runnerResult = await lighthouse(url, options, config);
        await chrome.kill();

        // ——— Insert into DB ———
        try {
            const audits = runnerResult.lhr.audits;
            const co2Items = audits['co2-estimation-audit']?.details?.items || [];
            const totalCO2 = co2Items.reduce((sum, item) => sum + parseFloat(item.co2), 0);

            // req.app.locals.db was set in app.js
            const db = req.app.locals.db;
            await db.run(
                `INSERT INTO audits (url, measured_co2, created_at)
                 VALUES (?, ?, ?)`,
                [url, totalCO2, Math.floor(Date.now() / 1000)]
            );
        } catch (insertErr) {
            console.error('Failed to save audit to DB:', insertErr);
        }
        // ————————————————

        console.log('Audits in Result:', Object.keys(runnerResult.lhr.audits));
        console.log('Categories in Result:', Object.keys(runnerResult.lhr.categories));
        console.log('Artifacts:', Object.keys(runnerResult.artifacts));

        res.status(200).json({
            categories: runnerResult.lhr.categories,
            audits: runnerResult.lhr.audits,
        });
    } catch (error) {
        console.error('Error running Lighthouse:', error.message);
        res.status(500).json({ error: 'Failed to run Lighthouse' });
    }
});

export default router;
