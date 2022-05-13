import axios from "axios"
import React, { FunctionComponent, useEffect, useState } from "react"
import { Message } from "../Message"
import { User } from "../User"
import { MessageBubble } from "./MessageBubble"
import { CopyRoom, GameBox, GameViewContainer, ViewerBox } from "./styles"

export const GameView: FunctionComponent<{
  roomId: string
  clientId: string
  streamId: string
}> = ({ roomId, clientId: myClientId, streamId }) => {
  const [websocket, setWebsocket] = useState<WebSocket>()

  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])

  const [latestCommitId, setLatestCommitId] = useState<string | null>(null)

  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    const url = `ws://localhost:8000/ws/${roomId}/${myClientId}`
    const ws = new WebSocket(url)

    ws.onopen = () => {
      const connectMessage: Message = {
        clientId: myClientId,
        type: "connected",
      }
      ws.send(JSON.stringify(connectMessage))
    }

    setWebsocket(ws)

    return () => ws.close()
  }, [myClientId, roomId])

  useEffect(() => {
    const handleReceivedMessage = (message: Message) => {
      if (message.type === "solved") {
        console.log("SOLVED by", message.user)
      }
      if (message.type === "timeout") {
        console.log("TIMEOUTED by", message.user)
      }
      if (message.type === "new_round" && message.user) {
        setCurrentUser(message.user)
      }
      if (message.type === "new_commit") {
        setLatestCommitId(message.message || null)
      }
      setMessages([...messages, message])
    }

    if (!websocket) return

    websocket.onmessage = (e) => {
      const message = JSON.parse(e.data)
      handleReceivedMessage(message)
    }
  }, [websocket, messages])

  const sendTextMessage = () => {
    if (!websocket || !message) {
      return
    }

    const outMessage: Message = {
      clientId: myClientId,
      type: "message",
      message: message,
    }
    websocket.send(JSON.stringify(outMessage))
    setMessage("")
  }

  const startNextRound = async () => {
    const response = await axios.post(`/next-round/${roomId}`)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.origin + "/" + roomId)
  }

  return (
    <GameViewContainer>
      <h1>Spectionary</h1>
      <h2 onClick={copyToClipboard}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          Click to copy room:{" "}
          <CopyRoom>{window.origin + "/" + roomId}</CopyRoom>
        </div>
      </h2>
      <h2>Current turn: {currentUser?.name} </h2>
      <GameBox>
        <ViewerBox>
          <iframe
            src={`https://speckle.xyz/embed?stream=${streamId}&commit=${latestCommitId}`}
            width="800"
            height="500"
          />
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
        </ViewerBox>

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
      </GameBox>
    </GameViewContainer>
  )
}
