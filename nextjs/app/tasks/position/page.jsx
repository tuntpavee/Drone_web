"use client";
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js'; // Import Plot directly

// --- Main Page Component ---
export default function PositionPage() {
  const [plotData, setPlotData] = useState([]);
  const [telemetryData, setTelemetryData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isClient, setIsClient] = useState(false); // State to track if we're on the client

  // This effect runs once on the client to set isClient to true
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to generate new random data for the plot and telemetry
  const generateData = () => {
    const newPlotData = [{
      x: Array.from({ length: 100 }, () => (Math.random() - 0.5) * 20),
      y: Array.from({ length: 100 }, () => (Math.random() - 0.5) * 2),
      z: Array.from({ length: 100 }, () => Math.sin(Math.random() * Math.PI * 2) * 0.5),
      mode: 'markers',
      type: 'scatter3d',
      marker: {
        color: '#3b82f6',
        size: 4,
        opacity: 0.8,
      },
    }];
    setPlotData(newPlotData);

    const newTelemetryData = {
      odometry: 'Enabled',
      position: `${(Math.random() * 10 - 5).toFixed(2)}, ${(Math.random() * 10 - 5).toFixed(2)}, ${(Math.random() * 5).toFixed(2)}`,
      heading: `${(Math.random() * 360).toFixed(1)}°, ${(Math.random() * 90 - 45).toFixed(1)}°, ${(Math.random() * 10 - 5).toFixed(1)}°`,
      velocity: `${(Math.random() * 5).toFixed(2)} m/s`,
      accelerometer: `${(Math.random()).toFixed(3)}, ${(Math.random() * -1).toFixed(3)}, ${(Math.random() * 10).toFixed(3)}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    setTelemetryData(newTelemetryData);
  };

  // This useEffect hook runs only on the client-side after the component mounts.
  // This completely avoids the hydration error.
  useEffect(() => {
    generateData(); // Initial data load
    const interval = setInterval(generateData, 2000); // Refresh data every 2 seconds
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    generateData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Render a loading state until the first set of data is generated client-side
  if (!telemetryData) {
    return <div style={styles.page}>Loading...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.header}>Position Visualize</h1>
        <div style={styles.mainContent}>
          <div style={styles.plotWrapper}>
            {/* Conditionally render the Plot component only on the client side */}
            {isClient && (
              <Plot
                data={plotData}
                layout={{
                  autosize: true,
                  margin: { l: 0, r: 0, b: 0, t: 0 },
                  scene: {
                    xaxis: { title: 'X', color: '#fff', gridcolor: '#555' },
                    yaxis: { title: 'Y', color: '#fff', gridcolor: '#555' },
                    zaxis: { title: 'Z', color: '#fff', gridcolor: '#555' },
                  },
                  paper_bgcolor: 'rgba(0,0,0,0)',
                  plot_bgcolor: 'rgba(0,0,0,0)',
                }}
                style={{ width: '100%', height: '100%' }}
                useResizeHandler={true}
              />
            )}
          </div>
          <div style={styles.telemetryWrapper}>
            <div style={styles.telemetryList}>
              <TelemetryItem label="vehicle_odometry" value={telemetryData.odometry} />
              <TelemetryItem label="Drone local position" value={telemetryData.position} />
              <TelemetryItem label="Heading 3-axis" value={telemetryData.heading} />
              <TelemetryItem label="Velocity" value={telemetryData.velocity} />
              <TelemetryItem label="Accelerometer" value={telemetryData.accelerometer} />
              <TelemetryItem label="Timestamp" value={telemetryData.timestamp} />
            </div>
            <button onClick={handleRefresh} style={styles.button} disabled={isRefreshing}>
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Component for Telemetry Data ---
const TelemetryItem = ({ label, value }) => (
  <div style={styles.telemetryItem}>
    <span style={styles.telemetryLabel}>{label}</span>
    <span style={styles.telemetryValue}>{value}</span>
  </div>
);


// --- Inline Styles (No Tailwind CSS needed!) ---
const styles = {
  page: {
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    background: 'linear-gradient(135deg, #2b3a67 0%, #4a5a94 100%)',
    color: '#ffffff',
    padding: '2rem',
    boxSizing: 'border-box'
  },
  container: {
    width: '100%',
    maxWidth: '1200px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  },
  header: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '16px',
    opacity: 0.9
  },
  mainContent: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  plotWrapper: {
    flex: '3 1 600px',
    minHeight: '450px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '12px',
    padding: '12px'
  },
  telemetryWrapper: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '16px'
  },
  telemetryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  telemetryItem: {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  telemetryLabel: {
    fontWeight: '500',
    opacity: 0.8
  },
  telemetryValue: {
    fontWeight: 'bold',
    fontSize: '16px',
    fontFamily: 'monospace'
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#fff',
    background: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    boxShadow: '0 4px 15px 0 rgba(34, 197, 94, 0.4)'
  },
};

