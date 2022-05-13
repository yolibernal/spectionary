import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useState,
} from "react"
import { CreateRoom } from "./CreateRoom"
import { InputUser } from "./InputUser"
import { JoinRoom } from "./JoinRoom"

export const JoinRoomView: FunctionComponent<{
  clientId: string
  setRoomId: Dispatch<SetStateAction<string>>
  setStreamId: Dispatch<SetStateAction<string>>
  roomId: string
}> = ({ clientId, setRoomId, setStreamId, roomId }) => {
  const [speckleEmail, setSpeckleEmail] = useState<string>("")

  return (
    <div className="container">
      <InputUser
        speckleEmail={speckleEmail}
        setSpeckleEmail={setSpeckleEmail}
        roomId={roomId}
        clientId={clientId}
        setStreamId={setStreamId}
      />
      {!roomId && (
        <CreateRoom
          setRoomId={setRoomId}
          setStreamId={setStreamId}
          speckleEmail={speckleEmail}
          clientId={clientId}
        />
      )}

      {!roomId && (
        <JoinRoom
          clientId={clientId}
          speckleEmail={speckleEmail}
          setRoomId={setRoomId}
        />
      )}
    </div>
  )
}
