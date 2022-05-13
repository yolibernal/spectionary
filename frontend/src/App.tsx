import React, { useEffect, useState } from "react"
import "./App.css"
import { MessageBubble } from "./MessageBubble"

export type Message = {
  clientId: number
  type: "message" | "connected" | "disconnected"
  message?: string
  time?: string
}

const App = () => {
  const [myClientId, setMyClientId] = useState(
    Math.floor(new Date().getTime() / 1000)
  )

  const [websckt, setWebsckt] = useState<WebSocket>()

  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const url = "ws://localhost:8000/ws/" + myClientId
    const ws = new WebSocket(url)

    ws.onopen = (event) => {
      const connectMessage: Message = {
        clientId: myClientId,
        type: "connected",
      }
      ws.send(JSON.stringify(connectMessage))
    }

    setWebsckt(ws)

    return () => ws.close()
  }, [myClientId])

  useEffect(() => {
    const handleReceivedMessage = (message: Message) => {
      setMessages([...messages, message])
    }

    if (!websckt) return

    websckt.onmessage = (e) => {
      const message = JSON.parse(e.data)
      handleReceivedMessage(message)
    }
  }, [websckt, messages])

  const sendTextMessage = () => {
    if (!websckt || !message) {
      return
    }

    const outMessage: Message = {
      clientId: myClientId,
      type: "message",
      message: message,
    }
    websckt.send(JSON.stringify(outMessage))
    setMessage("")
  }

  return (
    <div className="container">
      <h1>Chat</h1>
      <h2>Your client id: {myClientId} </h2>
      <div className="chat-container">
        <div className="chat">
          {messages.map((message, index) => (
            <MessageBubble
              message={message}
              myClientId={myClientId}
              key={index}
            />
          ))}
        </div>
        <div className="input-chat-container">
          <input
            className="input-chat"
            type="text"
            placeholder="Chat message ..."
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          ></input>
          <button className="submit-chat" onClick={sendTextMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
