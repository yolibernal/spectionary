import axios from "axios"
import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useState,
} from "react"

export const JoinRoomView: FunctionComponent<{
  clientId: string
  setRoomId: Dispatch<SetStateAction<string | null>>
}> = ({ clientId, setRoomId }) => {
  const [joinRoomId, setJoinRoomId] = useState<string | null>(null)
  const [speckleEmail, setSpeckleEmail] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [streamName, setStreamName] = useState<string | null>(null)
  return (
    <div className="container">
      <div>
        <h2>User</h2>
        <input
          className="input-chat"
          type="text"
          placeholder="Speckle email"
          onChange={(e) => setSpeckleEmail(e.target.value)}
          value={speckleEmail || ""}
        ></input>
        <h2>Create Room</h2>
        <input
          className="input-chat"
          type="text"
          placeholder="Stream name"
          onChange={(e) => setStreamName(e.target.value)}
          value={streamName || ""}
        ></input>
        <input
          className="input-chat"
          type="text"
          placeholder="Speckle access token"
          onChange={(e) => setAccessToken(e.target.value)}
          value={accessToken || ""}
        ></input>

        <button
          className="submit"
          onClick={async () => {
            const response = await axios.post(
              "http://localhost:8000/create-room",
              {
                client_id: clientId,
                access_token: accessToken,
                stream_name: streamName,
                speckle_email: speckleEmail,
              }
            )
            const { room_id: roomId } = response.data
            setRoomId(roomId)
          }}
        >
          Create Game Room
        </button>
      </div>

      <h2>Join an existing room</h2>
      <div>
        <input
          className="input-chat"
          type="text"
          placeholder="Room ID"
          onChange={(e) => setJoinRoomId(e.target.value)}
          value={joinRoomId || ""}
        ></input>
        <button
          className="submit"
          onClick={async () => {
            const response = await axios.post(
              "http://localhost:8000/join-room",
              {
                client_id: clientId,
                room_id: joinRoomId,
                speckle_email: speckleEmail,
              }
            )
            const { room_id } = response.data
            setRoomId(room_id)
          }}
        >
          Join Game Room
        </button>
      </div>
    </div>
  )
}
