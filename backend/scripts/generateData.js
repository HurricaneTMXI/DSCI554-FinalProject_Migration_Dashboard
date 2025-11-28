const fs = require('fs');
const path = require('path');

// US States with their centers for visualization
const states = {
  'Alabama': { abbr: 'AL', lat: 32.806671, lon: -86.791130, population: 5024279 },
  'Alaska': { abbr: 'AK', lat: 61.370716, lon: -152.404419, population: 733391 },
  'Arizona': { abbr: 'AZ', lat: 33.729759, lon: -111.431221, population: 7151502 },
  'Arkansas': { abbr: 'AR', lat: 34.969704, lon: -92.373123, population: 3011524 },
  'California': { abbr: 'CA', lat: 36.116203, lon: -119.681564, population: 39538223 },
  'Colorado': { abbr: 'CO', lat: 39.059811, lon: -105.311104, population: 5773714 },
  'Connecticut': { abbr: 'CT', lat: 41.597782, lon: -72.755371, population: 3605944 },
  'Delaware': { abbr: 'DE', lat: 39.318523, lon: -75.507141, population: 989948 },
  'Florida': { abbr: 'FL', lat: 27.766279, lon: -81.686783, population: 21538187 },
  'Georgia': { abbr: 'GA', lat: 33.040619, lon: -83.643074, population: 10711908 },
  'Hawaii': { abbr: 'HI', lat: 21.094318, lon: -157.498337, population: 1455271 },
  'Idaho': { abbr: 'ID', lat: 44.240459, lon: -114.478828, population: 1839106 },
  'Illinois': { abbr: 'IL', lat: 40.349457, lon: -88.986137, population: 12812508 },
  'Indiana': { abbr: 'IN', lat: 39.849426, lon: -86.258278, population: 6785528 },
  'Iowa': { abbr: 'IA', lat: 42.011539, lon: -93.210526, population: 3190369 },
  'Kansas': { abbr: 'KS', lat: 38.526600, lon: -96.726486, population: 2937880 },
  'Kentucky': { abbr: 'KY', lat: 37.668140, lon: -84.670067, population: 4505836 },
  'Louisiana': { abbr: 'LA', lat: 31.169546, lon: -91.867805, population: 4657757 },
  'Maine': { abbr: 'ME', lat: 44.693947, lon: -69.381927, population: 1362359 },
  'Maryland': { abbr: 'MD', lat: 39.063946, lon: -76.802101, population: 6177224 },
  'Massachusetts': { abbr: 'MA', lat: 42.230171, lon: -71.530106, population: 7029917 },
  'Michigan': { abbr: 'MI', lat: 43.326618, lon: -84.536095, population: 10077331 },
  'Minnesota': { abbr: 'MN', lat: 45.694454, lon: -93.900192, population: 5706494 },
  'Mississippi': { abbr: 'MS', lat: 32.741646, lon: -89.678696, population: 2961279 },
  'Missouri': { abbr: 'MO', lat: 38.456085, lon: -92.288368, population: 6154913 },
  'Montana': { abbr: 'MT', lat: 46.921925, lon: -110.454353, population: 1084225 },
  'Nebraska': { abbr: 'NE', lat: 41.125370, lon: -98.268082, population: 1961504 },
  'Nevada': { abbr: 'NV', lat: 38.313515, lon: -117.055374, population: 3104614 },
  'New Hampshire': { abbr: 'NH', lat: 43.452492, lon: -71.563896, population: 1377529 },
  'New Jersey': { abbr: 'NJ', lat: 40.298904, lon: -74.521011, population: 9288994 },
  'New Mexico': { abbr: 'NM', lat: 34.840515, lon: -106.248482, population: 2117522 },
  'New York': { abbr: 'NY', lat: 42.165726, lon: -74.948051, population: 20201249 },
  'North Carolina': { abbr: 'NC', lat: 35.630066, lon: -79.806419, population: 10439388 },
  'North Dakota': { abbr: 'ND', lat: 47.528912, lon: -99.784012, population: 779094 },
  'Ohio': { abbr: 'OH', lat: 40.388783, lon: -82.764915, population: 11799448 },
  'Oklahoma': { abbr: 'OK', lat: 35.565342, lon: -96.928917, population: 3959353 },
  'Oregon': { abbr: 'OR', lat: 44.572021, lon: -122.070938, population: 4237256 },
  'Pennsylvania': { abbr: 'PA', lat: 40.590752, lon: -77.209755, population: 13002700 },
  'Rhode Island': { abbr: 'RI', lat: 41.680893, lon: -71.511780, population: 1097379 },
  'South Carolina': { abbr: 'SC', lat: 33.856892, lon: -80.945007, population: 5118425 },
  'South Dakota': { abbr: 'SD', lat: 44.299782, lon: -99.438828, population: 886667 },
  'Tennessee': { abbr: 'TN', lat: 35.747845, lon: -86.692345, population: 6910840 },
  'Texas': { abbr: 'TX', lat: 31.054487, lon: -97.563461, population: 29145505 },
  'Utah': { abbr: 'UT', lat: 40.150032, lon: -111.862434, population: 3271616 },
  'Vermont': { abbr: 'VT', lat: 44.045876, lon: -72.710686, population: 643077 },
  'Virginia': { abbr: 'VA', lat: 37.769337, lon: -78.169968, population: 8631393 },
  'Washington': { abbr: 'WA', lat: 47.400902, lon: -121.490494, population: 7705281 },
  'West Virginia': { abbr: 'WV', lat: 38.491226, lon: -80.954453, population: 1793716 },
  'Wisconsin': { abbr: 'WI', lat: 44.268543, lon: -89.616508, population: 5893718 },
  'Wyoming': { abbr: 'WY', lat: 42.755966, lon: -107.302490, population: 576851 }
};

