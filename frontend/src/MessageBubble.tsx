import React, { FunctionComponent } from "react"
import { Message } from "./App"

export const MessageBubble: FunctionComponent<{
  myClientId: number
  message: Message
}> = ({ message, myClientId }) => {
  const { type, clientId } = message
  if (type !== "message") {
    return null
  }
  const classPrefix = clientId === myClientId ? "my" : "another"
  return (
    <div className={`${classPrefix}-message-container`}>
      <div className={`${classPrefix}-message`}>
        <p className="client">client id : {clientId}</p>
        <p className="message">{message.message}</p>
      </div>
    </div>
  )
}
