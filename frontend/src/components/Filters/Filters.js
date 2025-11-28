import React from 'react';
import './Filters.css';

const Filters = ({ filters, onFilterChange }) => {
  const demographicGroups = [
    'All Demographics',
    'Asian American',
    'Hispanic/Latino',
    'African American',
    'White',
    'Native American'
  ];

  const ageGroups = [
    'All Ages',
    '18-24',
    '25-34',
    '35-44',
    '45-54',
    '55-64',
    '65+'
  ];

  const covidMetrics = [
    '7-day infection rate',
    'Total cases per capita',
    'Death rate',
    'Vaccination rate',
    'Hospitalization rate'
  ];

  const occupationTypes = [
    'All Occupations',
    'Remote-work eligible',
    'Healthcare workers',
    'Construction workers',
    'Service industry',
    'Tech workers',
    'Education'
  ];

  return (
    <div className="filters-container">
      <h3 className="filters-title">Filters</h3>
      
      <div className="filter-group">
        <label htmlFor="demographic">Demographic Group</label>
        <select 
          id="demographic"
          value={filters.demographicGroup}
          onChange={(e) => onFilterChange('demographicGroup', e.target.value)}
          className="filter-select"
        >
          {demographicGroups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="age">Age Group</label>
        <select 
          id="age"
          value={filters.ageGroup}
          onChange={(e) => onFilterChange('ageGroup', e.target.value)}
          className="filter-select"
        >
          {ageGroups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="checkbox-label">
          <input 
            type="checkbox"
            checked={filters.womenOnly}
            onChange={(e) => onFilterChange('womenOnly', e.target.checked)}
          />
          <span>Women only</span>
        </label>
      </div>

      <div className="filter-group">
        <label className="checkbox-label">
          <input 
            type="checkbox"
            checked={filters.menOnly}
            onChange={(e) => onFilterChange('menOnly', e.target.checked)}
          />
          <span>Men only</span>
        </label>
      </div>

      <div className="filter-group">
        <label htmlFor="occupation">Occupation Filter</label>
        <select 
          id="occupation"
          value={filters.occupation}
          onChange={(e) => onFilterChange('occupation', e.target.value)}
          className="filter-select"
        >
          {occupationTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="filter-section-title">COVID & Policy Context</div>

      <div className="filter-group">
        <label htmlFor="covidMetric">COVID Metric</label>
        <select 
          id="covidMetric"
          value={filters.covidMetric}
          onChange={(e) => onFilterChange('covidMetric', e.target.value)}
          className="filter-select"
        >
          {covidMetrics.map(metric => (
            <option key={metric} value={metric}>{metric}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="strictness">Policy Strictness</label>
        <div className="strictness-control">
          <select 
            id="strictness"
            value={filters.policyStrictness}
            onChange={(e) => onFilterChange('policyStrictness', e.target.value)}
            className="filter-select"
          >
            <option value="any">Any</option>
            <option value="more-strict">More strict</option>
            <option value="equal">Equal strictness</option>
            <option value="less-strict">Less strict</option>
          </select>
          <input 
            type="range"
            min="0"
            max="100"
            value={filters.strictnessThreshold}
            onChange={(e) => onFilterChange('strictnessThreshold', e.target.value)}
            className="strictness-slider"
          />
          <span className="strictness-value">{filters.strictnessThreshold}+</span>
        </div>
      </div>

      <div className="filter-note">
        Applies to all flows, maps, and charts.
      </div>
    </div>
  );
};

export default Filters;
