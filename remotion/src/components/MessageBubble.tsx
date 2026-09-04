import type { CSSProperties } from 'react'

import { useEnterExit } from '../lib/timing'
import { theme } from '../lib/theme'

/**
 * Insert A — iOS-style message bubble, full-screen/center-stage version.
 * Used for the opening iMessage beat (Video 1). For the compact thread
 * history inside the phone-popup insert (Video 3), see `ThreadBubble`.
 *
 * Blur + fade + slide-up entrance, hold, blur + fade + slide-up exit.
 * Samuel = right-aligned / blue (the "me" side of iMessage).
 * Mom = left-aligned / gray (the "them" side of iMessage).
 */
export function MessageBubble({
  from,
  text,
  durationInFrames,
  topPercent = 42,
}: {
  from: 'samuel' | 'mom'
  text: string
  durationInFrames: number
  /** Vertical position, so multiple bubbles can stack into a real thread
   * instead of overlapping when they're on screen at the same time. */
  topPercent?: number
}) {
  const { opacity, translateY, blurPx, scale } = useEnterExit(durationInFrames)
  const isSamuel = from === 'samuel'

  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    top: `${topPercent}%`,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: isSamuel ? 'flex-end' : 'flex-start',
    padding: '0 120px',
  }

  const bubbleStyle: CSSProperties = {
    opacity,
    transform: `translateY(${translateY}px) scale(${scale})`,
    filter: `blur(${blurPx}px)`,
    maxWidth: 680,
    padding: '22px 30px',
    borderRadius: 30,
    fontFamily: theme.font,
    fontWeight: 500,
    fontSize: 28,
    lineHeight: 1.35,
    letterSpacing: '-0.01em',
    color: theme.white,
    background: isSamuel
      ? `linear-gradient(180deg, #2b9dff 0%, ${theme.imessageBlue} 100%)`
      : `linear-gradient(180deg, #4a4a4c 0%, ${theme.imessageGray} 100%)`,
    boxShadow: '0 18px 40px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.18)',
    transformOrigin: isSamuel ? 'bottom right' : 'bottom left',
  }

  const tailStyle: CSSProperties = {
    position: 'absolute',
    bottom: -3,
    [isSamuel ? 'right' : 'left']: 18,
    width: 22,
    height: 22,
    background: isSamuel ? theme.imessageBlue : theme.imessageGray,
    clipPath: isSamuel
      ? 'polygon(0 0, 100% 100%, 100% 0)'
      : 'polygon(0 0, 0 100%, 100% 0)',
  }

  return (
    <div style={wrapperStyle}>
      <div style={{ position: 'relative' }}>
        <div style={bubbleStyle}>{text}</div>
        <div style={{ ...tailStyle, opacity }} />
      </div>
    </div>
  )
}
