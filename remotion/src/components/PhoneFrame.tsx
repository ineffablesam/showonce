import type { CSSProperties, ReactNode } from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

import { theme } from '../lib/theme'

/**
 * GTA-style phone card: slides up from off-screen bottom, settles, holds,
 * then (optionally) slides back down. Deliberately only covers the lower
 * portion of the frame — the recording stays visible above it, same idea
 * as the in-game phone popups.
 */
export function PhoneFrame({
  children,
  durationInFrames,
  exitFrames = 16,
}: {
  children: ReactNode
  durationInFrames: number
  exitFrames?: number
}) {
  const frame = useCurrentFrame()
  const { fps, height } = useVideoConfig()

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 18, mass: 0.8, stiffness: 120 },
    durationInFrames: 22,
  })
  const slideOut = interpolate(
    frame,
    [Math.max(durationInFrames - exitFrames, 0), durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  const offscreenY = height * 0.62
  const translateY =
    interpolate(slideIn, [0, 1], [offscreenY, 0]) +
    interpolate(slideOut, [0, 1], [0, offscreenY])

  const style: CSSProperties = {
    position: 'absolute',
    left: '50%',
    bottom: 0,
    width: 560,
    transform: `translateX(-50%) translateY(${translateY}px)`,
    borderRadius: '32px 32px 0 0',
    background: 'rgba(20,20,22,0.92)',
    backdropFilter: 'blur(24px)',
    boxShadow: '0 -20px 60px rgba(0,0,0,0.45)',
    paddingTop: 14,
    paddingBottom: 36,
    overflow: 'hidden',
  }

  return (
    <div style={style}>
      <div
        style={{
          margin: '0 auto 18px',
          width: 44,
          height: 5,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.32)',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: '0 26px',
        }}
      >
        {children}
      </div>
    </div>
  )
}

/** Compact, static (already-settled) message bubble for the thread history
 * shown inside `PhoneFrame` — no entrance animation, it's "already there". */
export function ThreadBubble({
  from,
  text,
}: {
  from: 'samuel' | 'mom'
  text: string
}) {
  const isSamuel = from === 'samuel'
  return (
    <div
      style={{
        alignSelf: isSamuel ? 'flex-end' : 'flex-start',
        maxWidth: '78%',
        padding: '11px 16px',
        borderRadius: 18,
        fontFamily: theme.font,
        fontWeight: 500,
        fontSize: 17,
        lineHeight: 1.32,
        color: theme.white,
        background: isSamuel ? theme.imessageBlue : theme.imessageGray,
      }}
    >
      {text}
    </div>
  )
}

/** The new outgoing bubble (the handoff link) — pops in with a little
 * overshoot, like iMessage's own send animation, once the frame it's
 * given has advanced far enough (pass `frame` relative to PhoneFrame's
 * own timeline, i.e. plain `useCurrentFrame()` from inside the frame). */
export function NewLinkBubble({
  appearAtFrame,
  link,
}: {
  appearAtFrame: number
  link: string
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const local = frame - appearAtFrame
  const pop = spring({
    frame: local,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 220 },
    durationInFrames: 16,
  })
  if (local < 0) return null

  return (
    <div
      style={{
        alignSelf: 'flex-end',
        maxWidth: '82%',
        padding: '12px 18px',
        borderRadius: 18,
        fontFamily: theme.font,
        fontWeight: 600,
        fontSize: 16,
        lineHeight: 1.3,
        color: theme.white,
        background: theme.imessageBlue,
        opacity: pop,
        transform: `scale(${interpolate(pop, [0, 1], [0.7, 1])})`,
        transformOrigin: 'bottom right',
        textDecoration: 'underline',
        wordBreak: 'break-all',
      }}
    >
      {link}
    </div>
  )
}
