import { User } from "./User"

export type Message = {
  clientId: string
  name?: string
  type:
    | "message"
    | "connected"
    | "disconnected"
    | "new_commit"
    | "new_round"
    | "solved"
    | "timeout"
  message?: string
  time?: string
  user?: User
}
