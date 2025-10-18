"use client";
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- Main Page Component ---
export default function PathVisualizationPage() {
  const mountRef = useRef(null);
  const [telemetry, setTelemetry] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    // --- Basic Scene Setup ---
    const currentMount = mountRef.current;
    if (!currentMount) return; // Guard against null ref
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.set(10, 15, 20);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);

    // --- Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // --- World Axes (like RViz) ---
    const worldAxes = new THREE.AxesHelper(25);
    scene.add(worldAxes);

    // --- Path Definition (a smooth 3D curve) ---
    const pathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10, 0, 10),
      new THREE.Vector3(-5, 5, -5),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, -5, 5),
      new THREE.Vector3(10, 0, 10),
      new THREE.Vector3(15, 8, -8),
      new THREE.Vector3(8, 3, -15),
      new THREE.Vector3(-10, 0, 10),
    ]);

    // Visualize the path with a tube
    const pathGeometry = new THREE.TubeGeometry(pathCurve, 100, 0.1, 8, false);
    const pathMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const pathMesh = new THREE.Mesh(pathGeometry, pathMaterial);
    scene.add(pathMesh);

    // --- The Flying Object (a cone to show direction) ---
    const objectGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
    objectGeometry.rotateX(Math.PI / 2); // Point the cone forward
    const objectMaterial = new THREE.MeshStandardMaterial({ color: 0xff4500 });
    const vehicle = new THREE.Mesh(objectGeometry, objectMaterial);

    // Add local axes to the object itself
    const vehicleAxes = new THREE.AxesHelper(2);
    vehicle.add(vehicleAxes);
    scene.add(vehicle);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Get elapsed time to create a looping animation
      const elapsedTime = clock.getElapsedTime();
      const loopTime = 10; // Time in seconds for one full loop
      const progress = (elapsedTime % loopTime) / loopTime;

      // Move the object along the path
      const newPosition = pathCurve.getPointAt(progress);
      vehicle.position.copy(newPosition);
      
      // Update telemetry only if component is still mounted
      if(mountRef.current) {
        setTelemetry({ x: newPosition.x, y: newPosition.y, z: newPosition.z });
      }

      // Make the vehicle always point forward along the tangent
      const lookAtPosition = pathCurve.getPointAt((progress + 0.01) % 1);
      vehicle.lookAt(lookAtPosition);


      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- Handle Window Resize ---
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.header}>Path Visualization</h1>
        <div style={styles.canvasContainer} ref={mountRef}></div>
        <div style={styles.telemetry}>
          Position: 
          X: {telemetry.x.toFixed(2)}, 
          Y: {telemetry.y.toFixed(2)}, 
          Z: {telemetry.z.toFixed(2)}
        </div>
      </div>
    </div>
  );
}


// --- Inline Styles (Self-contained) ---
const styles = {
  page: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    background: '#1a1a1a',
    color: '#ffffff',
  },
  container: {
    width: '95%',
    height: '95%',
    display: 'flex',
    flexDirection: 'column',
    background: '#2a2a2a',
    borderRadius: '16px',
    padding: '16px',
    boxSizing: 'border-box',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
  },
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
    textAlign: 'center',
  },
  canvasContainer: {
    flex: 1,
    width: '100%',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  telemetry: {
    marginTop: '16px',
    fontFamily: 'monospace',
    fontSize: '16px',
    textAlign: 'center',
    background: 'rgba(0, 0, 0, 0.3)',
    padding: '8px',
    borderRadius: '8px',
  },
};