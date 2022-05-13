import axios from "axios"
import { Dispatch, FunctionComponent, SetStateAction, useState } from "react"

interface Props {
  setRoomId: Dispatch<SetStateAction<string>>
  setStreamId: Dispatch<SetStateAction<string>>
  speckleEmail: string
  clientId: string
}
export const CreateRoom: FunctionComponent<Props> = ({
  setRoomId,
  setStreamId,
  speckleEmail,
  clientId,
}) => {
  const [accessToken, setAccessToken] = useState<string>("")
  const [streamName, setStreamName] = useState<string>("")
  return (
    <div>
      <h2>Create Room</h2>
      <input
        className="input-chat"
        type="text"
        placeholder="Stream name"
        onChange={(e) => setStreamName(e.target.value)}
        value={streamName || ""}
      />
      <input
        className="input-chat"
        type="text"
        placeholder="Speckle access token"
        onChange={(e) => setAccessToken(e.target.value)}
        value={accessToken || ""}
      />
      <button
        className="submit"
        onClick={async () => {
          const response = await axios.post("/create-room", {
            client_id: clientId,
            access_token: accessToken,
            stream_name: streamName,
            speckle_email: speckleEmail,
          })
          const { room_id, stream_id } = response.data
          setRoomId(room_id)
          setStreamId(stream_id)
        }}
      >
        Create Game Room
      </button>
    </div>
  )
}
