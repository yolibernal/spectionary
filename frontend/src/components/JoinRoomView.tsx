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
  const [name, setName] = useState<string>("")
  return (
    <div className="container">
      <InputUser
        speckleEmail={speckleEmail}
        setSpeckleEmail={setSpeckleEmail}
        roomId={roomId}
        clientId={clientId}
        setStreamId={setStreamId}
        name={name}
        setName={setName}
      />
      {!roomId && (
        <CreateRoom
          setRoomId={setRoomId}
          setStreamId={setStreamId}
          speckleEmail={speckleEmail}
          name={name}
          clientId={clientId}
        />
      )}

      {!roomId && (
        <JoinRoom
          clientId={clientId}
          speckleEmail={speckleEmail}
          name={name}
          setRoomId={setRoomId}
        />
      )}
    </div>
  )
}
