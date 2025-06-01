# Sustainable DevOps Lighthouse Plugin

**Master’s Thesis Project**  
**Title:** Sustainable DevOps: Goal-Oriented Carbon Footprint Reduction for Web Applications  
**Author:** Amr Hamcho  
**Institution:** Norwegian University of Science and Technology (NTNU), Department of Computer Science  
**Date:** June 2025

---

## Overview

This repository contains the code and configuration for a Sustainability-Focused DevOps prototype, developed as part of a Master’s thesis in Computer Science. Its purpose is to measure and track the CO₂ emissions of web pages, store historical data in a SQLite database, and compute adaptive “next iteration” carbon-reduction goals based on past performance. Key features include:

- **Automated Lighthouse audits** (performance + sustainability)  
- **SQLite database** to persist each audit’s measured CO₂  
- **Adaptive goal-suggestion logic** (based on historical audits)  
- **Goal storage and retrieval** via REST endpoints  
- **CI/CD integration** (GitHub Actions) to fail builds if CO₂ exceeds saved goals  

---

## Prerequisites

- **Node.js** ≥ 18.x (LTS)  
- **npm** ≥ 9.x  
- **Angular CLI** ≥ 19.x (optional, for local front-end development)  
- **SQLite 3** (or the `sqlite3` CLI)  
- **GitHub Actions** (for CI/CD)

---

## Getting Started

### Clone & Install

```bash
git clone https://github.com/your-username/SustainableDevOps-LighthousePlugin.git
cd SustainableDevOps-LighthousePlugin
```
# Install both front-end and back-end dependencies
npm ci

_____________________________________________________________________________________________

## Start Express server

npm run start:server

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

_____________________________________________________________________________________________
##DB demo 

Ensure you have SQLite installed (e.g. sqlite3 --version).

The code will create (or open) sustainability.db automatically when the server starts.
If you want to inspect the DB manually, run:

````bash
sqlite3 sustainability.db
````
Example:
````bash
SELECT id, url, measured_co2, created_at  FROM audits LIMIT 5;
SELECT id, url, measured_co2, datetime(created_at, 'unixepoch')        FROM audits ORDER BY id DESC LIMIT 5;
````

_____________________________________________________________________________________________
##Project Structure

SustainableDevOps-LighthousePlugin/
├── angular.json
├── package.json
├── README.md
├── sustainability.db           # SQLite database (auto-created)
├── server/
│   ├── app.js                  # Express entry point
│   ├── db.js                   # SQLite initialization
│   ├── routes/
│   │   ├── lighthouse.js       # POST /api/lighthouse/run
│   │   ├── goals.js            # GET/POST /api/goals
│   │   └── goalSuggestions.js  # GET /api/goals/suggest
│   └── lighthouse-config.js    # Custom Lighthouse audits (resource breakdown + CO₂)
├── src/                        # Angular (standalone) front-end
│   ├── app/
│   │   ├── services/
│   │   │   ├── lighthouse.service.ts   # calls POST /api/lighthouse/run
│   │   │   ├── goal.service.ts         # calls GET/POST /api/goals
│   │   │   └── suggestion.service.ts   # calls GET /api/goals/suggest
│   │   └── components/
│   │       └── lighthouse-audit/
│   │           ├── lighthouse-audit.component.html
│   │           ├── lighthouse-audit.component.scss
│   │           └── lighthouse-audit.component.ts
│   ├── main.ts
│   ├── polyfills.ts
│   └── ... (other Angular boilerplate)
└── .github/
    └── workflows/
        └── sustainability-audit.yml   # GitHub Actions workflow
