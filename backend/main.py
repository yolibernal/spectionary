import json
import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from connection_manager import ConnectionManager
from game_logic import GameRoomManager
from webhook_manager import SpeckleWebhookManager

load_dotenv()

server_url = os.environ["SERVER_URL"]

app = FastAPI()

connection_manager = ConnectionManager()
game_room_manager = GameRoomManager(connection_manager)
webhook_manager = SpeckleWebhookManager(game_room_manager=game_room_manager)
app.include_router(webhook_manager.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # can alter with time
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CreateRoomModel(BaseModel):
    client_id: str
    speckle_email: str
    stream_name: str
    access_token: str


class JoinRoomModel(BaseModel):
    client_id: str
    room_id: str
    speckle_email: str


@app.post("/create-room")
async def create_room(data: CreateRoomModel):
    game_room = game_room_manager.create_room(
        access_token=data.access_token, stream_name=data.stream_name
    )
    game_room.add_client(data.client_id, data.speckle_email)
    webhook_manager.setup_webhook(
        access_token=data.access_token,
        stream_id=game_room.speckle_manager.stream.id,
        server_url=server_url,
    )

    return {
        "room_id": game_room.room_id,
        "stream_id": game_room.speckle_manager.stream.id,
    }


@app.post("/join-room")
async def join_room(data: JoinRoomModel):
    room_id = data.room_id
    game_room = game_room_manager.get_room(room_id)
    game_room.add_client(data.client_id, data.speckle_email)

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
            message = {**data, "time": current_time}
            await game_room.broadcast(json.dumps(message))

    except WebSocketDisconnect:
        connection_manager.disconnect(client_id)
        message = {"time": current_time, "type": "disconnected", "message": "Offline"}
        await game_room.broadcast(json.dumps(message))
