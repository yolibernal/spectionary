import styled from "styled-components"
import { Message } from "../Message"

export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 16px 0 0 0;
  overflow-y: scroll;
`

export const SpectionaryLogo = styled.div`
  color: #3c82f6;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 auto;
  padding: 8px 0 16px 0;
  display: flex;
  &:first-child {
    margin: 0 16px 0 0;
  }
`

export const JoinRoomViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto auto;
  padding: 0 0 16px 0;
  & > * {
    margin: 12px 0 12px 0;
  }
  & > *:first-child {
    margin: 0 0 12px 0;
  }
  & > *:last-child {
    margin: 12px 0 0 0;
  }
`

export const StyledInput = styled.input`
  height: 52px;
  color: #171821;
  font-size: 16px;
  padding: 8px;
  margin-bottom: 16px;
  border: 1px solid black;
  box-shadow: 5px 5px black;
`

export const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: #171821;
`

export const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
`

export const RoomInfo = styled.div`
  width: 800px;
`

export const UserList = styled.div`
  box-shadow: 10px 10px;
  width: 400px;
  max-height: 128px;
  border: 1px solid;
  background-image: linear-gradient(
    180deg,
    rgba(77, 169, 255, 0.6) 17%,
    rgba(172, 215, 255, 0.85) 88%
  );
  padding: 8px;
  margin: 2px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  margin: 0 0 16px 0;
`

interface UserProps {
  isSelected: boolean
}

export const UserEntry = styled.div<UserProps>`
  height: 32px;
  line-height: 32px;
  margin: 4px;
  padding: 0px 4px;
  border: 1px solid;
  background-color: ${({ isSelected }) =>
    isSelected ? "pink" : "rgb(77, 253, 200, 0.6)"};
  text-align: center;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
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
  padding: 0 0 16px 0;
`

export const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  box-shadow: 10px 10px;
  width: 400px;
  max-height: 500px;
  border: 1px solid;
`

export const Chat = styled.div`
  padding: 10px;
  height: 100%;
  background-image: linear-gradient(
    180deg,
    rgba(77, 169, 255, 0.6) 17%,
    rgba(172, 215, 255, 0.85) 88%
  );
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
  flex-wrap: wrap;
  justify-content: center;
`

export const ViewerBox = styled.div`
  display: flex;
  flex-direction: column;
  box-shadow: 10px 10px;
  margin: 0 16px 0 0;
`

export const ChatButton = styled.button`
  background-color: #3c82f6;
  outline: none;
  border: 1px solid black;
  cursor: pointer;
  color: white;
  height: 52px;
  &:hover {
    background-color: rgb(16, 108, 230);
  }
  box-shadow: 5px 5px black;
`
export const ChatButtonGroup = styled.div`
  width: 100%;
  display: flex;
  padding: 16px 16px 0 16px;
  height: auto;
  border: 1px solid black;
  display: flex;
  flex-direction: row;
  background-color: rgb(53, 253, 220);
  line-height: 16px;
`

export const SubmitButton = styled.button`
  background-color: #3c82f6;
  outline: none;
  border: 1px solid black;
  height: 48px;
  cursor: pointer;
  color: white;
  font-size: 16px;
  font-weight: bold;
  padding: 0px 16px;
  &:hover {
    background-color: rgb(16, 108, 230);
  }
  box-shadow: 5px 5px black;
  display: flex;
  align-items: center;
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
