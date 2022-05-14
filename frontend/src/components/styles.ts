import styled from "styled-components"

export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
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

export const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
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
  background-color: rgb(77, 168, 253, 0.6);
  padding: 8px;
  margin: 2px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
`

export const UserEntry = styled.div`
  height: 32px;
  line-height: 32px;
  margin: 4px;
  padding: 0px 4px;
  border: 1px solid;
  background-color: rgb(77, 253, 200, 0.6);
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

export const TimerStyle = styled.div`
  font-weight: 700;
  color: #3c82f6;
  margin: 0 0 0 8px;
`
