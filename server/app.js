// import express from 'express';
// const app = express();
// import lighthouseRoute from './routes/lighthouse.js';
// import goalsRouter from './routes/goals.js';
// // Enable CORS with detailed configuration
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:4200'); // Allow only your frontend origin
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specific HTTP methods
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specific headers
//     if (req.method === 'OPTIONS') {
//         return res.sendStatus(200); // Respond OK to preflight OPTIONS request
//     }
//     next();
// });
// app.use(express.json()); // for parsing application/json
// app.use('/api/lighthouse', lighthouseRoute); // Route for Lighthouse functionalities
// // New Goal routes
// app.use('/api/goals', goalsRouter);
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

// server/app.js

import express from 'express';
import lighthouseRoute from './routes/lighthouse.js';
import goalsRouter from './routes/goals.js';
import { initDb } from './db.js';
import suggestionRouter from './routes/goalSuggestions.js';

const app = express();

// Enable CORS for your frontend origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON bodies
app.use(express.json());

// Initialize SQLite database, then start the server and mount routes
initDb()
  .then(db => {
    // Make the db available in request handlers via app.locals.db
    app.locals.db = db;

    // Mount your routes
    app.use('/api/lighthouse', lighthouseRoute);
    app.use('/api/goals/suggest', suggestionRouter);
    app.use('/api/goals', goalsRouter);

    // Start listening
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
