import React, { useEffect, useState } from "react"
import { v4 as uuidv4, validate } from "uuid"
import "./App.css"
import { GameView } from "./components/GameView"
import { JoinRoomView } from "./components/JoinRoomView"

const App = () => {
  const [myClientId, setMyClientId] = useState(uuidv4())

  const [roomId, setRoomId] = useState<string>("")
  const [streamId, setStreamId] = useState<string>("")
  console.log(window.location.href)

  useEffect(() => {
    const urlUUID = window.location.pathname.split("/")[1]
    if (validate(urlUUID)) setRoomId(urlUUID)
  }, [])

  if (!roomId || !streamId) {
    return (
      <JoinRoomView
        clientId={myClientId}
        setRoomId={setRoomId}
        roomId={roomId}
        setStreamId={setStreamId}
      />
    )
  }

  return <GameView roomId={roomId} streamId={streamId} clientId={myClientId} />
}
export default App
