import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, ChevronUp, Database, FileText, 
  Play, Square, RefreshCw, Layers, HelpCircle, 
  AlertCircle, CheckCircle, XCircle 
} from 'lucide-react';

function App() {
  const [serverUrl, setServerUrl] = useState('ws://localhost:8000/ws/');
  const [plugins, setPlugins] = useState([]);
  const [selectedPlugin, setSelectedPlugin] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [sourceInfo, setSourceInfo] = useState(null);
  const [dataStream, setDataStream] = useState([]);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [logMessages, setLogMessages] = useState([]);
  const [isPluginsDropdownOpen, setIsPluginsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const socketRef = useRef(null);
  const dataContainerRef = useRef(null);
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogMessages(prev => [{
      id: Date.now(),
      timestamp,
      message,
      type
    }, ...prev.slice(0, 99)]); 
  };

  const fetchPlugins = async () => {
    try {
      const serverBase = serverUrl.replace('ws://', 'http://').replace('/ws/', '/');
      const response = await fetch(`${serverBase}plugins`);
      const data = await response.json();
      
      if (data.plugins) {
        const pluginList = Object.keys(data.plugins).map(key => ({
          name: key,
          info: data.plugins[key]
        }));
        setPlugins(pluginList);
        
        if (pluginList.length > 0 && !selectedPlugin) {
          setSelectedPlugin(pluginList[0].name);
        }
        
        addLog(`Found ${pluginList.length} plugins`, 'success');
      }
    } catch (error) {
      addLog(`Error fetching plugins: ${error.message}`, 'error');
    }
  };

  const connectToWebSocket = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    if (!selectedPlugin) {
      addLog('Please select a plugin first', 'error');
      return;
    }

    const url = `${serverUrl}${selectedPlugin}`;
    addLog(`Connecting to ${url}...`);
    setConnectionStatus('connecting');
    
    try {
      socketRef.current = new WebSocket(url);
      
      socketRef.current.onopen = () => {
        addLog('Connection established', 'success');
        setConnectionStatus('connected');
        setDataStream([]);
      };
      
      socketRef.current.onmessage = (event) => {
        const response = JSON.parse(event.data);
        
        if (response.status === 'connected' && response.source_info) {
          setSourceInfo(response.source_info);
          addLog('Received source information', 'success');
        }
        
        if (response.data && Array.isArray(response.data)) {
          addLog(`Received ${response.data.length} records`, 'success');
          setDataStream(prev => [...prev, ...response.data]);
        }
        
        if (response.error) {
          addLog(`Server error: ${response.error}`, 'error');
        }
      };
      
      socketRef.current.onclose = (event) => {
        if (event.wasClean) {
          addLog(`Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
          addLog('Connection died', 'error');
        }
        setConnectionStatus('disconnected');
      };
      
      socketRef.current.onerror = (error) => {
        addLog(`WebSocket error: ${error.message || 'Unknown error'}`, 'error');
        setConnectionStatus('error');
      };
    } catch (error) {
      addLog(`Failed to create WebSocket: ${error.message}`, 'error');
      setConnectionStatus('error');
    }
  };

  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      addLog('Disconnected by user');
    }
  };

  useEffect(() => {
    if (isAutoScroll && dataContainerRef.current) {
      dataContainerRef.current.scrollTop = dataContainerRef.current.scrollHeight;
    }
  }, [dataStream, isAutoScroll]);
  useEffect(() => {
    fetchPlugins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverUrl]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const getTableHeaders = () => {
    if (dataStream.length === 0) return [];
    return Object.keys(dataStream[0]);
  };
  const renderStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'connecting':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-500" />;
    }
  };
  const getSourceIcon = () => {
    if (!sourceInfo) return <HelpCircle className="w-5 h-5" />;
    
    const type = sourceInfo.type?.toLowerCase();
    if (type === 'postgres' || type?.includes('database')) {
      return <Database className="w-5 h-5 text-blue-500" />;
    }
    return <FileText className="w-5 h-5 text-green-500" />;
  };
  const renderData = () => {
    if (dataStream.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data received yet
        </div>
      );
    }

    const headers = getTableHeaders();
    
    switch (viewMode) {
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header) => (
                    <th 
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dataStream.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {headers.map((header) => (
                      <td key={`${rowIndex}-${header}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof row[header] === 'object'
                          ? JSON.stringify(row[header])
                          : row[header]?.toString() || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      case 'json':
        return (
          <pre className="bg-gray-800 text-gray-200 p-4 rounded overflow-auto h-96">
            {JSON.stringify(dataStream, null, 2)}
          </pre>
        );
        
      case 'cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataStream.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                {Object.entries(item).map(([key, value]) => (
                  <div key={key} className="mb-2">
                    <span className="font-medium text-gray-700">{key}: </span>
                    <span className="text-gray-600">
                      {typeof value === 'object' ? JSON.stringify(value) : value?.toString() || ''}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Layers className="w-6 h-6 mr-2" /> Data Streaming App
          </h1>
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <span className="mr-2">Status:</span>
              {renderStatusIcon()}
              <span className="ml-1 capitalize">
                {connectionStatus}
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Source:</span>
              {getSourceIcon()}
              <span className="ml-1">
                {sourceInfo?.type || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <label htmlFor="server-url" className="block text-sm font-medium text-gray-700">
                    Server URL
                  </label>
                  <input
                    type="text"
                    id="server-url"
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
                  />
                </div>
                
                <div className="w-64 relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Plugin
                  </label>
                  <div className="mt-1 relative">
                    <button
                      type="button"
                      className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      onClick={() => setIsPluginsDropdownOpen(!isPluginsDropdownOpen)}
                      disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
                    >
                      <span className="block truncate">{selectedPlugin || 'Select a plugin'}</span>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        {isPluginsDropdownOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </span>
                    </button>
                    
                    {isPluginsDropdownOpen && (
                      <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                        {plugins.length === 0 ? (
                          <div className="text-gray-500 px-4 py-2">No plugins available</div>
                        ) : (
                          plugins.map((plugin) => (
                            <div
                              key={plugin.name}
                              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${
                                selectedPlugin === plugin.name ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                              }`}
                              onClick={() => {
                                setSelectedPlugin(plugin.name);
                                setIsPluginsDropdownOpen(false);
                              }}
                            >
                              <span className="block truncate">{plugin.name}</span>
                              {plugin.info?.type && (
                                <span className="text-xs text-gray-500 mt-1 block">
                                  {plugin.info.type}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2 self-end mt-5">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={fetchPlugins}
                    disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </button>
                  
                  {connectionStatus === 'connected' || connectionStatus === 'connecting' ? (
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={disconnectWebSocket}
                    >
                      <Square className="h-4 w-4 mr-1" />
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={connectToWebSocket}
                      disabled={!selectedPlugin}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-lg shadow mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            {getSourceIcon()}
            <span className="ml-2">Source Information</span>
          </h3>
          <div className="mt-3 bg-gray-50 p-4 rounded-md overflow-auto max-h-48">
            {sourceInfo ? (
              <pre className="text-sm text-gray-700">{JSON.stringify(sourceInfo, null, 2)}</pre>
            ) : (
              <p className="text-gray-500">No source information available</p>
            )}
          </div>
        </div>
        <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Data Stream ({dataStream.length} records)
            </h3>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auto-scroll"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={isAutoScroll}
                  onChange={() => setIsAutoScroll(!isAutoScroll)}
                />
                <label htmlFor="auto-scroll" className="ml-2 block text-sm text-gray-900">
                  Auto-scroll
                </label>
              </div>
              
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                    viewMode === 'table'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 text-sm font-medium ${
                    viewMode === 'cards'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cards
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('json')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                    viewMode === 'json'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  JSON
                </button>
              </div>
            </div>
          </div>
          
          <div 
            ref={dataContainerRef}
            className={`overflow-auto ${viewMode !== 'cards' ? 'max-h-96' : ''}`}
          >
            {renderData()}
          </div>
        </div>
        <div className="bg-white px-4 py-5 sm:px-6 rounded-lg shadow">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Activity Log</h3>
          <div className="bg-gray-900 rounded-md p-4 text-gray-300 font-mono text-sm overflow-auto max-h-48">
            {logMessages.length === 0 ? (
              <p className="text-gray-500">No logs yet</p>
            ) : (
              logMessages.map((log) => (
                <div key={log.id} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' : 
                  log.type === 'success' ? 'text-green-400' : 'text-gray-300'
                }`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white shadow mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Data Streaming App • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;