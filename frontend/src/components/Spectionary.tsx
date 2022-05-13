import { FunctionComponent } from "react"
import { SpectionaryLogo } from "./styles"

export const Spectionary: FunctionComponent = () => {
  return (
    <SpectionaryLogo>
      <img
        src="/favicon.png"
        alt="spectionary logo"
        height="64px"
        width="64px"
      />
      <div>Spectionary</div>
    </SpectionaryLogo>
  )
}
