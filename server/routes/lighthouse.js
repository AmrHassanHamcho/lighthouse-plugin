// lighthouse.js
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
        const chrome = await launch({ chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'] });
        const options = {
            port: chrome.port,
            output: 'json',
            logLevel: 'info',
            onlyCategories: ['sustainability'], // Include both categories 'performance', 
        };

        console.log('Running Lighthouse with Config:', config);

        const runnerResult = await lighthouse(url, options, config);

        console.log('Audits in Result:', Object.keys(runnerResult.lhr.audits));
        console.log('Categories in Result:', Object.keys(runnerResult.lhr.categories));
        console.log('Artifacts:', Object.keys(runnerResult.artifacts)); // Debug artifacts

        await chrome.kill();

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
