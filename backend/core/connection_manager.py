from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        
    async def connect(self, websocket: WebSocket):
        # Accept the connection first
        await websocket.accept()
        # Then add to active connections
        self.active_connections.append(websocket)
        
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            
    async def send_json(self, websocket: WebSocket, data: dict):
        await websocket.send_json(data)
        
    async def broadcast_json(self, data: dict):
        for connection in self.active_connections:
            await connection.send_json(data)