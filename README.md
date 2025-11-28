# COVID-19 Migration Dashboard

## 🚀 Quick Start

### 1. Start Backend

```bash
cd backend
npm install
npm start
```

Backend runs on `http://localhost:8000`

### 2. Start Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm start
```

Frontend opens automatically at `http://localhost:3000`

---

## 📊 What's Included

This dashboard visualizes how COVID-19 reshaped migration patterns across the United States.

### Main Features

1. **2D Interactive Map** (Built with **D3.js**)
   - US choropleth map with state-level migration data
   - Animated migration flow arrows
   - Hover for detailed state information
   - Color-coded by net migration (green = inflow, red = outflow)
   - Uses D3.js for SVG rendering, path generation, and geographic projections

2. **3D Gravity Network** (Built with **Three.js**)
   - Interactive 3D force-directed graph
   - States as nodes positioned by geographic coordinates
   - Migration flows as connecting lines
   - COVID severity, economic opportunity, and policy forces affect positioning
   - Uses Three.js for 3D rendering with WebGL and OrbitControls for camera interaction

3. **Temporal Causality Network** (Built with **D3.js**)
   - Shows how COVID events triggered migration waves
   - Time lag indicators between events and migration surges
   - Red circles = COVID waves, Blue circles = Policy changes
   - Green circles = Migration inflows, Orange circles = Outflows
   - Uses D3.js force simulation for dynamic node positioning and link rendering

4. **Interactive Filters** (Built with **React**)
   - Demographics (Asian American, Hispanic/Latino, etc.)
   - Age groups (18-24, 25-34, etc.)
   - Gender filters
   - Occupation types (Remote-work, Healthcare, Tech, etc.)
   - COVID metrics (infection rate, vaccination rate)
   - Policy strictness levels
   - Pure React components with controlled state management

5. **Real-time Updates**
   - All visualizations update instantly when filters change
   - Demographics breakdown panel
   - Time series data

---

## 🛠️ Technologies Used

### Visualization Libraries

- **D3.js (v7)** - Used for:
  - 2D Interactive Map (choropleth, SVG paths, geographic projections)
  - Temporal Causality Network (force-directed graph simulation)
  - Data transformations and scales

- **Three.js (r128)** - Used for:
  - 3D Gravity Network (WebGL rendering, 3D geometries, lighting)
  - OrbitControls for interactive camera movement
  - Real-time physics simulation

### Frontend Stack

- **React** (v18) - Component architecture and state management
- **React Router** - Client-side routing
- **Axios** - HTTP requests to backend API
- **React-Scroll** - Smooth scrolling navigation
- **Styled Components** - CSS-in-JS styling

### Backend Stack

- **Express.js** - REST API server
- **Node.js** - Runtime environment
- **CORS** - Cross-origin resource sharing

---

## 🏗️ Project Structure

```
migration-dashboard/
├── backend/          # Express API server
│   ├── server.js
│   ├── data/         # JSON data files
│   └── scripts/      # Data generation
└── frontend/         # React application
    └── src/
        ├── components/
        │   ├── MigrationMap/
        │   ├── GravityNetwork/
        │   ├── CausalityNetwork/
        │   └── Filters/
        └── pages/
```

---

Built with React, D3.js, Three.js, and Express
