const API_BASE_URL = 'http://localhost:8000';

export const fetchPlugins = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/plugins`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data.plugins || [];
  } catch (error) {
    console.error('Failed to fetch plugins:', error);
    throw error;
  }
};

export const fetchPluginInfo = async (pluginName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/plugin/${pluginName}/info`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch info for plugin ${pluginName}:`, error);
    throw error;
  }
};

export const registerFilePlugin = async (name, filePath) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register/file?name=${encodeURIComponent(name)}&file_path=${encodeURIComponent(filePath)}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to register file plugin:', error);
    throw error;
  }
};

export const registerPostgresPlugin = async (name, tableName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register/postgres?name=${encodeURIComponent(name)}&table_name=${encodeURIComponent(tableName)}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to register postgres plugin:', error);
    throw error;
  }
};