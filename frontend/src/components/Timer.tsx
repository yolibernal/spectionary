import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useCallback,
  useEffect,
} from "react"
import useCountDown from "../hooks/useCountdown"
import { TimerStyle } from "./styles"
interface Props {
  setResetTimer: Dispatch<SetStateAction<boolean>>
  resetTimer: boolean
  stopTimer: boolean
}
export const Timer: FunctionComponent<Props> = ({
  resetTimer,
  setResetTimer,
  stopTimer,
}) => {
  const initialTime = 5 * 60 * 1000 // initial time in milliseconds, defaults to 60000
  const interval = 1000 // interval to change remaining time amount, defaults to 1000

  //@ts-ignore
  const [timeLeft, { start, pause, resume, reset }] = useCountDown(
    initialTime,
    interval
  )

  useEffect(() => {
    if (resetTimer) {
      start(initialTime)
      setResetTimer(false)
    }
  }, [resetTimer])

  useEffect(() => {
    if (stopTimer) {
      pause()
    } else {
      resume()
    }
  }, [stopTimer])

  const millisToMinutesAndSeconds = (millis: number) => {
    const minutes = Math.floor(millis / 60000)
    const seconds = Math.floor((millis % 60000) / 1000)
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
  }

  const restart = useCallback(() => {
    start(initialTime)
  }, [])

  return (
    <TimerStyle>
      {/*@ts-ignore*/}
      {millisToMinutesAndSeconds(timeLeft)}
    </TimerStyle>
  )
}
