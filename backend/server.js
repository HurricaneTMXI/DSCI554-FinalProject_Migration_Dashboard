const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Load data
let migrationFlows, stateData, timeSeries, infodemic, policies, resilience, emotions, states;

// Function to load JSONL files (line-delimited JSON)
async function loadJSONL(filePath) {
  const data = [];
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      data.push(JSON.parse(line));
    }
  }
  
  return data;
}

// Function to load either JSON or JSONL
async function loadDataFile(filename) {
  const jsonPath = path.join(__dirname, `data/${filename}.json`);
  const jsonlPath = path.join(__dirname, `data/${filename}.jsonl`);
  
  if (fs.existsSync(jsonlPath)) {
    console.log(`Loading ${filename}.jsonl...`);
    return await loadJSONL(jsonlPath);
  } else if (fs.existsSync(jsonPath)) {
    console.log(`Loading ${filename}.json...`);
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } else {
    throw new Error(`Neither ${filename}.json nor ${filename}.jsonl found`);
  }
}

async function loadData() {
  try {
    console.log('Loading data files...');
    
    migrationFlows = await loadDataFile('migrationFlows');
    console.log(`  ✓ Loaded ${migrationFlows.length} migration flows`);
    
    stateData = await loadDataFile('stateData');
    console.log(`  ✓ Loaded ${Object.keys(stateData).length} state records`);
    
    timeSeries = await loadDataFile('timeSeries');
    console.log(`  ✓ Loaded ${timeSeries.length} time series`);
    
    infodemic = await loadDataFile('infodemic');
    console.log(`  ✓ Loaded ${infodemic.length} infodemic records`);
    
    policies = await loadDataFile('policies');
    console.log(`  ✓ Loaded ${policies.length} policy records`);
    
    resilience = await loadDataFile('resilience');
    console.log(`  ✓ Loaded ${resilience.length} resilience records`);
    
    emotions = await loadDataFile('emotions');
    console.log(`  ✓ Loaded ${emotions.length} emotional records`);
    
    states = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/states.json'), 'utf8'));
    console.log(`  ✓ Loaded ${Object.keys(states).length} states`);
    
    console.log('\n✓ All data loaded successfully!\n');
  } catch (error) {
    console.error('\n❌ Error loading data:', error.message);
    console.error('\n Please run: npm run generate-data\n');
    process.exit(1);
  }
}

// API Routes

// Get filtered migration flows
app.get('/api/migration-flows', (req, res) => {
  const {
    demographic = 'All Demographics',
    ageGroup = 'All Ages',
    occupation = 'All Occupations',
    gender = 'all',
    minFlow = 0
  } = req.query;
  
  let filtered = migrationFlows.filter(flow => {
    if (demographic !== 'All Demographics' && flow.demographic !== demographic) return false;
    if (ageGroup !== 'All Ages' && flow.ageGroup !== ageGroup) return false;
    if (occupation !== 'All Occupations' && flow.occupation !== occupation) return false;
    if (gender !== 'all' && flow.gender !== gender) return false;
    if (flow.value < parseInt(minFlow)) return false;
    return true;
  });
  
  // Sort by value and limit to top flows
  filtered.sort((a, b) => b.value - a.value);
  const topFlows = filtered.slice(0, 100);
  
  res.json(topFlows);
});

// NEW: Get 3D network data for gravity model
app.get('/api/3d-network', (req, res) => {
  const {
    demographic = 'All Demographics',
    ageGroup = 'All Ages',
    occupation = 'All Occupations',
    quarter = '2023-Q4'
  } = req.query;
  
  // Calculate node data (states with forces)
  const nodes = Object.keys(states).map(stateName => {
    const key = `${stateName}-${quarter}-${demographic}-${ageGroup}-${occupation}`;
    const data = stateData[key] || {};
    
    // Calculate forces
    const covidForce = (data.infectionRate || 50) / 100; // Repulsion: 0-1
    const economicForce = (data.employmentRate || 60) / 100; // Attraction: 0-1
    const policyForce = (data.policyStringency || 100) / 200; // Repulsion: 0-0.5
    
    return {
      id: stateName,
      abbr: states[stateName].abbr,
      lat: states[stateName].lat,
      lon: states[stateName].lon,
      population: states[stateName].population,
      netMigration: data.netMigration || 0,
      infectionRate: data.infectionRate || 50,
      employmentRate: data.employmentRate || 60,
      policyStringency: data.policyStringency || 100,
      covidForce,
      economicForce,
      policyForce
    };
  });
  
  // Calculate edges (migration flows)
  const edges = migrationFlows
    .filter(flow => {
      if (demographic !== 'All Demographics' && flow.demographic !== demographic) return false;
      if (ageGroup !== 'All Ages' && flow.ageGroup !== ageGroup) return false;
      if (occupation !== 'All Occupations' && flow.occupation !== occupation) return false;
      return flow.value > 1000; // Minimum threshold
    })
    .slice(0, 150)
    .map(flow => ({
      source: flow.origin,
      target: flow.destination,
      value: flow.value,
      demographic: flow.demographic
    }));
  
  res.json({ nodes, edges });
});

