import React, {ReactNode, useEffect, useState} from 'react'
import logo from './logo.svg'
import './App.css'

type Message = {
  clientId: number
  type: 'message' | 'connected' | 'disconnected'
  message?: string
  time?: string
}

const App = () => {
  const [myClientId, setMyClientId] = useState(Math.floor(new Date().getTime() / 1000))

  const [websckt, setWebsckt] = useState<WebSocket>()

  const [message, setMessage] = useState<string>('')
  const [chatHistory, setChatHistory] = useState<Message[]>([])

  useEffect(() => {
    const url = 'ws://localhost:8000/ws/' + myClientId
    const ws = new WebSocket(url)

    ws.onopen = (event) => {
      const connectMessage: Message = {clientId: myClientId, type: 'connected'}
      ws.send(JSON.stringify(connectMessage))
    }

    setWebsckt(ws)

    return () => ws.close()
  }, [myClientId])

  useEffect(() => {
    const handleReceivedMessage = (message: Message) => {
      setChatHistory([...chatHistory, message])
    }

    if (!websckt) return

    websckt.onmessage = (e) => {
      const message = JSON.parse(e.data)
      handleReceivedMessage(message)
    }
  }, [websckt, chatHistory])

  const sendTextMessage = () => {
    if (websckt && message) {
      const outMessage: Message = {
        clientId: myClientId,
        type: 'message',
        message: message,
      }
      websckt.send(JSON.stringify(outMessage))
      setMessage('')
    }
  }

  const handleReceivedMessage = (message: Message) => {
    console.log(myClientId)
    setChatHistory([...chatHistory, message])
  }

  const renderedMessage = (
    {clientId, type, message}: Message,
    index: number
  ): ReactNode => {
    if (type === 'message') {
      const classPrefix = clientId === myClientId ? 'my' : 'another'
      return (
        <div key={index} className={`${classPrefix}-message-container`}>
          <div className={`${classPrefix}-message`}>
            <p className='client'>client id : {clientId}</p>
            <p className='message'>{message}</p>
          </div>
        </div>
      )
    }
    return <></>
  }

  return (
    <div className='container'>
      <h1>Chat</h1>
      <h2>Your client id: {myClientId} </h2>
      <div className='chat-container'>
        <div className='chat'>{chatHistory.map(renderedMessage)}</div>
        <div className='input-chat-container'>
          <input
            className='input-chat'
            type='text'
            placeholder='Chat message ...'
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          ></input>
          <button className='submit-chat' onClick={sendTextMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
