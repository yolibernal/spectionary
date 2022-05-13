import React, { FunctionComponent } from "react"
import { Message } from "../Message"

export const MessageBubble: FunctionComponent<{
  myClientId: string
  message: Message
}> = ({ message, myClientId }) => {
  const { type, clientId, name } = message
  if (type !== "message") {
    return null
  }
  const classPrefix = clientId === myClientId ? "my" : "another"
  return (
    <div className={`${classPrefix}-message-container`}>
      <div className={`${classPrefix}-message`}>
        <p className="client">{name}</p>
        <p className="message">{message.message}</p>
      </div>
    </div>
  )
}
