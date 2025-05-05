import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { DataGrid } from './DataGrid';
import { DataStats } from './DataStats';

const DataVisualizer = () => {
  const { data, streamInfo } = useContext(DataContext);
  const [viewMode, setViewMode] = useState('grid');
  
  if (!data || data.length === 0) {
    return (
      <div className="data-visualizer empty-state">
        <p>No data received yet. Select a plugin to start streaming data.</p>
      </div>
    );
  }
  
  return (
    <div className="data-visualizer">
      <div className="visualizer-header">
        <h2>Data Stream</h2>
        <div className="view-controls">
          <button 
            className={viewMode === 'grid' ? 'active' : ''} 
            onClick={() => setViewMode('grid')}
          >
            Grid View
          </button>
          <button 
            className={viewMode === 'stats' ? 'active' : ''} 
            onClick={() => setViewMode('stats')}
          >
            Stats View
          </button>
        </div>
        
        {streamInfo && (
          <div className="stream-info">
            <h3>Source: {streamInfo.type}</h3>
            {streamInfo.type === 'file' && (
              <p>File: {streamInfo.path} ({streamInfo.file_type})</p>
            )}
            {streamInfo.type === 'postgres' && (
              <p>Table: {streamInfo.table} ({streamInfo.row_count} rows)</p>
            )}
          </div>
        )}
        
        <div className="data-counter">
          Records received: {data.length}
        </div>
      </div>
      
      <div className="visualizer-content">
        {viewMode === 'grid' ? (
          <DataGrid data={data} />
        ) : (
          <DataStats data={data} />
        )}
      </div>
    </div>
  );
};

export default DataVisualizer;