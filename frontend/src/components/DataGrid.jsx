import React, { useMemo, useState } from 'react';

export const DataGrid = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Generate columns from the first data item
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    const firstItem = data[0];
    return Object.keys(firstItem)
      .filter(key => typeof firstItem[key] !== 'object') // Filter out nested objects
      .map(key => ({ id: key, label: key }));
  }, [data]);
  
  // Sort and filter data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Make a copy to avoid mutating the original
    let result = [...data];
    
    // Apply search filter if needed
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        Object.values(item).some(val => 
          val !== null && 
          val !== undefined && 
          String(val).toLowerCase().includes(term)
        )
      );
    }
    
    // Apply sorting if needed
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === bValue) return 0;
        
        // Handle numeric values
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle string values
        const aString = String(aValue || '').toLowerCase();
        const bString = String(bValue || '').toLowerCase();
        
        if (sortConfig.direction === 'asc') {
          return aString.localeCompare(bString);
        } else {
          return bString.localeCompare(aString);
        }
      });
    }
    
    return result;
  }, [data, sortConfig, searchTerm]);
  
  // Handle column sorting
  const handleSort = (columnId) => {
    setSortConfig(prevSortConfig => {
      if (prevSortConfig.key === columnId) {
        // Toggle direction if same column
        return {
          key: columnId,
          direction: prevSortConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // New column, default to ascending
        return { key: columnId, direction: 'asc' };
      }
    });
  };
  
  return (
    <div className="data-grid-container">
      <div className="data-grid-toolbar">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="search-results">
          {searchTerm ? `${processedData.length} of ${data.length} records` : ''}
        </span>
      </div>
      
      <div className="data-grid-table-container">
        <table className="data-grid-table">
          <thead>
            <tr>
              {columns.map(column => (
                <th 
                  key={column.id}
                  onClick={() => handleSort(column.id)}
                  className={sortConfig.key === column.id ? `sorted-${sortConfig.direction}` : ''}
                >
                  {column.label}
                  {sortConfig.key === column.id && (
                    <span className="sort-indicator">
                      {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.length > 0 ? (
              processedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map(column => (
                    <td key={`${rowIndex}-${column.id}`}>
                      {row[column.id] !== null && row[column.id] !== undefined 
                        ? String(row[column.id]) 
                        : ''}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="no-data">
                  {searchTerm ? 'No matching records found' : 'No data available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};