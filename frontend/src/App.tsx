import React, { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import "./App.css"
import { GameView } from "./components/GameView"
import { JoinRoomView } from "./components/JoinRoomView"

const App = () => {
  const [myClientId, setMyClientId] = useState(uuidv4())

  const [roomId, setRoomId] = useState<string | null>(null)
  const [streamId, setStreamId] = useState<string | null>(null)

  if (!roomId || !streamId) {
    return (
      <JoinRoomView
        clientId={myClientId}
        setRoomId={setRoomId}
        setStreamId={setStreamId}
      />
    )
  }

  return <GameView roomId={roomId} streamId={streamId} clientId={myClientId} />
}

export default App
