import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # can alter with time
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateRoomModel(BaseModel):
    client_id: str


class GameRoom:
    def __init__(self, room_id: str):
        self.room_id = room_id
        self.client_ids = []

    def add_client(self, client_id: str):
        if client_id in self.client_ids:
            return
        self.client_ids.append(client_id)

    async def broadcast(self, message: str):
        await connection_manager.broadcast_to_clients(self.client_ids, message)


class GameRoomManager:
    """
    Manages the game rooms.
    """

    def __init__(self):
        self.rooms = {}

    def create_room(self) -> str:
        room_id = str(uuid.uuid4())
        game_room = GameRoom(room_id=room_id)
        self.rooms[room_id] = game_room
        return game_room

    def get_room(self, room_id: str) -> Optional[GameRoom]:
        return self.rooms.get(room_id, None)

    def delete_room(self, room_id: str) -> None:
        self.rooms.pop(room_id, None)


class ConnectionManager:
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
        for connection in self.active_connections.items():
            await connection.send_text(message)

    async def broadcast_to_clients(self, client_ids: List[str], message: str):
        for client_id in client_ids:
            await self.send_message_to_client(client_id, message)


game_room_manager = GameRoomManager()
connection_manager = ConnectionManager()


@app.post("/create-room")
async def create_room(data: CreateRoomModel):
    game_room = game_room_manager.create_room()

    return {"room_id": game_room.room_id}


@app.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    now = datetime.now()
    current_time = now.strftime("%H:%M")

    game_room = game_room_manager.get_room(room_id)
    game_room.add_client(client_id)

    await connection_manager.connect(client_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            message = {**data, "time": current_time}
            await game_room.broadcast(json.dumps(message))

    except WebSocketDisconnect:
        connection_manager.disconnect(client_id)
        message = {"time": current_time, "type": "disconnected", "message": "Offline"}
        await game_room.broadcast(json.dumps(message))
