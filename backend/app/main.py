from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from core.connection_manager import ConnectionManager
from registry.plugin_registry import PluginRegistry
from plugins.file_plugin import FileDataSourcePlugin
from plugins.postgres_plugin import PostgresDataSourcePlugin
from typing import Dict, Any, List
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Data Streaming API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

manager = ConnectionManager()
registry = PluginRegistry()

DATA_DIR = "data"
os.makedirs(DATA_DIR, exist_ok=True)


sample_json_path = os.path.join(DATA_DIR, "sample.json")

if not os.path.exists(sample_json_path):
    import json
    with open(sample_json_path, 'w') as f:
        json.dump([
            {"id": i, "name": f"Item {i}", "value": i * 10} 
            for i in range(1, 101)
        ], f)
    print(f"Created sample data file at {sample_json_path}")
registry.register_plugin("sample_json", FileDataSourcePlugin(sample_json_path))

try:
    postgres_plugin = PostgresDataSourcePlugin("dummy_data")
    source_info = postgres_plugin.get_source_info()
    if "error" not in source_info:
        registry.register_plugin("postgres_table", postgres_plugin)
        print("PostgreSQL plugin registered successfully")
    else:
        print(f"PostgreSQL plugin not registered: {source_info['error']}")
except Exception as e:
    print(f"Could not register PostgreSQL plugin: {e}")


postgres_plugin = PostgresDataSourcePlugin("dummy_data")
registry.register_plugin("postgres_table", postgres_plugin)


@app.get("/")
def read_root():
    return {"message": "Data Streaming API", "status": "running"}

@app.get("/plugins")
def list_plugins():
    plugins = registry.list_plugins()
    plugins_info = {}
    
    for plugin_name in plugins:
        plugin = registry.get_plugin(plugin_name)
        if plugin:
            plugins_info[plugin_name] = plugin.get_source_info()
    
    return {"plugins": plugins_info}

@app.get("/plugins/{plugin_name}")
def get_plugin_info(plugin_name: str):
    plugin = registry.get_plugin(plugin_name)
    if not plugin:
        raise HTTPException(status_code=404, detail=f"Plugin {plugin_name} not found")
    
    return {"plugin": plugin_name, "info": plugin.get_source_info()}

@app.websocket("/ws/{plugin_name}")
async def stream_data(websocket: WebSocket, plugin_name: str = Path(..., description="Name of the plugin to stream data from")):
    await manager.connect(websocket)
    
    try:
        plugin = registry.get_plugin(plugin_name)
        if not plugin:
            await websocket.send_json({
                "error": f"Plugin '{plugin_name}' not found",
                "available_plugins": registry.list_plugins()
            })
            return
        source_info = plugin.get_source_info()
        await websocket.send_json({
            "status": "connected",
            "source_info": source_info
        })
        
        async for chunk in plugin.get_data_stream(chunk_size=10):
            if chunk: 
                await websocket.send_json({"data": chunk})
            await websocket.send_json({"message": "Chunk complete"})
                
    except WebSocketDisconnect:
        print(f"Client disconnected from {plugin_name} stream")
    except Exception as e:
        import traceback
        print(f"Error in WebSocket: {str(e)}")
        print(traceback.format_exc())
        if websocket in manager.active_connections:
            await websocket.send_json({"error": str(e)})
    finally:
        manager.disconnect(websocket)