const demographics = ['All Demographics', 'Asian American', 'Hispanic/Latino', 'African American', 'White', 'Native American'];
const ageGroups = ['All Ages', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
const occupations = ['All Occupations', 'Remote-work eligible', 'Healthcare workers', 'Construction workers', 'Service industry', 'Tech workers', 'Education'];
const quarters = ['2019-Q1', '2019-Q2', '2019-Q3', '2019-Q4', '2020-Q1', '2020-Q2', '2020-Q3', '2020-Q4', 
                 '2021-Q1', '2021-Q2', '2021-Q3', '2021-Q4', '2022-Q1', '2022-Q2', '2022-Q3', '2022-Q4',
                 '2023-Q1', '2023-Q2', '2023-Q3', '2023-Q4'];

// Major migration routes (reduced set for efficiency)
const majorRoutes = [
  ['California', 'Texas'], ['California', 'Washington'], ['California', 'Oregon'], ['California', 'Nevada'],
  ['New York', 'Florida'], ['New York', 'Texas'], ['New York', 'California'], ['New York', 'North Carolina'],
  ['Illinois', 'Texas'], ['Illinois', 'Florida'], ['Illinois', 'Arizona'], ['Illinois', 'California'],
  ['Texas', 'California'], ['Texas', 'Florida'], ['Texas', 'Colorado'], ['Texas', 'Arizona'],
  ['Florida', 'Georgia'], ['Florida', 'North Carolina'], ['Florida', 'Texas'], ['Florida', 'Tennessee'],
  ['Massachusetts', 'California'], ['Massachusetts', 'Florida'], ['Massachusetts', 'New Hampshire'],
  ['Pennsylvania', 'Florida'], ['Pennsylvania', 'North Carolina'], ['Pennsylvania', 'Texas'],
  ['Washington', 'Oregon'], ['Washington', 'Texas'], ['Washington', 'California'],
  ['Georgia', 'Florida'], ['Georgia', 'Texas'], ['Georgia', 'North Carolina'],
  ['Ohio', 'Florida'], ['Ohio', 'Texas'], ['Ohio', 'North Carolina'],
  ['Michigan', 'Florida'], ['Michigan', 'Texas'], ['Michigan', 'Arizona'],
  ['Virginia', 'North Carolina'], ['Virginia', 'Florida'], ['Virginia', 'Texas'],
  ['Arizona', 'California'], ['Arizona', 'Texas'], ['Arizona', 'Colorado'],
  ['Colorado', 'California'], ['Colorado', 'Texas'], ['Colorado', 'Florida']
];

// Helper functions
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Generate migration flows with reduced combinations
function generateMigrationFlows() {
  const flows = [];
  let count = 0;
  
  console.log('Generating migration flows (this may take a minute)...');
  
  // For each major route
  majorRoutes.forEach(([fromState, toState]) => {
    // For each demographic
    demographics.forEach(demographic => {
      // For each age group  
      ageGroups.forEach(ageGroup => {
        // For each occupation
        occupations.forEach(occupation => {
          // Only generate for "all" quarter (aggregate) to save space
          const baseFlow = random(100, 5000);
          const covidMultiplier = randomFloat(1.5, 2.5); // Average COVID impact
          
          // All gender
          flows.push({
            from: fromState,
            to: toState,
            fromLat: states[fromState].lat,
            fromLon: states[fromState].lon,
            toLat: states[toState].lat,
            toLon: states[toState].lon,
            value: Math.floor(baseFlow * covidMultiplier),
            demographic,
            ageGroup,
            occupation,
            quarter: 'all',
            gender: 'all'
          });
          
          // Male
          flows.push({
            from: fromState,
            to: toState,
            fromLat: states[fromState].lat,
            fromLon: states[fromState].lon,
            toLat: states[toState].lat,
            toLon: states[toState].lon,
            value: Math.floor(baseFlow * covidMultiplier * 0.52),
            demographic,
            ageGroup,
            occupation,
            quarter: 'all',
            gender: 'male'
          });
          
          // Female
          flows.push({
            from: fromState,
            to: toState,
            fromLat: states[fromState].lat,
            fromLon: states[fromState].lon,
            toLat: states[toState].lat,
            toLon: states[toState].lon,
            value: Math.floor(baseFlow * covidMultiplier * 0.48),
            demographic,
            ageGroup,
            occupation,
            quarter: 'all',
            gender: 'female'
          });
          
          count += 3;
          if (count % 1000 === 0) {
            console.log(`  Generated ${count} flows...`);
          }
        });
      });
    });
  });
  
  console.log(`✓ Generated ${flows.length} migration flows`);
  return flows;
}

// Generate state-level data
function generateStateData() {
  const stateData = {};
  let count = 0;
  
  console.log('Generating state data...');
  
  Object.keys(states).forEach(stateName => {
    // Only generate for latest quarter to save space
    demographics.forEach(demographic => {
      ageGroups.forEach(ageGroup => {
        occupations.forEach(occupation => {
          const key = `${stateName}-2023-Q4-${demographic}-${ageGroup}-${occupation}`;
          
          const baseInflow = random(500, 15000);
          const baseOutflow = random(500, 15000);
          
          stateData[key] = {
            state: stateName,
            quarter: '2023-Q4',
            demographic,
            ageGroup,
            occupation,
            inflow: baseInflow,
            outflow: baseOutflow,
            netMigration: baseInflow - baseOutflow,
            covidCases: random(1000, 50000),
            covidDeaths: random(10, 1000),
            infectionRate: randomFloat(0.5, 10.0),
            vaccinationRate: randomFloat(60, 90),
            hospitalizationRate: randomFloat(1, 8),
            policyStringency: randomFloat(20, 80),
            avgHouseholdIncome: random(45000, 110000),
            unemploymentRate: randomFloat(3, 8),
            costOfLivingIndex: randomFloat(85, 145)
          };
          
          count++;
          if (count % 1000 === 0) {
            console.log(`  Generated ${count} state records...`);
          }
        });
      });
    });
  });
  
  console.log(`✓ Generated ${Object.keys(stateData).length} state data records`);
  return stateData;
}

// Generate time series data
function generateTimeSeries() {
  const timeSeries = [];
  let count = 0;
  
  console.log('Generating time series...');
  
  demographics.forEach(demographic => {
    ageGroups.forEach(ageGroup => {
      occupations.forEach(occupation => {
        const series = {
          demographic,
          ageGroup,
          occupation,
          data: []
        };
        
        quarters.forEach(quarter => {
          const base = random(5000, 50000);
          const covidImpact = quarter.startsWith('2020-Q2') || quarter.startsWith('2020-Q3') ? randomFloat(2, 3.5) :
                             quarter.startsWith('2020') || quarter.startsWith('2021') ? randomFloat(1.3, 2.2) : randomFloat(0.9, 1.1);
          
          series.data.push({
            quarter,
            totalMigration: Math.floor(base * covidImpact),
            inflow: Math.floor(base * covidImpact * randomFloat(0.4, 0.7)),
            outflow: Math.floor(base * covidImpact * randomFloat(0.3, 0.6))
          });
        });
        
        timeSeries.push(series);
        count++;
        if (count % 100 === 0) {
          console.log(`  Generated ${count} time series...`);
        }
      });
    });
  });
  
  console.log(`✓ Generated ${timeSeries.length} time series`);
  return timeSeries;
}

// Generate infodemic data
function generateInfodemicData() {
  const infodemic = [];
  
  console.log('Generating infodemic data...');
  
  Object.keys(states).forEach(state => {
    quarters.forEach(quarter => {
      infodemic.push({
        state,
        quarter,
        covidCases: random(1000, 100000),
        misinformationIndex: randomFloat(20, 95),
        socialMediaActivity: random(10000, 500000),
        factCheckingRate: randomFloat(10, 60),
        topMisinfo: ['vaccine myths', 'lockdown conspiracy', 'mask ineffectiveness'][random(0, 2)],
        sentiment: randomFloat(-0.8, 0.3)
      });
    });
  });
  
  console.log(`✓ Generated ${infodemic.length} infodemic records`);
  return infodemic;
}

// Generate policy data
function generatePolicyData() {
  const policies = [];
  
  console.log('Generating policy data...');
  
  Object.keys(states).forEach(state => {
    quarters.forEach(quarter => {
      const stringency = randomFloat(20, 95);
      
      policies.push({
        state,
        quarter,
        stringency,
        lockdownLevel: stringency > 70 ? 'strict' : stringency > 40 ? 'moderate' : 'minimal',
        maskMandate: stringency > 50,
        businessRestrictions: stringency > 60,
        travelRestrictions: stringency > 55,
        gatheringLimits: stringency > 45,
        schoolClosure: stringency > 70,
        duration: random(2, 16)
      });
    });
  });
  
  console.log(`✓ Generated ${policies.length} policy records`);
  return policies;
}

// Generate resilience data
function generateResilienceData() {
  const resilience = [];
  
  console.log('Generating resilience data...');
  
  Object.keys(states).forEach(state => {
    quarters.forEach(quarter => {
      const isCovidPeak = quarter.includes('2020-Q2') || quarter.includes('2020-Q3') || quarter.includes('2021-Q1');
      
      resilience.push({
        state,
        quarter,
        economicRecovery: isCovidPeak ? randomFloat(30, 60) : randomFloat(70, 100),
        mobilityIndex: isCovidPeak ? randomFloat(20, 50) : randomFloat(75, 105),
        airQuality: isCovidPeak ? randomFloat(85, 100) : randomFloat(60, 85),
        mentalHealthIndex: isCovidPeak ? randomFloat(40, 65) : randomFloat(60, 85),
        employmentRate: isCovidPeak ? randomFloat(75, 88) : randomFloat(92, 97),
        consumerSpending: isCovidPeak ? randomFloat(50, 75) : randomFloat(85, 110)
      });
    });
  });
  
  console.log(`✓ Generated ${resilience.length} resilience records`);
  return resilience;
}

// Generate emotional data
function generateEmotionalData() {
  const emotions = [];
  
  console.log('Generating emotional data...');
  
  Object.keys(states).forEach(state => {
    quarters.forEach(quarter => {
      const isCovidPeak = quarter.includes('2020') || quarter.includes('2021-Q1');
      
      emotions.push({
        state,
        quarter,
        fear: isCovidPeak ? randomFloat(60, 95) : randomFloat(20, 45),
        anger: isCovidPeak ? randomFloat(50, 85) : randomFloat(25, 50),
        sadness: isCovidPeak ? randomFloat(55, 80) : randomFloat(30, 50),
        hope: isCovidPeak ? randomFloat(30, 55) : randomFloat(60, 85),
        anxiety: isCovidPeak ? randomFloat(65, 90) : randomFloat(35, 60),
        fatigue: quarter.includes('2021') ? randomFloat(70, 95) : isCovidPeak ? randomFloat(50, 70) : randomFloat(30, 50),
        dominantEmotion: isCovidPeak ? ['fear', 'anxiety', 'anger'][random(0, 2)] : ['hope', 'fatigue'][random(0, 1)]
      });
    });
  });
  
  console.log(`✓ Generated ${emotions.length} emotional records`);
  return emotions;
}

// Write data in chunks to avoid memory issues
function writeDataChunked(filename, data) {
  console.log(`Writing ${filename}...`);
  const dataDir = path.join(__dirname, '../data');
  const filePath = path.join(dataDir, filename);
  
  // Write as JSONL for large datasets, or regular JSON for smaller ones
  if (Array.isArray(data) && data.length > 10000) {
    // Write as line-delimited JSON
    const stream = fs.createWriteStream(filePath.replace('.json', '.jsonl'));
    data.forEach(item => {
      stream.write(JSON.stringify(item) + '\n');
    });
    stream.end();
    console.log(`  ✓ Wrote ${filename.replace('.json', '.jsonl')} (JSONL format for large data)`);
  } else {
    // Regular JSON
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`  ✓ Wrote ${filename}`);
  }
}

