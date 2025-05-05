import React, { useEffect, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import useWebSocket from '../hooks/useWebSocket';

const DataStreamer = ({ pluginName, onStatusChange }) => {
  const { setStreamData, setStreamInfo, clearData } = useContext(DataContext);
  
  const { 
    status, 
    messages, 
    connect, 
    disconnect 
  } = useWebSocket(`ws://localhost:8000/ws/stream/${pluginName}`);
  
  // Connect/disconnect when plugin changes
  useEffect(() => {
    if (pluginName) {
      // Clear previous data when changing plugins
      clearData();
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [pluginName, connect, disconnect, clearData]);
  
  // Forward connection status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);
  
  // Process incoming messages
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    
    // Process only the newest message
    const message = messages[messages.length - 1];
    
    if (message.type === 'info') {
      setStreamInfo(message.data);
    } else if (message.type === 'data') {
      setStreamData(message.data);
    } else if (message.type === 'error') {
      console.error('Stream error:', message.error);
    }
  }, [messages, setStreamData, setStreamInfo]);
  
  return null; // This component doesn't render anything
};

export default DataStreamer;