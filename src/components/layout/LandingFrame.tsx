import { CornerSvg } from './CornerSvg'

export function LandingFrame() {
  return (
    <>
      <div aria-hidden="true" className="landing-frame">
        <div className="landing-frame__strip landing-frame__strip--top" />
        <div className="landing-frame__strip landing-frame__strip--bottom" />
        <div className="landing-frame__strip landing-frame__strip--left" />
        <div className="landing-frame__strip landing-frame__strip--right" />
      </div>
      <div aria-hidden="true" className="landing-frame landing-frame__corners">
        <CornerSvg className="landing-frame__corner landing-frame__corner--top-left" />
        <CornerSvg className="landing-frame__corner landing-frame__corner--top-right" />
        <CornerSvg className="landing-frame__corner landing-frame__corner--bottom-right" />
        <CornerSvg className="landing-frame__corner landing-frame__corner--bottom-left" />
      </div>
    </>
  )
}
