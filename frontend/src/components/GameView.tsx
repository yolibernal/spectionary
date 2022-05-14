import ContentPasteIcon from "@mui/icons-material/ContentPaste"
import StarTwoToneIcon from "@mui/icons-material/StarTwoTone"
import axios from "axios"
import React, { FunctionComponent, useEffect, useRef, useState } from "react"
import { Message } from "../Message"
import { User } from "../User"
import { MessageBubble } from "./MessageBubble"
import { Spectionary } from "./Spectionary"
import {
  Chat,
  ChatButton,
  ChatButtonGroup,
  ChatContainer,
  GameBox,
  GameViewContainer,
  MainContainer,
  RoomInfo,
  StyledInput,
  StyledTitle,
  SubmitButton,
  TitleRow,
  UserEntry,
  UserList,
  ViewerBox,
} from "./styles"
import { Timer } from "./Timer"
import { Waves } from "./Waves"

export const GameView: FunctionComponent<{
  roomId: string
  clientId: string
  streamId: string
}> = ({ roomId, clientId: myClientId, streamId }) => {
  const [websocket, setWebsocket] = useState<WebSocket>()

  const [resetTimer, setResetTimer] = useState<boolean>(false)
  const [stopTimer, setStopTimer] = useState<boolean>(false)

  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])

  const [latestCommitId, setLatestCommitId] = useState<string | null>(null)

  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentWord, setCurrentWord] = useState<string | null>(null)

  const [allUsers, setAllUsers] = useState<User[]>([])

  const messagesEndRef = useRef<HTMLHeadingElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(scrollToBottom, [messages])

  const fetchUsers = async () => {
    const response = await axios.get(`/room/${roomId}/users`)
    setAllUsers(Object.values(response.data.users))
  }

  useEffect(() => {
    fetchUsers()
  }, [messages, roomId])

  useEffect(() => {
    const url = `wss://${window.location.hostname}/ws/${roomId}/${myClientId}`
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
      console.log(message)
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
        setCurrentWord(message.word || null)
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
    navigator.clipboard.writeText(window.origin + "?roomId=" + roomId)
  }

  const renderUsers = allUsers
    .sort((a, b) => (a.points > b.points ? 1 : a.name > b.name ? 1 : -1))
    .map((user) => (
      <UserEntry
        key={`user-${user.name}`}
        isSelected={currentUser?.name === user.name}
      >
        {user.name}
        {[...Array(user.points)].map((i) => (
          <StarTwoToneIcon key={`star-${user.name}-${i}`} />
        ))}
      </UserEntry>
    ))

  return (
    <MainContainer>
      <Spectionary />
      <GameViewContainer>
        <TitleRow>
          <RoomInfo>
            <SubmitButton
              onClick={copyToClipboard}
              style={{ margin: "0 0 16px 0" }}
            >
              <div style={{ margin: "0 8px 0 0" }}>Copy Room Link</div>
              <ContentPasteIcon />
            </SubmitButton>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <StyledTitle>
                Round Countdown:
                <Timer
                  resetTimer={resetTimer}
                  setResetTimer={setResetTimer}
                  stopTimer={stopTimer}
                />
              </StyledTitle>
              <StyledTitle>
                {currentUser?.client_id === myClientId
                  ? currentWord
                  : Array.from(
                      { length: currentWord?.length || 0 },
                      (x, i) => i
                    )
                      .map((i) => "_")
                      .join("")}
              </StyledTitle>
            </div>
          </RoomInfo>
          <UserList>{renderUsers}</UserList>
        </TitleRow>
        <GameBox>
          <ViewerBox>
            <iframe
              src={`https://speckle.xyz/embed?stream=${streamId}&commit=${latestCommitId}`}
              width="800"
              height="500"
            />
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
              <div ref={messagesEndRef} />
            </Chat>
            <ChatButtonGroup>
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
            </ChatButtonGroup>
          </ChatContainer>
        </GameBox>
      </GameViewContainer>
      <Waves />
    </MainContainer>
  )
}
