import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { loadCausalityData } from '../../utils/dataLoader';
import './CausalityNetwork.css';

const CausalityNetwork = ({ filters }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLink, setSelectedLink] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  useEffect(() => {
    if (data && !loading) {
      const timer = setTimeout(() => {
        visualize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data, loading]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadCausalityData(filters);
      
      if (!data || !data.events || !data.migrationSurges || !data.links) {
        throw new Error('Invalid data structure');
      }
      
      setData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching causality data:', error);
      setError(error.message || 'Failed to load data');
      setLoading(false);
    }
  };

  const visualize = () => {
    if (!containerRef.current || !svgRef.current || !data) {
      console.log('Missing refs or data');
      return;
    }

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    
    // Clear previous
    svg.selectAll('*').remove();

    // Get dimensions with proper margins for labels
    const containerWidth = container.clientWidth;
    const margin = { top: 80, right: 180, bottom: 40, left: 180 };
    const width = Math.max(700, containerWidth - margin.left - margin.right - 100); // Reduced internal width
    const height = 550; // Slightly reduced height

    // Set SVG size
    svg
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom)
      .style('overflow', 'visible');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Columns - centered with proper spacing
    const centerOffset = (containerWidth - width) / 2;
    const leftX = 80;
    const rightX = width - 80;
    const midX = width / 2;

    // Calculate positions
    const maxNodes = Math.max(data.events.length, data.migrationSurges.length);
    const spacing = height / (maxNodes + 1);

    // Colors
    const eventColors = { covid: '#e74c3c', policy: '#3498db' };
    const surgeColors = { inflow: '#2ecc71', outflow: '#e67e22' };

    // Draw links
    data.links.forEach(link => {
      const sourceNode = data.events.find(e => e.id === link.source);
      const targetNode = data.migrationSurges.find(s => s.id === link.target);
      
      if (!sourceNode || !targetNode) return;

      const sy = (data.events.indexOf(sourceNode) + 1) * spacing;
      const ty = (data.migrationSurges.indexOf(targetNode) + 1) * spacing;

      // Curved path - adjusted to connect properly
      const path = g.append('path')
        .attr('d', `M ${leftX + 50} ${sy} C ${midX - 100} ${sy}, ${midX + 100} ${ty}, ${rightX - 50} ${ty}`)
        .attr('fill', 'none')
        .attr('stroke', `rgba(52, 152, 219, ${link.strength * 0.5})`)
        .attr('stroke-width', Math.max(2, link.strength * 3))
        .style('cursor', 'pointer')
        .on('mouseover', function() {
          d3.select(this)
            .attr('stroke', '#f39c12')
            .attr('stroke-width', link.strength * 5);
          setSelectedLink(link);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('stroke', `rgba(52, 152, 219, ${link.strength * 0.5})`)
            .attr('stroke-width', Math.max(2, link.strength * 3));
          setSelectedLink(null);
        });

      // Time lag circle
      const my = (sy + ty) / 2;
      g.append('circle')
        .attr('cx', midX)
        .attr('cy', my)
        .attr('r', 16)
        .attr('fill', '#2c3e50')
        .attr('stroke', '#3498db')
        .attr('stroke-width', 2);

      g.append('text')
        .attr('x', midX)
        .attr('y', my)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('fill', 'white')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text(`${link.lag}Q`);
    });

    // Draw events
    data.events.forEach((event, i) => {
      const y = (i + 1) * spacing;
      const eg = g.append('g');

      // Circle
      eg.append('circle')
        .attr('cx', leftX)
        .attr('cy', y)
        .attr('r', event.severity + 8)
        .attr('fill', eventColors[event.type])
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      // Label - positioned to the left
      eg.append('text')
        .attr('x', leftX - 60)
        .attr('y', y - 2)
        .attr('text-anchor', 'end')
        .attr('fill', 'white')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text(event.label);

      // Quarter
      eg.append('text')
        .attr('x', leftX - 60)
        .attr('y', y + 12)
        .attr('text-anchor', 'end')
        .attr('fill', '#95a5a6')
        .attr('font-size', '10px')
        .style('pointer-events', 'none')
        .text(event.quarter);
    });

    // Draw surges
    data.migrationSurges.forEach((surge, i) => {
      const y = (i + 1) * spacing;
      const sg = g.append('g');

      const radius = Math.sqrt(surge.magnitude / 800) + 8;

      // Circle
      sg.append('circle')
        .attr('cx', rightX)
        .attr('cy', y)
        .attr('r', radius)
        .attr('fill', surgeColors[surge.direction])
        .attr('stroke', 'white')
        .attr('stroke-width', 2);

      // Arrow
      const arrowSize = 10;
      const arrowY = surge.direction === 'inflow' ? y - radius - arrowSize : y + radius + arrowSize;
      sg.append('path')
        .attr('d', surge.direction === 'inflow' 
          ? `M ${rightX} ${arrowY} L ${rightX - 5} ${arrowY - 8} L ${rightX + 5} ${arrowY - 8} Z`
          : `M ${rightX} ${arrowY} L ${rightX - 5} ${arrowY + 8} L ${rightX + 5} ${arrowY + 8} Z`)
        .attr('fill', 'white');

      // State - positioned to the right
      sg.append('text')
        .attr('x', rightX + 60)
        .attr('y', y - 2)
        .attr('text-anchor', 'start')
        .attr('fill', 'white')
        .attr('font-size', '13px')
        .attr('font-weight', 'bold')
        .style('pointer-events', 'none')
        .text(surge.state);

      // Magnitude
      sg.append('text')
        .attr('x', rightX + 60)
        .attr('y', y + 12)
        .attr('text-anchor', 'start')
        .attr('fill', '#95a5a6')
        .attr('font-size', '10px')
        .style('pointer-events', 'none')
        .text(`${(surge.magnitude / 1000).toFixed(1)}K`);
    });

    // Headers
    g.append('text')
      .attr('x', leftX)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ecf0f1')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Events');

    g.append('text')
      .attr('x', rightX)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ecf0f1')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .text('Migration');
  };

  if (error) {
    return (
      <div className="causality-network-container" ref={containerRef}>
        <div className="causality-header">
          <h3>Temporal Causality Network</h3>
          <p>How COVID events and policies triggered migration waves</p>
        </div>
        <div style={{ color: '#e74c3c', textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>⚠️ {error}</p>
          <button 
            onClick={fetchData}
            style={{
              padding: '10px 24px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="causality-network-container" ref={containerRef}>
      <div className="causality-header">
        <h3>Temporal Causality Network</h3>
        <p>How COVID events and policies triggered migration waves</p>
      </div>
      
      {loading ? (
        <div className="causality-loading">
          <div className="spinner"></div>
          <p>Loading causality data...</p>
        </div>
      ) : (
        <>
          <svg ref={svgRef} className="causality-svg"></svg>
          
          {selectedLink && (
            <div className="causality-tooltip">
              <strong>Causal Relationship</strong>
              <p>Time Lag: {selectedLink.lag} quarter{selectedLink.lag !== 1 ? 's' : ''}</p>
              <p>Strength: {(selectedLink.strength * 100).toFixed(0)}%</p>
            </div>
          )}
        </>
      )}

      <div className="causality-legend">
        <div className="legend-section">
          <h4>Events</h4>
          <div className="legend-item">
            <div className="legend-circle" style={{ backgroundColor: '#e74c3c' }}></div>
            <span>COVID Wave</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle" style={{ backgroundColor: '#3498db' }}></div>
            <span>Policy Change</span>
          </div>
        </div>

        <div className="legend-section">
          <h4>Migration</h4>
          <div className="legend-item">
            <div className="legend-circle" style={{ backgroundColor: '#2ecc71' }}></div>
            <span>Inflow</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle" style={{ backgroundColor: '#e67e22' }}></div>
            <span>Outflow</span>
          </div>
        </div>

        <div className="legend-section">
          <h4>Time Lag</h4>
          <p className="legend-note">Quarters between event and migration surge</p>
        </div>
      </div>
    </div>
  );
};

export default CausalityNetwork;
