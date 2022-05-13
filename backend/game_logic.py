import json
import random
import uuid
from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel
from specklepy.api.client import SpeckleClient
from specklepy.api.models import Commit
from specklepy.api.resources.stream import Resource

from connection_manager import ConnectionManager
from timer import Timer
from words import words


class User(BaseModel):
    client_id: str
    name: str
    speckle_email: str


class SpeckleGameManager:
    stream_name: str
    collaborator_emails: List[str]
    client: SpeckleClient
    stream: Resource

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


class GameRoom:
    room_id: str
    client_ids: List[str]
    connection_manager: ConnectionManager
    speckle_manager: SpeckleGameManager

    def __init__(
        self,
        room_id: str,
        access_token: str,
        stream_name: str,
        connection_manager: ConnectionManager,
    ):
        self.room_id = room_id
        self.users: Dict[str, User] = {}

        self.current_user_index = None
        self.current_solution = None
        self.current_timeout = None

        self.connection_manager = connection_manager
        self.speckle_manager = SpeckleGameManager(
            access_token=access_token, stream_name=stream_name
        )

    def initialize(self):
        self.speckle_manager.initialize_stream()

    def add_client(self, name: str, client_id: str, speckle_email: str):
        user = User(client_id=client_id, name=name, speckle_email=speckle_email)
        self.speckle_manager.add_collaborators([speckle_email])
        self.users[client_id] = user

    async def broadcast(self, message: str):
        client_ids = self.users.keys()
        await self.connection_manager.broadcast_to_clients(client_ids, message)

    def get_user(self, client_id: str):
        return self.users.get(client_id, None)

    def terminate(self):
        self.speckle_manager.delete_stream()

    def get_current_user(self):
        if self.current_user_index is None:
            return None
        return list(self.users.values())[self.current_user_index]

    async def timeout_round(self):
        now = datetime.now()
        current_time = now.strftime("%H:%M")

        message = {
            "type": "timeout",
            "time": current_time,
            "user": self.get_current_user().dict(),
        }
        await self.broadcast(json.dumps(message))

    async def next_turn(self):
        now = datetime.now()
        current_time = now.strftime("%H:%M")

        if len(self.users) == 0:
            raise Exception("No users in room")
        if self.current_user_index is None:
            self.current_user_index = 0
        else:
            self.current_user_index += 1
            self.current_user_index %= len(self.users)

        self.current_solution = random.choice(words)
        print("CURRENT SOLUTION", self.current_solution)

        if self.current_timeout is not None:
            self.current_timeout.cancel()
        self.current_timeout = Timer(60 * 5, self.timeout_round)

        message = {
            "type": "new_round",
            "time": current_time,
            "user": self.get_current_user().dict(),
        }
        await self.broadcast(json.dumps(message))

    async def check_solution(self, client_id, message):
        now = datetime.now()
        current_time = now.strftime("%H:%M")

        if self.current_solution is None:
            return
        if message.get("message", None) != self.current_solution:
            return

        self.current_timeout.cancel()
        message = {
            "type": "solved",
            "time": current_time,
            "user": self.get_user(client_id).dict(),
        }
        await self.broadcast(json.dumps(message))


class GameRoomManager:
    """
    Manages the game rooms.
    """

    rooms: Dict[str, GameRoom]
    connection_manager: ConnectionManager

    def __init__(self, connection_manager):
        self.rooms: Dict[str, GameRoom] = {}
        self.connection_manager = connection_manager

    def create_room(self, access_token: str, stream_name: str):
        room_id = str(uuid.uuid4())
        game_room = GameRoom(
            room_id=room_id,
            access_token=access_token,
            stream_name=stream_name,
            connection_manager=self.connection_manager,
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
