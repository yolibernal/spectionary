import uuid
from typing import Dict, List, Optional

from specklepy.api.client import SpeckleClient
from specklepy.api.models import Commit
from specklepy.api.resources.stream import Resource

from connection_manager import ConnectionManager


class User:
    def __init__(self, client_id, name, speckle_email):
        self.client_id = client_id
        self.name = name
        self.speckle_email = speckle_email


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

        self.connection_manager = connection_manager
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
        await self.connection_manager.broadcast_to_clients(client_ids, message)

    def get_user(self, client_id: str):
        return self.users.get(client_id, None)

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

    def delete_room(self, room_id: str) -> None:
        game_room = self.get_room(room_id)
        if game_room is None:
            return
        game_room.terminate()
        self.rooms.pop(room_id, None)
