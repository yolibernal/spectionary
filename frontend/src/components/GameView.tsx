import axios from "axios"
import React, { FunctionComponent, useEffect, useState } from "react"
import { Message } from "../Message"
import { User } from "../User"
import { MessageBubble } from "./MessageBubble"

export const GameView: FunctionComponent<{
  roomId: string
  clientId: string
  streamId: string
}> = ({ roomId, clientId: myClientId, streamId }) => {
  const [websckt, setWebsckt] = useState<WebSocket>()

  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])

  const [latestCommitId, setLatestCommitId] = useState<string | null>(null)

  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const url = `ws://localhost:8000/ws/${roomId}/${myClientId}`
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
  }, [myClientId, roomId])

  useEffect(() => {
    const handleReceivedMessage = (message: Message) => {
      console.log(message)
      if (message.type === "new_round" && message.user) {
        setCurrentUser(message.user)
      }
      if (message.type === "new_commit") {
        setLatestCommitId(message.message || null)
      }
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

  const startNextRound = async () => {
    const response = await axios.post(`/next-round/${roomId}`)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.origin + "/" + roomId)
  }

  return (
    <div className="container">
      <h1>Chat</h1>
      <h2>Your client id: {myClientId} </h2>
      <h2>Your room id: {roomId} </h2>
      <h2>Current turn: {currentUser?.name} </h2>
      <h2 onClick={copyToClipboard}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          Click to copy room: <a href="#">{window.origin + "/" + roomId}</a>
        </div>{" "}
      </h2>
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
          <button className="submit-chat" onClick={startNextRound}>
            Next round
          </button>
        </div>
      </div>
      <div>
        <h2>Viewer</h2>

        <button
          className="submit"
          onClick={async () => {
            const response = await axios.get(`/latest-commit/${roomId}`)
            const { data } = response
            setLatestCommitId(data.latest_commit_id)
          }}
        >
          Check for commits
        </button>
        <iframe
          src={`https://speckle.xyz/embed?stream=${streamId}&commit=${latestCommitId}`}
          width="600"
          height="400"
        ></iframe>
      </div>
    </div>
  )
}
