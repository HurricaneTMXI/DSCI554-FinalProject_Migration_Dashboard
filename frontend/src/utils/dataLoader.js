// Data loading utilities for GitHub Pages deployment

// Load state data with filters
export const loadStateData = async (filters) => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/stateData.json`);
    const allData = await response.json();
    
    // Filter by demographic, age group, and occupation
    const filteredData = {};
    
    Object.entries(allData).forEach(([key, value]) => {
      if (
        value.demographic === filters.demographicGroup &&
        value.ageGroup === filters.ageGroup &&
        value.occupation === filters.occupation
      ) {
        filteredData[value.state] = value;
      }
    });
    
    return filteredData;
  } catch (error) {
    console.error('Error loading state data:', error);
    return {};
  }
};

// Load migration flows with filters
export const loadMigrationFlows = async (filters, viewLevel = 'State/Metro') => {
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}/data/migrationFlows.jsonl`);
    const text = await response.text();
    const lines = text.trim().split('\n');
    const allFlows = lines.map(line => JSON.parse(line));
    
    // Apply filters
    const gender = filters.womenOnly ? 'female' : filters.menOnly ? 'male' : 'all';
    const minFlow = viewLevel === 'Nation' ? 5000 : 
                   viewLevel === 'Individual' ? 500 : 1000;
    
    const filtered = allFlows.filter(flow => 
      flow.demographic === filters.demographicGroup &&
      flow.ageGroup === filters.ageGroup &&
      flow.occupation === filters.occupation &&
      flow.gender === gender &&
      flow.value >= minFlow
    );
    
    // Sort by value and return top flows
    return filtered.sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error('Error loading migration flows:', error);
    return [];
  }
};

// Load demographics data
export const loadDemographicsData = async (quarter = '2023-Q4') => {
  try {
    // For demographics, we'll create summary from state data
    const response = await fetch(`${process.env.PUBLIC_URL}/data/stateData.json`);
    const allData = await response.json();
    
    // Aggregate by gender, age, occupation
    const demographics = {
      byGender: { male: 0, female: 0 },
      byAge: {},
      byOccupation: {}
    };
    
    Object.values(allData).forEach(record => {
      if (record.quarter === quarter) {
        // This is simplified - in real data you'd have gender breakdowns
        const totalMigration = Math.abs(record.netMigration);
        
        // Age groups
        if (!demographics.byAge[record.ageGroup]) {
          demographics.byAge[record.ageGroup] = 0;
        }
        demographics.byAge[record.ageGroup] += totalMigration;
        
        // Occupations
        if (!demographics.byOccupation[record.occupation]) {
          demographics.byOccupation[record.occupation] = 0;
        }
        demographics.byOccupation[record.occupation] += totalMigration;
      }
    });
    
    // Simulate gender split (since we don't have it in data)
    const total = Object.values(demographics.byAge).reduce((a, b) => a + b, 0);
    demographics.byGender.male = total * 0.52;
    demographics.byGender.female = total * 0.48;
    
    return demographics;
  } catch (error) {
    console.error('Error loading demographics:', error);
    return { byGender: { male: 0, female: 0 }, byAge: {}, byOccupation: {} };
  }
};

// Load 3D network data
export const load3DNetworkData = async (filters) => {
  try {
    const [stateDataResponse, statesInfoResponse, flowsResponse] = await Promise.all([
      fetch(`${process.env.PUBLIC_URL}/data/stateData.json`),
      fetch(`${process.env.PUBLIC_URL}/data/states.json`),
      fetch(`${process.env.PUBLIC_URL}/data/migrationFlows.jsonl`)
    ]);
    
    const allStateData = await stateDataResponse.json();
    const statesInfo = await statesInfoResponse.json();
    const flowsText = await flowsResponse.text();
    const flowsLines = flowsText.trim().split('\n');
    const allFlows = flowsLines.map(line => JSON.parse(line));
    
    // Get unique states and their data
    const statesMap = new Map();
    Object.entries(allStateData).forEach(([key, value]) => {
      if (
        value.demographic === filters.demographicGroup &&
        value.ageGroup === filters.ageGroup &&
        value.occupation === filters.occupation
      ) {
        if (!statesMap.has(value.state)) {
          const stateInfo = statesInfo[value.state] || {};
          statesMap.set(value.state, {
            id: value.state,
            abbr: stateInfo.abbr || getStateAbbr(value.state),
            population: stateInfo.population || 1000000,
            netMigration: value.netMigration,
            covidForce: value.infectionRate / 10, // Normalize
            economicForce: (100 - value.unemploymentRate) / 100,
            policyStringency: value.policyStringency
          });
        }
      }
    });
    
    const nodes = Array.from(statesMap.values());
    
    // Filter flows
    const edges = allFlows
      .filter(flow => 
        flow.demographic === filters.demographicGroup &&
        flow.ageGroup === filters.ageGroup &&
        flow.occupation === filters.occupation &&
        flow.value >= 1000
      )
      .map(flow => ({
        source: flow.from,
        target: flow.to,
        value: flow.value
      }))
      .slice(0, 100);
    
    return { nodes, edges };
  } catch (error) {
    console.error('Error loading 3D network data:', error);
    return { nodes: [], edges: [] };
  }
};

