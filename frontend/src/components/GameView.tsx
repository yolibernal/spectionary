import axios from "axios"
import React, { FunctionComponent, useEffect, useState } from "react"
import { Message } from "../Message"
import { User } from "../User"
import { MessageBubble } from "./MessageBubble"
import { Spectionary } from "./Spectionary"
import {
  Chat,
  ChatButton,
  ChatContainer,
  CopyRoom,
  GameBox,
  GameViewContainer,
  MainContainer,
  StyledInput,
  StyledTitle,
  SubmitButton,
  ViewerBox,
} from "./styles"
import { Timer } from "./Timer"

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

  const [resetTimer, setResetTimer] = useState<boolean>(false)
  const [stopTimer, setStopTimer] = useState<boolean>(false)

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
        setStopTimer(true)
      }
      if (message.type === "timeout") {
        console.log("TIMEOUTED by", message.user)
        setResetTimer(true)
      }
      if (message.type === "new_round" && message.user) {
        setCurrentUser(message.user)
        setResetTimer(true)
        setStopTimer(false)
      }
      if (message.type === "new_commit") {
        setLatestCommitId(message.message || null)
      }
      setMessages((messages) => [...messages, message])
    }

    if (!websocket) return

    websocket.onmessage = (e) => {
      const message = JSON.parse(e.data)
      handleReceivedMessage(message)
    }
  }, [websocket, messages, setMessages])

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
    <MainContainer>
      <Spectionary />
      <GameViewContainer>
        <StyledTitle onClick={copyToClipboard}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            Click to copy room:
            <CopyRoom>{window.origin + "/" + roomId}</CopyRoom>
          </div>
        </StyledTitle>
        <StyledTitle>Current turn: {currentUser?.name} </StyledTitle>
        <StyledTitle>
          Round Countdown:{" "}
          <Timer
            resetTimer={resetTimer}
            setResetTimer={setResetTimer}
            stopTimer={stopTimer}
          />
        </StyledTitle>
        <GameBox>
          <ViewerBox>
            <iframe
              src={`https://speckle.xyz/embed?stream=${streamId}&commit=${latestCommitId}`}
              width="800"
              height="500"
            />
            <SubmitButton
              onClick={async () => {
                const response = await axios.get(`/latest-commit/${roomId}`)
                const { data } = response
                setLatestCommitId(data.latest_commit_id)
              }}
            >
              Check for commits
            </SubmitButton>
          </ViewerBox>

          <ChatContainer>
            <Chat>
              {messages.map((message, index) => (
                <MessageBubble
                  message={message}
                  myClientId={myClientId}
                  key={index}
                />
              ))}
            </Chat>
            <div className="input-chat-container">
              <StyledInput
                className="input-chat"
                type="text"
                placeholder="Chat message ..."
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendTextMessage()
                  }
                }}
              />
              <ChatButton onClick={sendTextMessage}>Send</ChatButton>
              <ChatButton onClick={startNextRound}>Next round</ChatButton>
            </div>
          </ChatContainer>
        </GameBox>
      </GameViewContainer>
    </MainContainer>
  )
}
