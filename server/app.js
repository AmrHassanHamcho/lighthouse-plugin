import express from 'express';
const app = express();
import lighthouseRoute from './routes/lighthouse.js';

app.use(express.json()); // for parsing application/json
app.use('/api/lighthouse', lighthouseRoute); // Route for Lighthouse functionalities

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
