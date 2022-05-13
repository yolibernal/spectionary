import React, { FunctionComponent, useCallback, useEffect } from "react"
import useCountDown from "../hooks/useCountdown"
import { TimerStyle } from "./styles"

export const Timer: FunctionComponent = () => {
  const initialTime = 5 * 60 * 1000 // initial time in milliseconds, defaults to 60000
  const interval = 1000 // interval to change remaining time amount, defaults to 1000

  //@ts-ignore
  const [timeLeft, { start, pause, resume, reset }] = useCountDown(
    initialTime,
    interval
  )

  // start the timer during the first render
  useEffect(() => {
    start()
  }, [])

  const milisToMinutesAndSeconds = (milis: number) => {
    const minutes = Math.floor(milis / 60000)
    const seconds = Math.floor((milis % 60000) / 1000)
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`
  }

  const restart = useCallback(() => {
    start(initialTime)
  }, [])

  return (
    <TimerStyle>
      {/*@ts-ignore*/}
      {milisToMinutesAndSeconds(timeLeft)}
    </TimerStyle>
  )
}
