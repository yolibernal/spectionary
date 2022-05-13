import axios from "axios"
import { Dispatch, FunctionComponent, SetStateAction } from "react"

interface Props {
  speckleEmail: string
  setSpeckleEmail: Dispatch<SetStateAction<string>>
  setStreamId: Dispatch<SetStateAction<string>>
  roomId: string
  clientId: string
  setName: Dispatch<SetStateAction<string>>
  name: string
}
export const InputUser: FunctionComponent<Props> = ({
  speckleEmail,
  setSpeckleEmail,
  setStreamId,
  roomId,
  clientId,
  setName,
  name,
}) => {
  return (
    <div>
      <h2>User</h2>
      <input
        className="input-chat"
        type="text"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      <input
        className="input-chat"
        type="text"
        placeholder="Speckle email"
        onChange={(e) => setSpeckleEmail(e.target.value)}
        value={speckleEmail}
      />
      {roomId && (
        <button
          className="submit"
          onClick={async () => {
            const response = await axios.post("/join-room", {
              client_id: clientId,
              room_id: roomId,
              speckle_email: speckleEmail,
              name: name,
            })
            const { room_id, stream_id } = response.data
            console.log(response.data)
            setStreamId(stream_id)
          }}
        >
          Join Game Room
        </button>
      )}
    </div>
  )
}
