import { Camera, Phone, Plane, ScreenShare } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

import { theme } from '../lib/theme'

export const RAIL_WIDTH_PERCENT = 15

interface IconBeat {
  Icon: LucideIcon
  label: string
}

const BEATS: IconBeat[] = [
  { Icon: Plane, label: 'Studying\nabroad' },
  { Icon: Phone, label: 'An hour on\nthe phone' },
  { Icon: ScreenShare, label: 'A screen-\nshare' },
  { Icon: Camera, label: 'Texting\nscreenshots' },
]

/**
 * Real word-level timestamps from Whisper on the actual generated
 * "samuel-painpoints.mp3" (base model, `--word_timestamps True`):
 *
 *   0.15s  (line opens: "I'm studying abroad...") → icon 0 (plane), so
 *          the rail isn't sitting empty while that clause plays
 *   5.80s  "phone,"        → icon 1 (phone)
 *   6.34s  "screen" share, → icon 2 (screen-share)
 *   7.22s  "screenshots"   → icon 3 (screenshot)
 *  12.26s  "I just walk through it once." clause starts → rail exits
 *
 * If you regenerate this audio file with a different take, re-run:
 *   whisper samuel-painpoints.mp3 --model base --word_timestamps True \
 *     --output_format json
 * and update the seconds below from the new `words[].start` values.
 */
const ICON_TRIGGER_SECONDS = [0.15, 5.8, 6.34, 7.22] as const
const RAIL_EXIT_SECONDS = 12.26

/**
 * Insert #2 — the left rail (15% of the frame) that appears over the
 * recording while the "pain points" line plays, one icon popping in per
 * clause, then sliding fully off-screen right as the closing clause
 * lands so the recording can fill the frame for the rest of the video.
 *
 * This only renders the rail graphic. Scaling the underlying recording to
 * 85% width while this is on screen, then back to 100% when it exits, is
 * a keyframe you set on the video clip itself in Premiere — match the
 * exit frame below (`railExitFrame`) to whichever frame you cut the
 * recording back to full width.
 */
export function PainPointRail({ durationInFrames }: { durationInFrames: number }) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  const railEnter = spring({
    frame,
    fps,
    config: { damping: 18, mass: 0.7, stiffness: 130 },
    durationInFrames: 20,
  })
  const exitStartFrame = Math.min(
    Math.round(RAIL_EXIT_SECONDS * fps),
    durationInFrames,
  )
  const railExit = interpolate(
    frame,
    [exitStartFrame, exitStartFrame + 18],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  const railTranslateX =
    interpolate(railEnter, [0, 1], [-100, 0]) +
    interpolate(railExit, [0, 1], [0, -100])
  const railOpacity = railEnter * (1 - railExit)

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: `${RAIL_WIDTH_PERCENT}%`,
        background: '#efefe9',
        borderRight: '1px solid #e0e0d9',
        boxShadow: '10px 0 40px rgba(0,0,0,0.12)',
        transform: `translateX(${railTranslateX}%)`,
        opacity: railOpacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 42,
        padding: '0 18px',
      }}
    >
      {BEATS.map((beat, index) => (
        <PainPointItem
          beat={beat}
          key={beat.label}
          triggerFrame={Math.round(ICON_TRIGGER_SECONDS[index] * fps)}
        />
      ))}
    </div>
  )
}

function PainPointItem({
  beat: { Icon, label },
  triggerFrame,
}: {
  beat: IconBeat
  triggerFrame: number
}) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const local = frame - triggerFrame
  const enter = spring({
    frame: local,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 170 },
    durationInFrames: 16,
  })
  if (local < -4) return null

  const opacity = interpolate(enter, [0, 1], [0, 1])
  const translateY = interpolate(enter, [0, 1], [18, 0])
  const scale = interpolate(enter, [0, 1], [0.85, 1])
  const blurPx = interpolate(enter, [0, 1], [8, 0])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        filter: `blur(${blurPx}px)`,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: theme.ink,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon color={theme.accent} size={28} strokeWidth={1.8} />
      </div>
      <span
        style={{
          fontFamily: theme.font,
          fontWeight: 600,
          fontSize: 13,
          lineHeight: 1.25,
          textAlign: 'center',
          color: theme.ink,
          whiteSpace: 'pre-line',
        }}
      >
        {label}
      </span>
    </div>
  )
}
