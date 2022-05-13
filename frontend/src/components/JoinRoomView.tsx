import axios from "axios"
import React, { Dispatch, FunctionComponent, SetStateAction } from "react"

export const JoinRoomView: FunctionComponent<{
  clientId: string
  setRoomId: Dispatch<SetStateAction<string | null>>
}> = ({ clientId, setRoomId }) => {
  return (
    <div>
      <button
        onClick={async () => {
          const response = await axios.post(
            "http://localhost:8000/create-room",
            {
              client_id: clientId,
            }
          )
          const { room_id: roomId } = response.data
          setRoomId(roomId)
        }}
      >
        Create Game Room
      </button>
    </div>
  )
}
