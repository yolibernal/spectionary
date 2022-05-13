import styled from "styled-components"
import { Message } from "../Message"

export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 16px;
`

export const SpectionaryLogo = styled.div`
  color: #3c82f6;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 auto;
  display: flex;
  &:first-child {
    margin: 0 16px 0 0;
  }
`

export const JoinRoomViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto auto;
  & > * {
    margin: 24px 0 24px 0;
  }
  & > *:first-child {
    margin: 0 0 24px 0;
  }
  & > *:last-child {
    margin: 24px 0 0 0;
  }
`

export const StyledInput = styled.input`
  height: 52px;
  color: #171821;
  font-size: 16px;
  padding: 8px;
`

export const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: #171821;
`

export const StyledTitle = styled.div`
  font-size: 1.5rem;
  font-weight: 500;
  display: flex;
`

export const OrBox = styled.div`
  font-style: italic;
  font-size: 1.2rem;
  margin: 0 auto;
`
export const CopyRoom = styled.div`
  color: #5578aa;
  :hover {
    color: #4287f5;
  }
  cursor: pointer;
`

export const GameViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 0 auto;
`

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  box-shadow: 10px 10px;
  max-width: 500px;
  max-height: 500px;
  border: 1px solid;
`

export const Chat = styled.div`
  padding: 10px;
  width: 400px;
  height: 100%;
  background-color: rgb(77, 168, 253, 0.6);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
  &:-webkit-scrollbar {
    display: none;
    /* Chrome */
  }
`

export const GameBox = styled.div`
  display: flex;
  flex-direction: row;
`

export const ViewerBox = styled.div`
  display: flex;
  flex-direction: column;
  box-shadow: 10px 10px;
  margin: 0 16px 0 0;
`

export const ChatButton = styled.button`
  background-color: rgb(0, 55, 128);
  outline: none;
  border: 1px solid rgb(0, 55, 128);
  cursor: pointer;
  color: white;
  &:hover {
    background-color: rgb(16, 108, 230);
  }
`

export const SubmitButton = styled.button`
  background-color: rgb(0, 55, 128);
  outline: none;
  border: 1px solid rgb(0, 55, 128);
  height: 48px;
  cursor: pointer;
  color: white;
  font-size: 16px;
  font-weight: bold;
  &:hover {
    background-color: rgb(16, 108, 230);
  }
`

export const StatusMessageBubble = styled.div<{ type: Message["type"] }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${({ type }) => {
    if (type === "new_round") {
      return "rgb(0, 55, 128)"
    }
    if (type === "new_commit") {
      return "#3c82f6"
    }
    if (type === "solved") {
      return "rgb(77, 253, 215)"
    }
    if (type === "timeout") {
      return "rgb(178,34,34)"
    }
    return "rgb(0, 55, 128)"
  }};
  color: ${({ type }) => {
    if (type === "solved") {
      return "black"
    }
    return "white"
  }};
  border: 1px solid black;
  box-shadow: 5px 5px black;
  margin-top: 10px;
  margin-bottom: 10px;
`

export const TimerStyle = styled.div`
  font-weight: 700;
  color: #3c82f6;
  margin: 0 0 0 8px;
`
