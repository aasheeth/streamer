from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.connection_manager import ConnectionManager
from registry.plugin_registry import PluginRegistry
from plugins.file_plugin import FileDataSourcePlugin
from plugins.postgres_plugin import PostgresDataSourcePlugin
from dotenv import load_dotenv
from fastapi import WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse

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


registry.register_plugin("example_json", FileDataSourcePlugin("data/sample.json"))
registry.register_plugin("postgres_table", PostgresDataSourcePlugin("my_table"))

@app.get("/plugins")
def list_plugins():
    return registry.list_plugins()

@app.websocket("/ws")
async def stream_data(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        plugin = registry.get_plugin("example_json")  
        if not plugin:
            await websocket.send_text(f"Pluginnot found.")
            await websocket.close()
            return

        async for chunk in plugin.get_data_stream(chunk_size=10):
            print(f"Sending chunk: {chunk}")  
            await manager.broadcast(message=str(chunk))

    except WebSocketDisconnect:
        manager.disconnect(websocket)

