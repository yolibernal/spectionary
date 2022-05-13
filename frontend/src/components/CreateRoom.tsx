import axios from "axios"
import { Dispatch, FunctionComponent, SetStateAction, useState } from "react"
import { StyledInput, StyledTitle, SubmitButton } from "./styles"

interface Props {
  setRoomId: Dispatch<SetStateAction<string>>
  setStreamId: Dispatch<SetStateAction<string>>
  speckleEmail: string
  clientId: string
  name: string
}
export const CreateRoom: FunctionComponent<Props> = ({
  setRoomId,
  setStreamId,
  speckleEmail,
  clientId,
  name,
}) => {
  const [accessToken, setAccessToken] = useState<string>("")
  const [streamName, setStreamName] = useState<string>("")
  return (
    <div>
      <StyledTitle>Create Room</StyledTitle>
      <StyledInput
        className="input-chat"
        type="text"
        placeholder="Stream name"
        onChange={(e) => setStreamName(e.target.value)}
        value={streamName}
      />
      <StyledInput
        className="input-chat"
        type="text"
        placeholder="Speckle access token"
        onChange={(e) => setAccessToken(e.target.value)}
        value={accessToken}
      />
      <SubmitButton
        onClick={async () => {
          const response = await axios.post("/create-room", {
            client_id: clientId,
            access_token: accessToken,
            stream_name: streamName,
            speckle_email: speckleEmail,
            name: name,
          })
          const { room_id, stream_id } = response.data
          setRoomId(room_id)
          setStreamId(stream_id)
        }}
      >
        Create Game Room
      </SubmitButton>
    </div>
  )
}
