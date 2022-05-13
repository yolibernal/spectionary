from specklepy.api.resources.stream import Resource
import uuid
from typing import Dict, List, Optional

from specklepy.api.client import SpeckleClient
from specklepy.api.models import Commit

from connection_manager import ConnectionManager


class SpeckleGameManager:
    stream_name: str
    access_token: str
    collaborator_emails: List[str]
    client: SpeckleClient
    stream: Resource

    def __init__(self, access_token, stream_name):
        self.stream_name = stream_name
        self.access_token = access_token

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
        if not commits:
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
        self.client_ids = []

        self.connection_manager = connection_manager
        self.speckle_manager = SpeckleGameManager(
            access_token=access_token,
            stream_name=stream_name,
        )

    def initialize(self):
        self.stream = self.speckle_manager.initialize_stream()

    def add_client(self, client_id: str, speckle_email: str):
        self.speckle_manager.add_collaborators([speckle_email])
        if client_id in self.client_ids:
            return
        self.client_ids.append(client_id)

    async def broadcast(self, message: str):
        await self.connection_manager.broadcast_to_clients(self.client_ids, message)

    def terminate(self):
        self.speckle_manager.delete_stream()


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

    def get_room_by_stream_id(self, stream_id: str) -> Optional[GameRoom]:
        found = [
            r for r in self.rooms.values() if r.speckle_manager.stream.id == stream_id
        ]
        return found[0] if found else None

    def delete_room(self, room_id: str) -> None:
        game_room = self.get_room(room_id)
        if game_room is None:
            return
        game_room.terminate()
        self.rooms.pop(room_id, None)