// Main generation function
function generateAllData() {
  console.log('\n========================================');
  console.log('COVID-19 Migration Data Generator');
  console.log('========================================\n');
  
  const startTime = Date.now();
  
  const flows = generateMigrationFlows();
  const stateData = generateStateData();
  const timeSeries = generateTimeSeries();
  const infodemic = generateInfodemicData();
  const policies = generatePolicyData();
  const resilience = generateResilienceData();
  const emotions = generateEmotionalData();
  
  console.log('\n========================================');
  console.log('Writing data files...');
  console.log('========================================\n');
  
  // Ensure data directory exists
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  writeDataChunked('migrationFlows.json', flows);
  writeDataChunked('stateData.json', stateData);
  writeDataChunked('timeSeries.json', timeSeries);
  writeDataChunked('infodemic.json', infodemic);
  writeDataChunked('policies.json', policies);
  writeDataChunked('resilience.json', resilience);
  writeDataChunked('emotions.json', emotions);
  fs.writeFileSync(path.join(dataDir, 'states.json'), JSON.stringify(states, null, 2));
  
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  
  console.log('\n========================================');
  console.log('✓ All data generated successfully!');
  console.log(`✓ Time elapsed: ${elapsed}s`);
  console.log('========================================\n');
}

// Run generation
generateAllData();
