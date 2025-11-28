# COVID-19 Migration Dashboard

## 🌐 Live Demo

**View the live dashboard:** [https://hurricanetmxi.github.io/DSCI554-FinalProject_Migration_Dashboard/](https://hurricanetmxi.github.io/DSCI554-FinalProject_Migration_Dashboard/)

---

## 🚀 Quick Start

### Local Development

```bash
cd frontend
npm install
npm start
```

The app will open at `http://localhost:3000`

**Note:** No backend server needed! All data is now served statically from the `/public/data` folder.

---

## 📊 What's Included

This dashboard visualizes how COVID-19 reshaped migration patterns across the United States.

### Main Features

1. **2D Interactive Map** (Built with **D3.js**)
   - US choropleth map with state-level migration data
   - Animated migration flow arrows
   - Hover for detailed state information
   - Color-coded by net migration (green = inflow, red = outflow)
   - Dynamic metric selection (infection rate, vaccination rate, etc.)
   - Uses D3.js for SVG rendering, path generation, and geographic projections

2. **3D Gravity Network** (Built with **Three.js**)
   - Interactive 3D force-directed graph
   - States as nodes positioned by COVID severity and economic forces
   - Migration flows as connecting lines
   - COVID severity, economic opportunity, and policy forces affect positioning
   - Uses Three.js for 3D rendering with WebGL and OrbitControls for camera interaction
   - Real-time physics simulation with repulsion and attraction forces

3. **Temporal Causality Network** (Built with **D3.js**)
   - Shows how COVID events triggered migration waves
   - Time lag indicators between events and migration surges
   - Red circles = COVID waves, Blue circles = Policy changes
   - Green circles = Migration inflows, Orange circles = Outflows
   - Uses D3.js for curved path rendering and dynamic layout

4. **Interactive Filters** (Built with **React**)
   - Demographics (Asian American, Hispanic/Latino, etc.)
   - Age groups (18-24, 25-34, etc.)
   - Gender filters (Women only, Men only)
   - Occupation types (Remote-work, Healthcare, Tech, Construction, Service, Education)
   - COVID metrics (7-day infection rate, vaccination rate, hospitalization rate, death rate)
   - Policy strictness levels (more-strict, less-strict, equal)
   - Pure React components with controlled state management

5. **Real-time Updates**
   - All visualizations update instantly when filters change
   - Demographics breakdown panel
   - View level switching (Nation, State/Metro, Individual)
   - Synchronized data across all components

---

## 🛠️ Technologies Used

### Visualization Libraries

- **D3.js (v7)** - Used for:
  - 2D Interactive Map (choropleth, SVG paths, geographic projections with d3.geoAlbersUsa)
  - Temporal Causality Network (custom layout with curved paths)
  - Color scales and data transformations
  - Interactive tooltips and hover effects

- **Three.js (r128)** - Used for:
  - 3D Gravity Network (WebGL rendering, SphereGeometry, LineGeometry)
  - OrbitControls for interactive camera movement
  - Real-time physics simulation with forces
  - Ambient and point lighting
  - Text sprites for state labels

### Frontend Stack

- **React** (v17) - Component architecture and state management
- **React Router** (v6) - Client-side routing
- **React-Scroll** - Smooth scrolling navigation
- **Styled Components** - CSS-in-JS styling
- **Chart.js** - Additional charting support

### Data Management

- **Static JSON Files** - All data served from `/public/data`:
  - `stateData.json` - State-level migration and COVID metrics
  - `migrationFlows.jsonl` - Migration flow data between states
  - `policies.json` - COVID policy stringency data
  - `states.json` - State metadata (abbreviations, coordinates, population)
  - `emotions.json`, `infodemic.json`, `resilience.json`, `timeSeries.json` - Additional datasets

### Deployment

- **GitHub Pages** - Static site hosting
- **gh-pages** - Automated deployment tool

---

## 🏗️ Project Structure

```
DSCI554-FinalProject_Migration_Dashboard/
├── frontend/                    # React application
│   ├── public/
│   │   └── data/               # Static data files (JSON/JSONL)
│   │       ├── stateData.json
│   │       ├── migrationFlows.jsonl
│   │       ├── policies.json
│   │       ├── states.json
│   │       └── ...
│   └── src/
│       ├── components/
│       │   ├── MigrationMap/   # D3.js 2D map visualization
│       │   ├── GravityNetwork/ # Three.js 3D network
│       │   ├── CausalityNetwork/ # D3.js causality graph
│       │   ├── Filters/        # React filter controls
│       │   ├── Navbar/
│       │   └── Footer/
│       ├── pages/
│       │   └── Home.js         # Main dashboard page
│       └── utils/
│           └── dataLoader.js   # Data loading utilities
└── backend/                     # Legacy - No longer needed
```

---

## 🚀 Deployment

The dashboard is deployed to GitHub Pages using the following workflow:

### To Deploy Updates:

```bash
cd frontend
npm run build    # Build the production app
npm run deploy   # Deploy to GitHub Pages
```

This will:
1. Build the React app with optimizations
2. Deploy the `build/` folder to the `gh-pages` branch
3. GitHub Pages automatically serves the site at the configured URL

### Deployment Configuration

In `frontend/package.json`:
```json
{
  "homepage": "https://HurricaneTMXI.github.io/DSCI554-FinalProject_Migration_Dashboard",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

---

## 📈 Data Architecture

All data is statically loaded from JSON files in the `public/data` folder. The `dataLoader.js` utility provides functions to:

- **Filter state data** by demographic, age group, and occupation
- **Load migration flows** with minimum flow thresholds based on view level
- **Aggregate demographics** from state-level data
- **Prepare 3D network data** with forces calculated from COVID metrics
- **Generate causality networks** from policy events and migration surges

This approach eliminates the need for a backend server and enables fast, client-side filtering.

---

## 🎨 Key Insights Visualized

1. **Tech Worker Migration** - Remote workers moving from high-cost cities to affordable states
2. **Demographic Patterns** - Asian American migration toward California, Hispanic/Latino movement to essential worker hubs
3. **Economic Drivers** - Construction and service workers seeking lower cost of living
4. **COVID-19 Impact** - Higher infection rates correlating with outmigration
5. **Urban to Suburban Shift** - Metropolitan areas losing population to suburbs
6. **Policy Influence** - States with moderate COVID policies showing stable retention

---

## 👥 Team

**DSCI 554 Final Project - Migration Dashboard Team**

---

Built with ❤️ using React, D3.js, and Three.js
