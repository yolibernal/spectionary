import json
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, EmailStr
from specklepy.api.client import SpeckleClient
from specklepy.api.models import Commit

from connection_manager import ConnectionManager
from game_logic import GameRoomManager

app = FastAPI()

connection_manager = ConnectionManager()
game_room_manager = GameRoomManager(connection_manager)

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
    if game_room is None:
        return {"room_id": None, "error": "Room does not exist"}

    game_room.add_client(data.name, data.client_id, data.speckle_email)

    return {
        "room_id": game_room.room_id,
        "stream_id": game_room.speckle_manager.stream.id,
    }


@app.post("/next-round/{room_id}")
async def next_round(room_id: str):
    game_room = game_room_manager.get_room(room_id)
    if game_room is None:
        return {"user_id": None, "room_id": None, "error": "Room does not exist"}
    await game_room.next_turn()
    return {"client_id": game_room.get_current_user().client_id}


# Will probably be replaced by webhook
@app.get("/latest-commit/{room_id}")
def latest_commit(room_id: str):
    game_room = game_room_manager.get_room(room_id)
    if game_room is None:
        return {"room_id": None, "error": "Room does not exist"}

    latest_commit = game_room.speckle_manager.get_latest_commit()
    if latest_commit is None:
        return {"latest_commit_id": None}
    return {"latest_commit_id": latest_commit.id}


@app.websocket("/ws/{room_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, client_id: str):
    now = datetime.now()
    current_time = now.strftime("%H:%M")

    game_room = game_room_manager.get_room(room_id)
    if game_room is None:
        return {"room_id": None, "error": "Room does not exist"}

    await connection_manager.connect(client_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            user = game_room.get_user(client_id)

            if (
                data.get("type", None) == "message"
                and data.get("message", None) is not None
            ):
                await game_room.check_solution(client_id, data)

            message = {**data, "time": current_time, "name": user.name}
            await game_room.broadcast(json.dumps(message))

    except WebSocketDisconnect:
        await connection_manager.disconnect(client_id)
        message = {"time": current_time, "type": "disconnected", "message": "Offline"}
        await game_room.broadcast(json.dumps(message))
