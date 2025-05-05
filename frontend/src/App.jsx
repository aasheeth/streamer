// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import DataStreamer from './components/DataStreamer';
import PluginSelector from './components/PluginSelector';
import DataVisualizer from './components/DataVisualizer';
import { fetchPlugins } from './services/api';

function App() {
  const [plugins, setPlugins] = useState([]);
  const [selectedPlugin, setSelectedPlugin] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const loadPlugins = async () => {
      try {
        setLoading(true);
        const pluginList = await fetchPlugins();
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
        <h1>Data Streaming Application</h1>
        <div className="connection-status">
          Status: <span className={`status-${connectionStatus}`}>{connectionStatus}</span>
        </div>
      </header>
      <main>
        {loading ? (
          <div className="loading">Loading plugins...</div>
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
            </div>
            
            {selectedPlugin && (
              <DataStreamer 
                pluginName={selectedPlugin}
                onStatusChange={handleConnectionStatusChange}
              />
            )}
            
            <DataVisualizer />
          </>
        )}
      </main>
    </div>
  );
}

export default App;