// NEW: Get causality network data
app.get('/api/causality-network', (req, res) => {
  const {
    demographic = 'All Demographics',
    ageGroup = 'All Ages',
    occupation = 'All Occupations'
  } = req.query;
  
  // Generate causality links between COVID events and migration surges
  const events = [
    { id: 'event1', type: 'covid', label: 'First Wave Peak', quarter: '2020-Q2', severity: 8 },
    { id: 'event2', type: 'covid', label: 'Lockdown Orders', quarter: '2020-Q2', severity: 9 },
    { id: 'event3', type: 'policy', label: 'Mask Mandates', quarter: '2020-Q3', severity: 6 },
    { id: 'event4', type: 'covid', label: 'Delta Variant', quarter: '2021-Q3', severity: 7 },
    { id: 'event5', type: 'policy', label: 'Vaccine Mandates', quarter: '2021-Q4', severity: 8 },
    { id: 'event6', type: 'covid', label: 'Omicron Surge', quarter: '2022-Q1', severity: 6 },
    { id: 'event7', type: 'policy', label: 'Restrictions Lifted', quarter: '2022-Q2', severity: 5 }
  ];
  
  const migrationSurges = [
    { id: 'surge1', state: 'Texas', quarter: '2020-Q3', magnitude: 45000, direction: 'inflow' },
    { id: 'surge2', state: 'Florida', quarter: '2020-Q4', magnitude: 52000, direction: 'inflow' },
    { id: 'surge3', state: 'California', quarter: '2020-Q3', magnitude: 38000, direction: 'outflow' },
    { id: 'surge4', state: 'New York', quarter: '2020-Q4', magnitude: 41000, direction: 'outflow' },
    { id: 'surge5', state: 'Colorado', quarter: '2021-Q2', magnitude: 28000, direction: 'inflow' },
    { id: 'surge6', state: 'Arizona', quarter: '2021-Q4', magnitude: 32000, direction: 'inflow' },
    { id: 'surge7', state: 'Illinois', quarter: '2022-Q1', magnitude: 25000, direction: 'outflow' }
  ];
  
  const links = [
    { source: 'event1', target: 'surge3', lag: 1, strength: 0.8 },
    { source: 'event2', target: 'surge3', lag: 1, strength: 0.9 },
    { source: 'event2', target: 'surge4', lag: 2, strength: 0.85 },
    { source: 'event1', target: 'surge1', lag: 1, strength: 0.7 },
    { source: 'event3', target: 'surge2', lag: 1, strength: 0.75 },
    { source: 'event4', target: 'surge5', lag: 3, strength: 0.65 },
    { source: 'event5', target: 'surge6', lag: 0, strength: 0.8 },
    { source: 'event6', target: 'surge7', lag: 0, strength: 0.7 },
    { source: 'event7', target: 'surge1', lag: 4, strength: 0.6 }
  ];
  
  res.json({ events, migrationSurges, links });
});

// Get state-level summary
app.get('/api/state-summary', (req, res) => {
  const {
    demographic = 'All Demographics',
    ageGroup = 'All Ages',
    occupation = 'All Occupations'
  } = req.query;
  
  const summary = {};
  
  Object.keys(states).forEach(stateName => {
    const key = `${stateName}-2023-Q4-${demographic}-${ageGroup}-${occupation}`;
    if (stateData[key]) {
      summary[stateName] = {
        ...stateData[key],
        state: stateName,
        abbr: states[stateName].abbr,
        lat: states[stateName].lat,
        lon: states[stateName].lon,
        population: states[stateName].population
      };
    }
  });
  
  res.json(summary);
});

// Get time series data
app.get('/api/time-series', (req, res) => {
  const {
    demographic = 'All Demographics',
    ageGroup = 'All Ages',
    occupation = 'All Occupations'
  } = req.query;
  
  const series = timeSeries.find(s => 
    s.demographic === demographic &&
    s.ageGroup === ageGroup &&
    s.occupation === occupation
  );
  
  res.json(series || { demographic, ageGroup, occupation, data: [] });
});

