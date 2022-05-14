import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useState,
} from "react"
import { CreateRoom } from "./CreateRoom"
import { InputUser } from "./InputUser"
import { JoinRoom } from "./JoinRoom"
import { Spectionary } from "./Spectionary"
import { Divider, JoinRoomViewContainer, MainContainer, OrBox } from "./styles"
import { Waves } from "./Waves"

export const JoinRoomView: FunctionComponent<{
  clientId: string
  setRoomId: Dispatch<SetStateAction<string>>
  setStreamId: Dispatch<SetStateAction<string>>
  roomId: string
}> = ({ clientId, setRoomId, setStreamId, roomId }) => {
  const [speckleEmail, setSpeckleEmail] = useState<string>("")
  const [name, setName] = useState<string>("")
  return (
    <MainContainer>
      <Spectionary />
      <JoinRoomViewContainer>
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
          <>
            <Divider />

            <CreateRoom
              setRoomId={setRoomId}
              setStreamId={setStreamId}
              speckleEmail={speckleEmail}
              name={name}
              clientId={clientId}
            />

            <OrBox>or</OrBox>

            <JoinRoom
              clientId={clientId}
              speckleEmail={speckleEmail}
              name={name}
              setRoomId={setRoomId}
            />
          </>
        )}
      </JoinRoomViewContainer>
      <Waves />
    </MainContainer>
  )
}
