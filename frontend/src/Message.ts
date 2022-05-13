export type Message = {
  clientId: string
  type: "message" | "connected" | "disconnected"
  message?: string
  time?: string
}
