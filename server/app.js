import express from 'express';
const app = express();
import lighthouseRoute from './routes/lighthouse.js';
import goalsRouter from './routes/goals.js';
// Enable CORS with detailed configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); // Allow only your frontend origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Respond OK to preflight OPTIONS request
    }
    next();
});
app.use(express.json()); // for parsing application/json
app.use('/api/lighthouse', lighthouseRoute); // Route for Lighthouse functionalities
// New Goal routes
app.use('/api/goals', goalsRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
