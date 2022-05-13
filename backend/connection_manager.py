from typing import Dict, List
from fastapi import WebSocket


class ConnectionManager:
    active_connections: Dict[str, WebSocket]

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, client_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        websocket = self.active_connections.pop(client_id, None)
        if websocket is not None:
            websocket.close()

    async def send_message_to_client(self, client_id: str, message: str):
        websocket = self.active_connections.get(client_id, None)
        if websocket is None:
            return
        await websocket.send_text(message)

    async def broadcast_all(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

    async def broadcast_to_clients(self, client_ids: List[str], message: str):
        for client_id in client_ids:
            await self.send_message_to_client(client_id, message)