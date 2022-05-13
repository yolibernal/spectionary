import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr
from specklepy.api.client import SpeckleClient
from specklepy.api.models import Commit

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # can alter with time
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateRoomModel(BaseModel):
    name: str
    client_id: str
    speckle_email: EmailStr
    stream_name: str
    access_token: str


class JoinRoomModel(BaseModel):
    name: str
    client_id: str
    room_id: str
    speckle_email: EmailStr


class SpeckleGameManager:
    def __init__(self, access_token, stream_name):
        self.stream_name = stream_name

        self.client = SpeckleClient()
        self.client.authenticate_with_token(access_token)

        self.collaborator_emails = []

        self.stream = None

    def initialize_stream(self):
        stream_id = self.client.stream.create(self.stream_name)
        self.stream = self.client.stream.get(stream_id)
        return self.stream

    def add_collaborators(self, collaborator_emails: List[str]):
        if self.stream is None:
            raise Exception("Stream not initialized")

        new_collaborators_email = list(
            set(collaborator_emails) - set(self.collaborator_emails)
        )

        if len(new_collaborators_email) == 0:
            return

        for email in new_collaborators_email:
            user = self.client.user.search(email)[0]
            self.client.stream.grant_permission(
                self.stream.id, user.id, "stream:contributor"
            )
        self.collaborator_emails += collaborator_emails

    def get_latest_commit(self) -> Commit:
        commits = self.client.commit.list(self.stream.id)
        if len(commits) == 0:
            return None
        return commits[0]

    def delete_stream(self):
        self.client.stream.delete(self.stream.id)


class User:
    def __init__(self, client_id, name, speckle_email):
        self.client_id = client_id
        self.name = name
        self.speckle_email = speckle_email


class GameRoom:
    def __init__(self, room_id: str, access_token: str, stream_name: str):
        self.room_id = room_id
        self.users: Dict[str, User] = {}

        self.speckle_manager = SpeckleGameManager(
            access_token=access_token, stream_name=stream_name
        )

    def initialize(self):
        self.speckle_manager.initialize_stream()

    def add_client(self, name: str, client_id: str, speckle_email: str):
        user = User(client_id, name, speckle_email)
        self.speckle_manager.add_collaborators([speckle_email])
        self.users[client_id] = user

    async def broadcast(self, message: str):
        client_ids = self.users.keys()
        await connection_manager.broadcast_to_clients(client_ids, message)

    def get_user(self, client_id: str):
        return self.users.get(client_id, None)

    def terminate(self):
        self.speckle_manager.delete_stream()


class GameRoomManager:
    """
    Manages the game rooms.
    """

    def __init__(self):
        self.rooms: List[GameRoom] = {}

    def create_room(self, access_token: str, stream_name: str):
        room_id = str(uuid.uuid4())
        game_room = GameRoom(
            room_id=room_id, access_token=access_token, stream_name=stream_name
        )
        game_room.initialize()
        self.rooms[room_id] = game_room
        return game_room

    def get_room(self, room_id: str) -> Optional[GameRoom]:
        return self.rooms.get(room_id, None)

    def delete_room(self, room_id: str) -> None:
        game_room = self.get_room(room_id)
        if game_room is None:
            return
        game_room.terminate()
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
    game_room = game_room_manager.create_room(
        access_token=data.access_token, stream_name=data.stream_name
    )
    game_room.add_client(data.name, data.client_id, data.speckle_email)

    return {
        "room_id": game_room.room_id,
        "stream_id": game_room.speckle_manager.stream.id,
    }


@app.post("/join-room")
async def join_room(data: JoinRoomModel):
    room_id = data.room_id
    game_room = game_room_manager.get_room(room_id)
    game_room.add_client(data.name, data.client_id, data.speckle_email)

    if game_room is None:
        return {"room_id": None, "error": "Room does not exist"}

    return {
        "room_id": game_room.room_id,
        "stream_id": game_room.speckle_manager.stream.id,
    }


# Will probably be replaced by webhook
@app.get("/latest-commit/{room_id}")
def latest_commit(room_id: str):
    game_room = game_room_manager.get_room(room_id)
    latest_commit = game_room.speckle_manager.get_latest_commit()
    if latest_commit is None:
        return {"latest_commit_id": None}
    return {"latest_commit_id": latest_commit.id}


@app.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    now = datetime.now()
    current_time = now.strftime("%H:%M")

    game_room = game_room_manager.get_room(room_id)

    await connection_manager.connect(client_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            user = game_room.get_user(client_id)
            message = {**data, "time": current_time, "name": user.name}
            await game_room.broadcast(json.dumps(message))

    except WebSocketDisconnect:
        connection_manager.disconnect(client_id)
        message = {"time": current_time, "type": "disconnected", "message": "Offline"}
        await game_room.broadcast(json.dumps(message))
