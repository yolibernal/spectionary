import React, { useEffect, useState } from "react"
import { v4 as uuidv4, validate } from "uuid"
import "./App.css"
import { GameView } from "./components/GameView"
import { JoinRoomView } from "./components/JoinRoomView"

// https://www.robinwieruch.de/local-storage-react/#react-local-storage-hook
const useLocalStorage = (storageKey: string, fallbackState: any) => {
  const storedValue = localStorage.getItem(storageKey)
  const [value, setValue] = React.useState(
    storedValue ? JSON.parse(storedValue) : fallbackState
  )

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(value))
  }, [value, storageKey])

  return [value, setValue]
}

const App = () => {
  const [myClientId, setMyClientId] = useLocalStorage("clientId", uuidv4())

  const [roomId, setRoomId] = useState<string>("")
  const [streamId, setStreamId] = useState<string>("")

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
