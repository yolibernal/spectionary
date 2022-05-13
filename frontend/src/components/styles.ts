import styled from "styled-components"
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
