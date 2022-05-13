import React, { FunctionComponent } from "react"
import { Message } from "../Message"
import { StatusMessageBubble } from "./styles"

export const MessageBubble: FunctionComponent<{
  myClientId: string
  message: Message
}> = ({ message, myClientId }) => {
  const { type, clientId, name, user } = message
  if (type === "message") {
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
  if (type === "new_commit") {
    return (
      <StatusMessageBubble type={"new_commit"}>
        <p>A new commit has been sent!</p>
      </StatusMessageBubble>
    )
  }
  if (type === "new_round") {
    return (
      <StatusMessageBubble type={"new_round"}>
        <p>A new round has started!</p>
      </StatusMessageBubble>
    )
  }
  if (type === "solved") {
    return (
      <StatusMessageBubble type={"solved"}>
        <p>The word has been solved by {user?.name}!</p>
      </StatusMessageBubble>
    )
  }
  if (type === "timeout") {
    return (
      <StatusMessageBubble type={"timeout"}>
        <p>No one solved the word before the time ran out :(</p>
      </StatusMessageBubble>
    )
  }
  return null
}
