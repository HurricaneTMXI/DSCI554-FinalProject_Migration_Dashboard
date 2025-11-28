import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { loadDemographicsData } from '../utils/dataLoader';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import MigrationMap from '../components/MigrationMap/MigrationMap';
import GravityNetwork from '../components/GravityNetwork/GravityNetwork';
import CausalityNetwork from '../components/CausalityNetwork/CausalityNetwork';
import Filters from '../components/Filters/Filters';
import './Home.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Home = ({ font, color, fontColor, hoverColor, changeFont, changeBackgroundColor, changeFontColor, changeHoverColor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewLevel, setViewLevel] = useState('State/Metro');
  const [visualizationMode, setVisualizationMode] = useState('2D'); // '2D' or '3D'
  const [filters, setFilters] = useState({
    demographicGroup: 'Asian American',
    ageGroup: '25-34',
    womenOnly: false,
    menOnly: false,
    occupation: 'Remote-work eligible',
    covidMetric: '7-day infection rate',
    policyStrictness: 'more-strict',
    strictnessThreshold: 120
  });
  const [demographicsData, setDemographicsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Fetch demographics breakdown
  useEffect(() => {
    const fetchDemographics = async () => {
      try {
        const data = await loadDemographicsData('2023-Q4');
        
        // Apply current filters to the demographics data
        const filteredData = filterDemographicsData(data);
        
        setDemographicsData(filteredData);
      } catch (error) {
        console.error('Error fetching demographics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDemographics();
  }, [filters]);

  // Filter demographics based on current selections
  const filterDemographicsData = (data) => {
    const processed = [];
    
    // Gender breakdown
    const totalGender = data.byGender.male + data.byGender.female;
    if (totalGender > 0) {
      if (filters.menOnly) {
        processed.push({
          label: 'Male',
          value: 100,
          color: '#5dade2'
        });
      } else if (filters.womenOnly) {
        processed.push({
          label: 'Female', 
          value: 100,
          color: '#ec7063'
        });
      } else {
        processed.push({
          label: 'Male',
          value: (data.byGender.male / totalGender * 100),
          color: '#5dade2'
        });
        processed.push({
          label: 'Female',
          value: (data.byGender.female / totalGender * 100),
          color: '#ec7063'
        });
      }
    }
    
    // Age groups
    if (filters.ageGroup === 'All Ages') {
      const sortedAge = Object.entries(data.byAge)
        .filter(([age]) => age !== 'All Ages')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      const totalAge = sortedAge.reduce((sum, [, value]) => sum + value, 0);
      sortedAge.forEach(([label, value], idx) => {
        processed.push({
          label: label,
          value: (value / totalAge * 100),
          color: ['#48c9b0', '#f39c12', '#e74c3c'][idx]
        });
      });
    } else {
      processed.push({
        label: filters.ageGroup,
        value: 100,
        color: '#48c9b0'
      });
    }
    
    // Occupations
    if (filters.occupation === 'All Occupations') {
      const sortedOcc = Object.entries(data.byOccupation)
        .filter(([occ]) => occ !== 'All Occupations')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2);
      
      const totalOcc = sortedOcc.reduce((sum, [, value]) => sum + value, 0);
      sortedOcc.forEach(([label, value], idx) => {
        const shortLabel = label.includes('workers') ? label.split(' ')[0] : label.split(' ')[0];
        processed.push({
          label: shortLabel,
          value: (value / totalOcc * 100),
          color: ['#9b59b6', '#34495e'][idx]
        });
      });
    } else {
      const shortLabel = filters.occupation.includes('workers') ? 
                        filters.occupation.split(' ')[0] : 
                        filters.occupation.split(' ')[0];
      processed.push({
        label: shortLabel,
        value: 100,
        color: '#9b59b6'
      });
    }
    
    return processed;
  };

  // Get view level description
  const getViewDescription = () => {
    switch(viewLevel) {
      case 'Nation':
        return 'National-level aggregate migration patterns';
      case 'State/Metro':
        return 'State-to-state and metropolitan area flows';
      case 'Individual':
        return 'Individual-level migration decisions and patterns';
      default:
        return '';
    }
  };

  // Helper function to determine if a color is light or dark
  const isLightColor = (hexColor) => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155;
  };

  // Determine content colors based on header theme
  const contentBg = isLightColor(color) ? '#f8f9fa' : '#ffffff';
  const accentColor = hoverColor;

  return (
    <div className="home-container" style={{ fontFamily: font }}>
      <Navbar
        toggle={toggle}
        changeFont={changeFont}
        font={font}
        changeBackgroundColor={changeBackgroundColor}
        color={color}
        changeFontColor={changeFontColor}
        fontColor={fontColor}
        changeHoverColor={changeHoverColor}
        hoverColor={hoverColor}
      />

      {/* Home Section - Just the header */}
      <div id="home" style={{ minHeight: '200px', background: color, paddingTop: '100px' }}>
        {/* This is a placeholder for the home section */}
      </div>

      <div className="dashboard-content" style={{ background: color }} id="dashboard">
        <div className="dashboard-header">
          <div className="header-left">
            <h1 style={{ color: fontColor }}>COVID-19 Migration Explorer</h1>
            <p className="subtitle" style={{ color: fontColor }}>
              Visualizing how COVID-19 reshaped where we live, work, and belong across states, counties, and population groups.
            </p>
          </div>
          <div className="header-right">
            <div className="view-level-selector">
              <button 
                className={viewLevel === 'Nation' ? 'active' : ''}
                onClick={() => setViewLevel('Nation')}
                title="View national aggregate patterns"
              >
                Nation
              </button>
              <button 
                className={viewLevel === 'State/Metro' ? 'active' : ''}
                onClick={() => setViewLevel('State/Metro')}
                title="View state-to-state flows"
              >
                ↑ State/Metro
              </button>
              <button 
                className={viewLevel === 'Individual' ? 'active' : ''}
                onClick={() => setViewLevel('Individual')}
                title="View individual-level patterns"
              >
                Individual
              </button>
            </div>
            {viewLevel && (
              <p className="view-description" style={{ color: fontColor }}>{getViewDescription()}</p>
            )}
          </div>
        </div>

        <div className="dashboard-main" style={{ background: contentBg }}>
          <div className="filters-section">
            <Filters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          <div className="visualization-section">
            {/* Toggle between 2D and 3D */}
            <div className="visualization-toggle">
              <button 
                className={visualizationMode === '2D' ? 'active' : ''}
                onClick={() => setVisualizationMode('2D')}
              >
                📍 2D Map View
              </button>
              <button 
                className={visualizationMode === '3D' ? 'active' : ''}
                onClick={() => setVisualizationMode('3D')}
              >
                🌐 3D Gravity Network
              </button>
            </div>

            <div className="map-container" style={{ background: contentBg }}>
              {visualizationMode === '2D' ? (
                <>
                  <MigrationMap filters={filters} viewLevel={viewLevel} />
                  <div className="map-info">
                    <h3>Net Migration Rate</h3>
                    <p>View Level: <strong>{viewLevel}</strong></p>
                    <p className="filter-summary">
                      {filters.demographicGroup} | {filters.ageGroup} | {filters.occupation}
                      {filters.womenOnly && ' | Women Only'}
                      {filters.menOnly && ' | Men Only'}
                    </p>
                    <p className="covid-metric">
                      COVID Metric: <strong>{filters.covidMetric}</strong>
                    </p>
                    <p className="policy-filter">
                      Policy: <strong>{filters.policyStrictness}</strong> ({filters.strictnessThreshold}+)
                    </p>
                  </div>
                </>
              ) : (
                <GravityNetwork filters={filters} />
              )}
            </div>

            {/* Temporal Causality Network replaces time series */}
            <div className="causality-container">
              <CausalityNetwork filters={filters} />
            </div>

            {/* Demographics Panel - Keep as is */}
            <div className="demographics-panel" style={{ background: contentBg }}>
              <h3>Demographics</h3>
              <p className="demographics-subtitle">
                Breakdown for current filters
              </p>
              {demographicsData ? (
                <div className="demographics-bars">
                  {demographicsData.map((item, index) => (
                    <div key={index} className="demo-bar-row">
                      <span className="demo-label">{item.label}</span>
                      <div className="demo-bar-container">
                        <div 
                          className="demo-bar" 
                          style={{ 
                            width: `${item.value}%`, 
                            backgroundColor: item.color 
                          }}
                        />
                        <span className="demo-value">{item.value.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="loading">Loading demographics...</div>
              )}
            </div>
          </div>
        </div>

        <div className="insights-section" id="insights" style={{ background: contentBg }}>
          <h2>Key Insights from COVID-19 Migration Patterns</h2>
          <div className="insights-grid">
            <div className="insight-card" style={{ background: isLightColor(color) ? '#ffffff' : '#f8f9fa', borderLeftColor: accentColor }}>
              <h3>🏙️ Tech Workers Migration</h3>
              <p>
                Remote-work eligible professionals, particularly in tech, showed significant migration 
                from high-cost urban centers (San Francisco, New York) to more affordable states with 
                lower COVID restrictions (Texas, Florida, Colorado). This trend accelerated in 2020-2021 
                as companies adopted permanent remote work policies.
              </p>
            </div>
            <div className="insight-card" style={{ background: isLightColor(color) ? '#ffffff' : '#f8f9fa', borderLeftColor: accentColor }}>
              <h3>👥 Demographic Patterns</h3>
              <p>
                Asian American populations demonstrated increased movement toward California from Texas, 
                correlating with stricter COVID regulations and more welcoming political environments. 
                Hispanic/Latino communities showed migration to areas with strong essential worker demand 
                and family networks.
              </p>
            </div>
            <div className="insight-card" style={{ background: isLightColor(color) ? '#ffffff' : '#f8f9fa', borderLeftColor: accentColor }}>
              <h3>💼 Economic Drivers</h3>
              <p>
                Construction workers and service industry employees migrated to Midwest and Southern states 
                seeking lower cost of living and new opportunities emerging from pandemic-shifted demand. 
                Healthcare workers moved toward areas with critical staffing shortages and higher compensation.
              </p>
            </div>
            <div className="insight-card" style={{ background: isLightColor(color) ? '#ffffff' : '#f8f9fa', borderLeftColor: accentColor }}>
              <h3>📉 COVID-19 Impact</h3>
              <p>
                States with higher infection rates (tracked via {filters.covidMetric}) and stricter lockdown 
                policies experienced greater outmigration, particularly in 2020-Q2 through 2021-Q2. Vaccination 
                rates positively correlated with population retention and economic recovery in 2021-2023.
              </p>
            </div>
            <div className="insight-card" style={{ background: isLightColor(color) ? '#ffffff' : '#f8f9fa', borderLeftColor: accentColor }}>
              <h3>🏡 Urban to Suburban Shift</h3>
              <p>
                Major metropolitan areas lost population to suburban and exurban regions as remote work 
                enabled families to seek larger homes, outdoor space, and lower density. This trend was 
                most pronounced among families with school-age children and young professionals.
              </p>
            </div>
            <div className="insight-card" style={{ background: isLightColor(color) ? '#ffffff' : '#f8f9fa', borderLeftColor: accentColor }}>
              <h3>⚖️ Policy Influence</h3>
              <p>
                Policy stringency levels (currently filtered: {filters.policyStrictness}) significantly 
                influenced migration decisions. States with moderate COVID policies balanced between safety 
                and economic activity showed the most stable population retention across all demographic groups.
              </p>
            </div>
          </div>
        </div>

        <div className="about-section" id="about" style={{ background: contentBg }}>
          <h2>About This Dashboard</h2>
          <div className="about-content">
            <p>
              This visualization tool helps explore how COVID-19 drove population movements across the United States. 
              By combining demographic data, COVID-19 metrics (like {filters.covidMetric}), and policy information, 
              we can identify patterns in how different groups of people relocated during the pandemic.
            </p>
            <p>
              The dashboard features cutting-edge visualizations including a 3D Gravity Model showing force-directed 
              migration flows and a Temporal Causality Network revealing how COVID events triggered migration waves.
            </p>
            
            <h3>Advanced Visualizations</h3>
            <ul>
              <li><strong>3D Gravity Network:</strong> States as nodes in 3D space with forces based on COVID severity, 
              economic opportunity, and policy similarity</li>
              <li><strong>Temporal Causality Network:</strong> Shows how COVID events and policies triggered migration 
              surges with time lags</li>
              <li><strong>Interactive Filtering:</strong> All visualizations update in real-time based on your selections</li>
            </ul>

            <h3>Data & Methodology</h3>
            <p>
              Our analysis is based on comprehensive migration data from 2019-2023, tracking movements across all 
              50 U.S. states. We integrate:
            </p>
            <ul>
              <li><strong>Migration Data:</strong> State-to-state movement patterns by demographics</li>
              <li><strong>COVID-19 Metrics:</strong> Multiple metrics including {filters.covidMetric}</li>
              <li><strong>Policy Data:</strong> Government stringency indices, lockdown measures, mandates</li>
              <li><strong>Economic Indicators:</strong> Employment rates, cost of living, income levels</li>
            </ul>

            <h3>How to Use</h3>
            <ol>
              <li>Select your demographic group, age range, and occupation of interest</li>
              <li>Toggle between 2D Map View and 3D Gravity Network</li>
              <li>Explore the Temporal Causality Network to understand migration triggers</li>
              <li>Switch between Nation/State/Metro/Individual views</li>
              <li>Watch all visualizations update in real-time!</li>
            </ol>
          </div>
        </div>
      </div>

      <Footer
        font={font}
        fontColor={fontColor}
        hoverColor={hoverColor}
        color={color}
      />
    </div>
  );
};

export default Home;
