// src/App.js
import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import DataStreamer from './components/DataStreamer';
import PluginSelector from './components/PluginSelector';
import DataVisualizer from './components/DataVisualizer';
import { DataContext } from './context/DataContext';
import DataDashboard from './components/DataDashboard';

function App() {
  const { data } = useContext(DataContext);
  const [plugins, setPlugins] = useState([]);
  const [selectedPlugin, setSelectedPlugin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        setLoading(true);
        // For demo purposes, we'll hardcode the plugins since the backend might not be ready
        const pluginList = ["example_json", "postgres_table"];
        // Uncomment below to fetch from API when backend is ready
        // const pluginList = await fetchPlugins();
        
        setPlugins(pluginList);
        
        // Auto-select the first plugin if available
        if (pluginList.length > 0) {
          setSelectedPlugin(pluginList[0]);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load plugins: ' + err.message);
        setLoading(false);
      }
    };

    loadPlugins();
  }, []);

  const handlePluginChange = (pluginName) => {
    setSelectedPlugin(pluginName);
  };

  const handleConnectionStatusChange = (status) => {
    setConnectionStatus(status);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-time Data Streaming Dashboard</h1>
        <div className="connection-status">
          Connection Status: <span className={`status-${connectionStatus}`}>{connectionStatus}</span>
        </div>
      </header>
      <main>
        {loading ? (
          <div className="loading">Loading data sources...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="controls-container">
              <PluginSelector 
                plugins={plugins} 
                selectedPlugin={selectedPlugin} 
                onPluginChange={handlePluginChange} 
              />
              <div className="view-toggles">
                <button 
                  className={!showDashboard ? 'active' : ''}
                  onClick={() => setShowDashboard(false)}
                >
                  Data View
                </button>
                <button 
                  className={showDashboard ? 'active' : ''}
                  onClick={() => setShowDashboard(true)}
                >
                  Dashboard
                </button>
              </div>
            </div>
            
            {selectedPlugin && (
              <DataStreamer 
                pluginName={selectedPlugin}
                onStatusChange={handleConnectionStatusChange}
              />
            )}
            
            {showDashboard ? (
              <DataDashboard data={data} />
            ) : (
              <DataVisualizer />
            )}
          </>
        )}
      </main>
      <footer className="App-footer">
        <p>© {new Date().getFullYear()} Real-time Data Streaming</p>
      </footer>
    </div>
  );
}

export default App;