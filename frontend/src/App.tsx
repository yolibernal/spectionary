import React, { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import "./App.css"
import { GameView } from "./components/GameView"
import { JoinRoomView } from "./components/JoinRoomView"

const App = () => {
  const [myClientId, setMyClientId] = useState(uuidv4())

  const [roomId, setRoomId] = useState<string | null>(null)

  if (!roomId) {
    return <JoinRoomView clientId={myClientId} setRoomId={setRoomId} />
  }

  return <GameView roomId={roomId} clientId={myClientId} />
}

export default App
