from datetime import datetime
import hmac
import json
from fastapi import Header, Request, Response
from pydantic import BaseModel

from fastapi import APIRouter
import requests

from game_logic import GameRoomManager

WEBHOOK_SECRET = "spectionary"


class WebhookResponse(BaseModel):
    result: str


class SpeckleWebhookManager:
    router: APIRouter
    game_room_manager: GameRoomManager

    def __init__(self, game_room_manager) -> None:
        router = APIRouter()
        self.router = router
        self.game_room_manager = game_room_manager

        @router.post("/speckwebhook/", response_model=WebhookResponse, status_code=200)
        async def webhook(
            request: Request,
            response: Response,
            content_length: int = Header(...),
            x_hook_signature: str = Header(None),
        ):
            content = await request.json()

            if content_length > 1_000_000:
                response.status_code = 400
                return {"result": "Content too long"}

            if x_hook_signature:
                raw_input = await request.body()
                input_hmac = hmac.new(
                    key=WEBHOOK_SECRET.encode(), msg=raw_input, digestmod="sha512"
                )
                if not hmac.compare_digest(input_hmac.hexdigest(), x_hook_signature):
                    response.status_code = 400
                    return {"result": "Invalid message signature"}

            await self.do_something_with_the_event(content)
            return {"result": "ok"}

    async def do_something_with_the_event(self, data):
        payload = json.loads(data["payload"])
        if not payload["event"]["event_name"]:
            return
        room = self.game_room_manager.get_room_by_stream_id(payload["streamId"])

        now = datetime.now()
        current_time = now.strftime("%H:%M")
        client_message = {
            "time": current_time,
            "type": "new_commit",
            "message": payload["event"]["data"]["id"],
        }
        await room.broadcast(json.dumps(client_message))

    def setup_webhook(
        self,
        access_token: str,
        stream_id: str,
        server_url: str,
    ):
        speckle_url = "https://speckle.xyz"
        headers = {
            "authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }
        query = """mutation webhookCreate($params: WebhookCreateInput!) {
            webhookCreate(webhook: $params)
            }"""
        variables = {
            "params": {
                "streamId": stream_id,
                "url": f"{server_url}/speckwebhook/",
                "description": "Automatic webhook created for Speckle-Pictionary",
                "triggers": ["commit_create"],
                "enabled": True,
                "secret": WEBHOOK_SECRET,
            }
        }

        r = requests.post(
            f"{speckle_url}/graphql/",
            json={"query": query, "variables": variables},
            headers=headers,
        )
