import axios from "axios"
import { Dispatch, FunctionComponent, SetStateAction, useState } from "react"

interface Props {
  clientId: string
  speckleEmail: string
  setRoomId: Dispatch<SetStateAction<string>>
  name: string
}

export const JoinRoom: FunctionComponent<Props> = ({
  clientId,
  speckleEmail,
  setRoomId,
  name,
}) => {
  const [joinRoomId, setJoinRoomId] = useState<string>("")

  return (
    <div>
      <h2>Join an existing room</h2>
      <div>
        <input
          className="input-chat"
          type="text"
          placeholder="Room ID"
          onChange={(e) => setJoinRoomId(e.target.value)}
          value={joinRoomId}
        />
        <button
          className="submit"
          onClick={async () => {
            const response = await axios.post("/join-room", {
              client_id: clientId,
              room_id: joinRoomId,
              speckle_email: speckleEmail,
              name: name,
            })
            const { room_id, stream_id } = response.data
            setRoomId(room_id)
          }}
        >
          Join Game Room
        </button>
      </div>
    </div>
  )
}
