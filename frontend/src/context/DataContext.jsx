import React, { createContext, useState, useCallback } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [streamInfo, setStreamInfo] = useState(null);
  
  const setStreamData = useCallback((newData) => {
    if (!newData || newData.length === 0) return;
    
    setData(prevData => {
      // Add the new chunk to the existing data
      return [...prevData, ...newData];
    });
  }, []);
  
  const clearData = useCallback(() => {
    setData([]);
    setStreamInfo(null);
  }, []);
  
  return (
    <DataContext.Provider value={{ 
      data, 
      streamInfo, 
      setStreamData, 
      setStreamInfo, 
      clearData 
    }}>
      {children}
    </DataContext.Provider>
  );
};

