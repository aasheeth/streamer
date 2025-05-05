import { useState, useEffect, useCallback, useRef } from 'react';

const useWebSocket = (url) => {
  const [status, setStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const wsRef = useRef(null);
  
  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    setStatus('connecting');
    
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setStatus('connected');
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('error');
    };
    
    ws.onclose = () => {
      setStatus('disconnected');
    };
    
    wsRef.current = ws;
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [url]);
  
  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
  }, []);
  
  // Connect on mount, disconnect on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  // Reset messages when URL changes
  useEffect(() => {
    setMessages([]);
  }, [url]);
  
  return {
    status,
    messages,
    connect,
    disconnect
  };
};

export default useWebSocket;