import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import './MigrationMap.css';

const MigrationMap = ({ filters, viewLevel }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mapData, setMapData] = useState(null);
  const [stateData, setStateData] = useState({});
  const [migrationFlows, setMigrationFlows] = useState([]);

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Fetch map topology
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
      .then(response => response.json())
      .then(us => {
        setMapData(us);
      })
      .catch(error => console.error('Error loading map data:', error));
  }, []);

  // Fetch state data when filters change
  useEffect(() => {
    const fetchStateData = async () => {
      try {
        const params = new URLSearchParams({
          demographic: filters.demographicGroup,
          ageGroup: filters.ageGroup,
          occupation: filters.occupation
        });
        
        const response = await axios.get(`/api/state-summary?${params}`);
        setStateData(response.data);
      } catch (error) {
        console.error('Error fetching state data:', error);
      }
    };

    fetchStateData();
  }, [filters]);

  // Fetch migration flows when filters change
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const gender = filters.womenOnly ? 'female' : filters.menOnly ? 'male' : 'all';
        
        // Adjust minFlow based on view level
        const minFlow = viewLevel === 'Nation' ? '5000' : 
                       viewLevel === 'Individual' ? '500' : '1000';
        
        const params = new URLSearchParams({
          demographic: filters.demographicGroup,
          ageGroup: filters.ageGroup,
          occupation: filters.occupation,
          gender: gender,
          minFlow: minFlow
        });
        
        const response = await axios.get(`/api/migration-flows?${params}`);
        setMigrationFlows(response.data);
      } catch (error) {
        console.error('Error fetching migration flows:', error);
      }
    };

    fetchFlows();
  }, [filters, viewLevel]); // NOW RESPONDS TO VIEW LEVEL!

  // Draw map
  useEffect(() => {
    if (!mapData || !dimensions.width || !dimensions.height || Object.keys(stateData).length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    
    // Create projection
    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(width * 1.3);

    const path = d3.geoPath().projection(projection);

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'map-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '10px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('box-shadow', '0 2px 8px rgba(0,0,0,0.15)');

    // Determine which metric to use for coloring based on COVID metric filter
    const getMetricValue = (data) => {
      switch(filters.covidMetric) {
        case '7-day infection rate':
          return data.infectionRate;
        case 'Vaccination rate':
          return data.vaccinationRate;
        case 'Hospitalization rate':
          return data.hospitalizationRate;
        case 'Death rate':
          return data.covidDeaths / data.covidCases * 100;
        case 'Total cases per capita':
          return (data.covidCases / data.population) * 100000;
        default:
          return data.netMigration;
      }
    };

    // Create color scale - changes based on selected COVID metric!
    const metricValues = Object.values(stateData).map(d => getMetricValue(d));
    const netMigrationValues = Object.values(stateData).map(d => d.netMigration);
    
    // Use different color schemes for COVID metrics vs net migration
    const isCOVIDMetric = filters.covidMetric !== 'Net migration';
    const colorScale = isCOVIDMetric ? 
      d3.scaleLinear()
        .domain([d3.min(metricValues), d3.median(metricValues), d3.max(metricValues)])
        .range(['#a8e6cf', '#ffd3b6', '#ff8b94']) // Green to yellow to red for COVID
        .clamp(true) :
      d3.scaleLinear()
        .domain([d3.min(netMigrationValues), 0, d3.max(netMigrationValues)])
        .range(['#ef5350', '#e0e0e0', '#42a5f5']) // Red to gray to blue for migration
        .clamp(true);

    // Convert TopoJSON to GeoJSON
    const states = require('topojson-client').feature(mapData, mapData.objects.states);

    // Draw states
    svg.append('g')
      .selectAll('path')
      .data(states.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        const stateName = d.properties.name;
        const data = stateData[stateName];
        if (!data) return '#e0e0e0';
        
        const metricValue = getMetricValue(data);
        return colorScale(metricValue);
      })
      .attr('stroke', '#666')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.8)
      .on('mouseover', function(event, d) {
        const stateName = d.properties.name;
        const data = stateData[stateName];
        
        d3.select(this)
          .attr('opacity', 1)
          .attr('stroke', '#333')
          .attr('stroke-width', 2);

        if (data) {
          const metricValue = getMetricValue(data);
          tooltip.html(`
            <strong>${stateName}</strong><br/>
            <hr style="margin: 5px 0; border: none; border-top: 1px solid #ddd;"/>
            <strong>Migration:</strong><br/>
            Net: ${data.netMigration.toLocaleString()}<br/>
            Inflow: ${data.inflow.toLocaleString()}<br/>
            Outflow: ${data.outflow.toLocaleString()}<br/>
            <hr style="margin: 5px 0; border: none; border-top: 1px solid #ddd;"/>
            <strong>COVID Metrics:</strong><br/>
            ${filters.covidMetric}: ${metricValue.toFixed(2)}${filters.covidMetric.includes('rate') ? '%' : ''}<br/>
            Cases: ${data.covidCases.toLocaleString()}<br/>
            Vaccination: ${data.vaccinationRate.toFixed(1)}%<br/>
            <hr style="margin: 5px 0; border: none; border-top: 1px solid #ddd;"/>
            <strong>Policy:</strong><br/>
            Stringency: ${data.policyStringency.toFixed(0)}/100
          `)
            .style('visibility', 'visible')
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px');
        }
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.8)
          .attr('stroke', '#666')
          .attr('stroke-width', 0.5);
        
        tooltip.style('visibility', 'hidden');
      });

    // Filter flows based on policy stringency
    const policyFilteredFlows = migrationFlows.filter(flow => {
      const fromData = stateData[flow.from];
      const toData = stateData[flow.to];
      
      if (!fromData || !toData) return true;
      
      const threshold = parseFloat(filters.strictnessThreshold) / 100 * 100; // Normalize
      
      switch(filters.policyStrictness) {
        case 'more-strict':
          return toData.policyStringency > fromData.policyStringency + 10;
        case 'less-strict':
          return toData.policyStringency < fromData.policyStringency - 10;
        case 'equal':
          return Math.abs(toData.policyStringency - fromData.policyStringency) < 10;
        default:
          return true;
      }
    });

    // Adjust number of flows based on view level
    const maxFlows = viewLevel === 'Nation' ? 30 : 
                    viewLevel === 'Individual' ? 150 : 100;
    const displayFlows = policyFilteredFlows.slice(0, maxFlows);

    // Draw migration flows
    if (displayFlows.length > 0) {
      // Create arrow marker
      svg.append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('refX', 9)
        .attr('refY', 3)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0 0, 10 3, 0 6')
        .attr('fill', '#666');

      // Draw flow lines
      displayFlows.forEach(flow => {
        const source = projection([flow.fromLon, flow.fromLat]);
        const target = projection([flow.toLon, flow.toLat]);

        if (!source || !target) return;

        // Calculate curve
        const dx = target[0] - source[0];
        const dy = target[1] - source[1];
        const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;

        const color = flow.value > 10000 ? '#e74c3c' : flow.value > 5000 ? '#f39c12' : '#3498db';
        const width = Math.max(0.5, Math.min(5, Math.sqrt(flow.value) / 30));

        svg.append('path')
          .attr('d', `M${source[0]},${source[1]}A${dr},${dr} 0 0,1 ${target[0]},${target[1]}`)
          .attr('fill', 'none')
          .attr('stroke', color)
          .attr('stroke-width', width)
          .attr('opacity', 0.4)
          .attr('marker-end', 'url(#arrowhead)')
          .on('mouseover', function(event) {
            d3.select(this)
              .attr('opacity', 0.8)
              .attr('stroke-width', width * 1.5);

            const fromData = stateData[flow.from];
            const toData = stateData[flow.to];

            tooltip.html(`
              <strong>${flow.from} → ${flow.to}</strong><br/>
              <hr style="margin: 5px 0; border: none; border-top: 1px solid #ddd;"/>
              Migrants: ${flow.value.toLocaleString()}<br/>
              Demographic: ${flow.demographic}<br/>
              Age: ${flow.ageGroup}<br/>
              Occupation: ${flow.occupation}<br/>
              ${flow.gender !== 'all' ? `Gender: ${flow.gender}<br/>` : ''}
              <hr style="margin: 5px 0; border: none; border-top: 1px solid #ddd;"/>
              <strong>Policy Change:</strong><br/>
              From: ${fromData?.policyStringency.toFixed(0) || 'N/A'} → To: ${toData?.policyStringency.toFixed(0) || 'N/A'}<br/>
              <strong>COVID Impact:</strong><br/>
              From ${filters.covidMetric}: ${fromData ? getMetricValue(fromData).toFixed(1) : 'N/A'}%<br/>
              To ${filters.covidMetric}: ${toData ? getMetricValue(toData).toFixed(1) : 'N/A'}%
            `)
              .style('visibility', 'visible')
              .style('top', (event.pageY - 10) + 'px')
              .style('left', (event.pageX + 10) + 'px');
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('opacity', 0.4)
              .attr('stroke-width', width);
            
            tooltip.style('visibility', 'hidden');
          });
      });
    }

    // Add legend - updates based on selected metric
    const legendWidth = 200;
    const legendHeight = 10;
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - legendWidth - 30}, ${height - 100})`);

    // Legend background
    legend.append('rect')
      .attr('x', -10)
      .attr('y', -40)
      .attr('width', legendWidth + 20)
      .attr('height', 90)
      .attr('fill', 'white')
      .attr('opacity', 0.95)
      .attr('stroke', '#ccc')
      .attr('rx', 4);

    // Legend title - shows current metric
    legend.append('text')
      .attr('x', 0)
      .attr('y', -20)
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(filters.covidMetric);

    legend.append('text')
      .attr('x', 0)
      .attr('y', -5)
      .attr('font-size', '10px')
      .attr('fill', '#666')
      .text(`View: ${viewLevel}`);

    // Create gradient
    const gradient = legend.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%');

    if (isCOVIDMetric) {
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#a8e6cf');
      gradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#ffd3b6');
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ff8b94');
    } else {
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#ef5350');
      gradient.append('stop')
        .attr('offset', '50%')
        .attr('stop-color', '#e0e0e0');
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#42a5f5');
    }

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .attr('y', 10)
      .style('fill', 'url(#legend-gradient)');

    // Legend labels
    const minValue = d3.min(metricValues);
    const maxValue = d3.max(metricValues);

    legend.append('text')
      .attr('x', 0)
      .attr('y', legendHeight + 25)
      .attr('font-size', '10px')
      .text(isCOVIDMetric ? 'Low' : 'High Outflow');

    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', legendHeight + 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text(isCOVIDMetric ? 'Medium' : 'Balanced');

    legend.append('text')
      .attr('x', legendWidth)
      .attr('y', legendHeight + 25)
      .attr('text-anchor', 'end')
      .attr('font-size', '10px')
      .text(isCOVIDMetric ? 'High' : 'High Inflow');

    // Cleanup tooltip on unmount
    return () => {
      tooltip.remove();
    };

  }, [mapData, stateData, migrationFlows, dimensions, filters, viewLevel]); // ALL DEPENDENCIES!

  return (
    <div className="migration-map-container">
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%"
        style={{ background: '#f8f9fa' }}
      />
    </div>
  );
};

export default MigrationMap;
