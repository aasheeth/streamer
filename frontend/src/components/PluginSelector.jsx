import React from 'react';

const PluginSelector = ({ plugins, selectedPlugin, onPluginChange }) => {
  if (!plugins || plugins.length === 0) {
    return <div className="no-plugins">No data source plugins available</div>;
  }
  
  return (
    <div className="plugin-selector">
      <label htmlFor="plugin-select">Select Data Source:</label>
      <select 
        id="plugin-select"
        value={selectedPlugin}
        onChange={(e) => onPluginChange(e.target.value)}
      >
        {plugins.map(plugin => (
          <option key={plugin} value={plugin}>
            {plugin}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PluginSelector;