// Get demographics breakdown
app.get('/api/demographics', (req, res) => {
  const breakdown = {
    byDemographic: {},
    byAge: {},
    byOccupation: {},
    byGender: { male: 0, female: 0 }
  };
  
  // Sample from flows (use first 10000 for efficiency)
  const sampleFlows = migrationFlows.slice(0, 10000);
  
  sampleFlows.forEach(flow => {
    // By demographic
    if (!breakdown.byDemographic[flow.demographic]) {
      breakdown.byDemographic[flow.demographic] = 0;
    }
    breakdown.byDemographic[flow.demographic] += flow.value;
    
    // By age
    if (!breakdown.byAge[flow.ageGroup]) {
      breakdown.byAge[flow.ageGroup] = 0;
    }
    breakdown.byAge[flow.ageGroup] += flow.value;
    
    // By occupation
    if (!breakdown.byOccupation[flow.occupation]) {
      breakdown.byOccupation[flow.occupation] = 0;
    }
    breakdown.byOccupation[flow.occupation] += flow.value;
    
    // By gender
    if (flow.gender === 'male' || flow.gender === 'female') {
      breakdown.byGender[flow.gender] += flow.value;
    }
  });
  
  res.json(breakdown);
});

// Get infodemic data
app.get('/api/infodemic', (req, res) => {
  const { state = 'all', quarter = 'all' } = req.query;
  
  let filtered = infodemic.filter(d => {
    if (state !== 'all' && d.state !== state) return false;
    if (quarter !== 'all' && d.quarter !== quarter) return false;
    return true;
  });
  
  res.json(filtered.slice(0, 1000)); // Limit response size
});

// Get policy data
app.get('/api/policies', (req, res) => {
  const { state = 'all', quarter = 'all', minStringency = 0 } = req.query;
  
  let filtered = policies.filter(p => {
    if (state !== 'all' && p.state !== state) return false;
    if (quarter !== 'all' && p.quarter !== quarter) return false;
    if (p.stringency < parseFloat(minStringency)) return false;
    return true;
  });
  
  res.json(filtered.slice(0, 1000)); // Limit response size
});

// Get resilience data
app.get('/api/resilience', (req, res) => {
  const { state = 'all', quarter = 'all' } = req.query;
  
  let filtered = resilience.filter(r => {
    if (state !== 'all' && r.state !== state) return false;
    if (quarter !== 'all' && r.quarter !== quarter) return false;
    return true;
  });
  
  res.json(filtered.slice(0, 1000)); // Limit response size
});

// Get emotional data
app.get('/api/emotions', (req, res) => {
  const { state = 'all', quarter = 'all' } = req.query;
  
  let filtered = emotions.filter(e => {
    if (state !== 'all' && e.state !== state) return false;
    if (quarter !== 'all' && e.quarter !== quarter) return false;
    return true;
  });
  
  res.json(filtered.slice(0, 1000)); // Limit response size
});

// Get all states info
app.get('/api/states', (req, res) => {
  res.json(states);
});

// Get available quarters
app.get('/api/quarters', (req, res) => {
  const quarters = ['2019-Q1', '2019-Q2', '2019-Q3', '2019-Q4', 
                   '2020-Q1', '2020-Q2', '2020-Q3', '2020-Q4',
                   '2021-Q1', '2021-Q2', '2021-Q3', '2021-Q4',
                   '2022-Q1', '2022-Q2', '2022-Q3', '2022-Q4',
                   '2023-Q1', '2023-Q2', '2023-Q3', '2023-Q4'];
  res.json(quarters);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dataLoaded: {
      migrationFlows: Array.isArray(migrationFlows) ? migrationFlows.length : 'object',
      stateData: typeof stateData === 'object' ? Object.keys(stateData).length : 'array',
      timeSeries: Array.isArray(timeSeries) ? timeSeries.length : 0,
      infodemic: Array.isArray(infodemic) ? infodemic.length : 0,
      policies: Array.isArray(policies) ? policies.length : 0,
      resilience: Array.isArray(resilience) ? resilience.length : 0,
      emotions: Array.isArray(emotions) ? emotions.length : 0,
      states: Object.keys(states || {}).length
    }
  });
});

// Initialize and start server
loadData().then(() => {
  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/api/health`);
    console.log(`✓ API endpoints ready`);
    console.log('========================================\n');
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