// Load causality network data
export const loadCausalityData = async (filters) => {
  try {
    const [policiesResp, flowsResp, stateDataResp] = await Promise.all([
      fetch(`${process.env.PUBLIC_URL}/data/policies.json`),
      fetch(`${process.env.PUBLIC_URL}/data/migrationFlows.jsonl`),
      fetch(`${process.env.PUBLIC_URL}/data/stateData.json`)
    ]);
    
    const policies = await policiesResp.json();
    const flowsText = await flowsResp.text();
    const flows = flowsText.trim().split('\n').map(line => JSON.parse(line));
    const stateData = await stateDataResp.json();
    
    // Create events from policies
    const events = [];
    const seenQuarters = new Set();
    
    policies.forEach(policy => {
      const key = `${policy.quarter}-${policy.lockdownLevel}`;
      if (!seenQuarters.has(key) && policy.stringency > 60) {
        events.push({
          id: `event-${events.length}`,
          type: policy.lockdownLevel === 'strict' ? 'covid' : 'policy',
          label: policy.lockdownLevel === 'strict' ? 'Lockdown' : 'Policy Change',
          quarter: policy.quarter,
          severity: Math.min(10, policy.stringency / 10)
        });
        seenQuarters.add(key);
      }
    });
    
    // Sort events by quarter
    events.sort((a, b) => a.quarter.localeCompare(b.quarter));
    
    // Take only first 8 events
    const limitedEvents = events.slice(0, 8);
    
    // Create migration surges from flows
    const stateFlows = new Map();
    flows
      .filter(f => 
        f.demographic === filters.demographicGroup &&
        f.ageGroup === filters.ageGroup &&
        f.occupation === filters.occupation
      )
      .forEach(flow => {
        if (!stateFlows.has(flow.to)) {
          stateFlows.set(flow.to, { inflow: 0, outflow: 0 });
        }
        if (!stateFlows.has(flow.from)) {
          stateFlows.set(flow.from, { inflow: 0, outflow: 0 });
        }
        stateFlows.get(flow.to).inflow += flow.value;
        stateFlows.get(flow.from).outflow += flow.value;
      });
    
    const migrationSurges = [];
    let id = 0;
    stateFlows.forEach((values, state) => {
      const netMigration = values.inflow - values.outflow;
      if (Math.abs(netMigration) > 5000) {
        migrationSurges.push({
          id: `surge-${id++}`,
          state: state,
          direction: netMigration > 0 ? 'inflow' : 'outflow',
          magnitude: Math.abs(netMigration)
        });
      }
    });
    
    // Sort and limit surges
    migrationSurges.sort((a, b) => b.magnitude - a.magnitude);
    const limitedSurges = migrationSurges.slice(0, 8);
    
    // Create links between events and surges
    const links = [];
    limitedEvents.forEach((event, i) => {
      limitedSurges.forEach((surge, j) => {
        if (i <= j) { // Events before or concurrent with surges
          links.push({
            source: event.id,
            target: surge.id,
            lag: j - i + 1,
            strength: Math.max(0.3, 1 - (j - i) * 0.2)
          });
        }
      });
    });
    
    return {
      events: limitedEvents,
      migrationSurges: limitedSurges,
      links: links
    };
  } catch (error) {
    console.error('Error loading causality data:', error);
    return { events: [], migrationSurges: [], links: [] };
  }
};

// Helper function to get state abbreviation
const getStateAbbr = (stateName) => {
  const stateAbbr = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
    'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
    'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
    'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
    'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
    'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
    'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
    'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
    'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
    'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
    'Wisconsin': 'WI', 'Wyoming': 'WY'
  };
  return stateAbbr[stateName] || stateName.substring(0, 2).toUpperCase();
};
