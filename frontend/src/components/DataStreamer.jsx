import React, { useEffect, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import useWebSocket from '../hooks/useWebSocket';

const DataStreamer = ({ pluginName, onStatusChange }) => {
  const { setStreamData, setStreamInfo, clearData } = useContext(DataContext);
  
  // Fixed the WebSocket URL to match the backend endpoint
  const { 
    status, 
    messages, 
    connect, 
    disconnect 
  } = useWebSocket(`ws://localhost:8000/ws`);
  
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
    
    // Check if message contains data field
    if (message.data) {
      setStreamData(message.data);
    } else if (message.error) {
      console.error('Stream error:', message.error);
    } else if (message.status === "connected") {
      setStreamInfo({
        type: pluginName,
        status: "connected"
      });
    }
  }, [messages, setStreamData, setStreamInfo, pluginName]);
  
  return null; // This component doesn't render anything
};

export default DataStreamer;