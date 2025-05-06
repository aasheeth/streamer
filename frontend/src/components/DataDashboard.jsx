import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DataDashboard = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [numericColumns, setNumericColumns] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('');
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Find numeric columns
    const firstItem = data[0];
    const numCols = Object.keys(firstItem).filter(
      key => typeof firstItem[key] === 'number'
    );
    
    setNumericColumns(numCols);
    
    // Set default metric if none selected
    if (numCols.length > 0 && !selectedMetric) {
      setSelectedMetric(numCols[0]);
    }
    
    // Prepare chart data
    if (selectedMetric) {
      const processedData = data.slice(0, 50).map((item, index) => ({
        index,
        [selectedMetric]: item[selectedMetric]
      }));
      setChartData(processedData);
    }
  }, [data, selectedMetric]);

  if (!data || data.length === 0) {
    return (
      <div className="data-visualizer empty-state">
        <p>No data received yet. Select a plugin to start streaming data.</p>
      </div>
    );
  }

  return (
    <div className="data-dashboard">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <div className="dashboard-controls">
          <div className="control-group">
            <label htmlFor="metric-select">Metric:</label>
            <select 
              id="metric-select"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              {numericColumns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label htmlFor="chart-type">Chart Type:</label>
            <select
              id="chart-type"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
            >
              <option value="line">Line Chart</option>
              <option value="bar">Bar Chart</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#646cff" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="index" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={selectedMetric} fill="#646cff" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="data-summary">
        <h3>Data Summary</h3>
        <div className="summary-stats">
          {selectedMetric && (
            <div className="stat-item">
              <strong>{selectedMetric} (Average):</strong> 
              {data && data.length > 0 
                ? (data.reduce((sum, item) => sum + (item[selectedMetric] || 0), 0) / data.length).toFixed(2)
                : 'N/A'
              }
            </div>
          )}
          <div className="stat-item">
            <strong>Records:</strong> {data ? data.length : 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDashboard;