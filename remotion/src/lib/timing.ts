import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

/**
 * Frame-accurate "iOS style" enter/exit motion: blur + fade + slide-up on
 * the way in, blur + fade + slide-up-and-away on the way out.
 *
 * Deliberately built on Remotion's own `spring()`/`interpolate()` instead
 * of the `framer-motion` package: Remotion renders each frame as a still
 * screenshot of a specific point in time, so any animation must be a pure
 * function of `useCurrentFrame()`. Framer Motion's spring physics run on a
 * real-time requestAnimationFrame loop and are not guaranteed to land on
 * the exact value for an arbitrary seeked frame, which causes stutter/pops
 * when Remotion renders out of real-time (e.g. one frame per 200ms during
 * `remotion render`). `spring()`/`interpolate()` give the same premium,
 * physically-based motion but are 100% deterministic per frame — the
 * correct tool for anything that gets exported to video.
 *
 * Call this from inside a component that is itself wrapped in a
 * `<Sequence from={startFrame} durationInFrames={durationFrames}>` so
 * `useCurrentFrame()` here is already relative to the cue's own start.
 */
export function useEnterExit(
  durationInFrames: number,
  options?: { enterFrames?: number; exitFrames?: number },
) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const enterFrames = options?.enterFrames ?? 18
  const exitFrames = options?.exitFrames ?? 14

  const enter = spring({
    frame,
    fps,
    config: { damping: 16, mass: 0.6, stiffness: 140 },
    durationInFrames: enterFrames,
  })

  const exit = interpolate(
    frame,
    [Math.max(durationInFrames - exitFrames, 0), durationInFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  )

  const opacity = enter * (1 - exit)
  const translateY =
    interpolate(enter, [0, 1], [28, 0]) + interpolate(exit, [0, 1], [0, -18])
  const blurPx =
    interpolate(enter, [0, 1], [16, 0]) + interpolate(exit, [0, 1], [0, 12])
  const scale = interpolate(enter, [0, 1], [0.94, 1])

  return { frame, opacity, translateY, blurPx, scale, enter, exit }
}

export function secondsToFrames(seconds: number, fps: number): number {
  return Math.round(seconds * fps)
}
