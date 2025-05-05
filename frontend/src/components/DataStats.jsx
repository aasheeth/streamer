import React, { useMemo } from 'react';

export const DataStats = ({ data }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return {};
    
    const result = {};
    const firstItem = data[0];
    
    // Process each column
    Object.keys(firstItem).forEach(key => {
      // Skip non-numeric columns
      if (typeof firstItem[key] !== 'number') {
        return;
      }
      
      const values = data.map(item => item[key]).filter(val => 
        val !== null && val !== undefined && !isNaN(val)
      );
      
      if (values.length === 0) return;
      
      // Calculate stats
      const sum = values.reduce((acc, val) => acc + val, 0);
      const average = sum / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Calculate standard deviation
      const squareDiffs = values.map(value => {
        const diff = value - average;
        return diff * diff;
      });
      const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / values.length;
      const stdDev = Math.sqrt(avgSquareDiff);
      
      result[key] = {
        count: values.length,
        min,
        max,
        sum,
        average: average.toFixed(2),
        stdDev: stdDev.toFixed(2)
      };
    });
    
    return result;
  }, [data]);
  
  return (
    <div className="data-stats">
      <h3>Numerical Data Statistics</h3>
      
      {Object.keys(stats).length === 0 ? (
        <p>No numerical data available for analysis.</p>
      ) : (
        <div className="stats-grid">
          {Object.entries(stats).map(([key, values]) => (
            <div key={key} className="stat-card">
              <h4>{key}</h4>
              <ul>
                <li><strong>Count:</strong> {values.count}</li>
                <li><strong>Min:</strong> {values.min}</li>
                <li><strong>Max:</strong> {values.max}</li>
                <li><strong>Sum:</strong> {values.sum}</li>
                <li><strong>Average:</strong> {values.average}</li>
                <li><strong>Std Dev:</strong> {values.stdDev}</li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};