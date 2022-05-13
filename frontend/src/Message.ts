export type Message = {
  clientId: string
  type: "message" | "connected" | "disconnected" | "new_commit"
  message?: string
  time?: string
  data?: any
}
