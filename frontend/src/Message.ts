export type Message = {
  clientId: string
  name?: string
  type: "message" | "connected" | "disconnected" | "new_commit"
  message?: string
  time?: string
}
