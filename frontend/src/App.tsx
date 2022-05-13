import React, { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import "./App.css"
import { ChatView } from "./components/ChatView"
import { CreateRoomView } from "./CreateRoomView"

const App = () => {
  const [myClientId, setMyClientId] = useState(uuidv4())

  const [roomId, setRoomId] = useState<string | null>(null)

  if (!roomId) {
    return <CreateRoomView clientId={myClientId} setRoomId={setRoomId} />
  }

  return <ChatView roomId={roomId} clientId={myClientId} />
}

export default App
