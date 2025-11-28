import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import axios from 'axios';
import './GravityNetwork.css';

const GravityNetwork = ({ filters }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const nodesRef = useRef([]);
  const edgesRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 100);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 200;
    controlsRef.current = controls;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
    gridHelper.position.y = -50;
    scene.add(gridHelper);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Fetch and visualize data
    fetchNetworkData();

    // Animation loop
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      // Update physics simulation
      updateForces();
      
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Re-fetch data when filters change
  useEffect(() => {
    fetchNetworkData();
  }, [filters]);

  const fetchNetworkData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        demographic: filters.demographicGroup,
        ageGroup: filters.ageGroup,
        occupation: filters.occupation
      });
      
      const response = await axios.get(`/api/3d-network?${params}`);
      const { nodes, edges } = response.data;
      
      visualizeNetwork(nodes, edges);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching 3D network data:', error);
      setLoading(false);
    }
  };

  const visualizeNetwork = (nodes, edges) => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear previous nodes and edges
    nodesRef.current.forEach(node => scene.remove(node.mesh));
    edgesRef.current.forEach(edge => scene.remove(edge));
    nodesRef.current = [];
    edgesRef.current = [];

    // Create nodes (states as spheres)
    const nodeObjects = nodes.map(node => {
      // Calculate node size based on population
      const size = Math.log(node.population / 100000) * 2 + 2;
      
      // Color based on net migration (red = outflow, green = inflow)
      const color = node.netMigration > 0 
        ? new THREE.Color(0.2, 0.8, 0.3) // Green for inflow
        : new THREE.Color(0.9, 0.3, 0.3); // Red for outflow

      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.9
      });
      const mesh = new THREE.Mesh(geometry, material);

      // Initial random position
      mesh.position.set(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100
      );

      // Add text label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 128;
      context.fillStyle = '#ffffff';
      context.font = 'Bold 48px Arial';
      context.textAlign = 'center';
      context.fillText(node.abbr, 128, 80);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(8, 4, 1);
      sprite.position.copy(mesh.position);
      sprite.position.y += size + 2;
      scene.add(sprite);

      // Store data with mesh
      mesh.userData = {
        ...node,
        sprite: sprite,
        velocity: new THREE.Vector3(),
        acceleration: new THREE.Vector3()
      };

      scene.add(mesh);
      return { mesh, data: node };
    });

    nodesRef.current = nodeObjects;

    // Create edges (migration flows as curves)
    edges.forEach(edge => {
      const sourceNode = nodeObjects.find(n => n.data.id === edge.source);
      const targetNode = nodeObjects.find(n => n.data.id === edge.target);

      if (sourceNode && targetNode) {
        // Create curved line
        const curve = new THREE.QuadraticBezierCurve3(
          sourceNode.mesh.position,
          new THREE.Vector3(
            (sourceNode.mesh.position.x + targetNode.mesh.position.x) / 2,
            (sourceNode.mesh.position.y + targetNode.mesh.position.y) / 2 + 10,
            (sourceNode.mesh.position.z + targetNode.mesh.position.z) / 2
          ),
          targetNode.mesh.position
        );

        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Color and thickness based on flow value
        const opacity = Math.min(edge.value / 50000, 0.6);
        const material = new THREE.LineBasicMaterial({
          color: 0x4a9eff,
          transparent: true,
          opacity: opacity,
          linewidth: 1
        });

        const line = new THREE.Line(geometry, material);
        line.userData = edge;
        scene.add(line);
        edgesRef.current.push(line);
      }
    });
  };

  const updateForces = () => {
    const nodes = nodesRef.current;
    if (nodes.length === 0) return;

    const centerForce = 0.001;
    const repulsionStrength = 50;
    const attractionStrength = 0.01;
    const damping = 0.9;

    nodes.forEach(({ mesh }) => {
      const data = mesh.userData;
      
      // Reset acceleration
      data.acceleration.set(0, 0, 0);

      // 1. Center force (weak attraction to origin)
      const centerDist = mesh.position.length();
      if (centerDist > 0) {
        const centerDir = mesh.position.clone().normalize().multiplyScalar(-1);
        data.acceleration.add(centerDir.multiplyScalar(centerForce * centerDist));
      }

      // 2. Repulsion from other nodes (COVID force)
      nodes.forEach(({ mesh: otherMesh }) => {
        if (mesh === otherMesh) return;

        const diff = new THREE.Vector3().subVectors(mesh.position, otherMesh.position);
        const dist = diff.length();
        if (dist > 0 && dist < 50) {
          const repulsion = diff.normalize().multiplyScalar(
            repulsionStrength * data.covidForce / (dist * dist)
          );
          data.acceleration.add(repulsion);
        }
      });

      // 3. Economic attraction (pull nodes with high employment together)
      nodes.forEach(({ mesh: otherMesh }) => {
        if (mesh === otherMesh) return;
        const otherData = otherMesh.userData;

        const economicSimilarity = 1 - Math.abs(data.economicForce - otherData.economicForce);
        if (economicSimilarity > 0.7) {
          const diff = new THREE.Vector3().subVectors(otherMesh.position, mesh.position);
          const dist = diff.length();
          if (dist > 0) {
            const attraction = diff.normalize().multiplyScalar(
              attractionStrength * economicSimilarity * 0.1
            );
            data.acceleration.add(attraction);
          }
        }
      });

      // Update velocity and position
      data.velocity.add(data.acceleration);
      data.velocity.multiplyScalar(damping);
      
      // Limit velocity
      const maxVelocity = 1.0;
      if (data.velocity.length() > maxVelocity) {
        data.velocity.normalize().multiplyScalar(maxVelocity);
      }

      mesh.position.add(data.velocity);

      // Update label position
      if (data.sprite) {
        data.sprite.position.copy(mesh.position);
        data.sprite.position.y += 5;
      }
    });

    // Update edge positions
    edgesRef.current.forEach(edge => {
      const sourceNode = nodesRef.current.find(n => n.data.id === edge.userData.source);
      const targetNode = nodesRef.current.find(n => n.data.id === edge.userData.target);

      if (sourceNode && targetNode) {
        const curve = new THREE.QuadraticBezierCurve3(
          sourceNode.mesh.position,
          new THREE.Vector3(
            (sourceNode.mesh.position.x + targetNode.mesh.position.x) / 2,
            (sourceNode.mesh.position.y + targetNode.mesh.position.y) / 2 + 10,
            (sourceNode.mesh.position.z + targetNode.mesh.position.z) / 2
          ),
          targetNode.mesh.position
        );

        const points = curve.getPoints(50);
        edge.geometry.setFromPoints(points);
      }
    });
  };

  return (
    <div className="gravity-network-container">
      <div ref={containerRef} className="gravity-canvas" />
      {loading && (
        <div className="gravity-loading">
          <div className="spinner"></div>
          <p>Loading 3D Network...</p>
        </div>
      )}
      <div className="gravity-legend">
        <h4>3D Gravity Model</h4>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#2ecc71' }}></div>
          <span>Inflow States (Net Positive Migration)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#e74c3c' }}></div>
          <span>Outflow States (Net Negative Migration)</span>
        </div>
        <div className="legend-item">
          <div className="legend-line"></div>
          <span>Migration Flows (thickness = volume)</span>
        </div>
        <p className="legend-note">
          <strong>Forces:</strong> COVID severity (repulsion) • Economic opportunity (attraction) • Policy similarity (clustering)
        </p>
        <p className="legend-controls">
          <strong>Controls:</strong> Left-click drag to rotate • Right-click drag to pan • Scroll to zoom
        </p>
      </div>
    </div>
  );
};

export default GravityNetwork;
