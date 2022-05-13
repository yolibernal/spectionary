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
  return (
    <div>
      <button
        onClick={async () => {
          const response = await axios.post(
            "http://localhost:8000/create-room",
            {
              client_id: clientId,
            }
          )
          const { room_id: roomId } = response.data
          setRoomId(roomId)
        }}
      >
        Create Game Room
      </button>
      <input
        className="input-chat"
        type="text"
        placeholder="Room ID"
        onChange={(e) => setJoinRoomId(e.target.value)}
        value={joinRoomId || ""}
      ></input>
      <button
        onClick={async () => {
          const response = await axios.post("http://localhost:8000/join-room", {
            client_id: clientId,
            room_id: joinRoomId,
          })
          const { room_id } = response.data
          setRoomId(room_id)
        }}
      >
        Join Game Room
      </button>
    </div>
  )
}
