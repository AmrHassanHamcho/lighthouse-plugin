import express from 'express';
import { launch } from 'chrome-launcher'; // Updated import
import lighthouse from 'lighthouse';

const router = express.Router();

router.post('/run', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).send({ error: 'URL is required' });
    }

    try {
        const chrome = await launch({ chromeFlags: ['--headless'] });
        const options = { logLevel: 'info', output: 'json', onlyCategories: ['performance'], port: chrome.port };

        const runnerResult = await lighthouse(url, options);

        await chrome.kill();
        return res.status(200).send({ lighthouseResult: runnerResult.lhr });
    } catch (error) {
        console.error('Error running Lighthouse', error);
        return res.status(500).send({ error: 'Failed to run Lighthouse' });
    }
});

export default router;
