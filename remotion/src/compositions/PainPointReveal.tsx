import type { CalculateMetadataFunction } from 'remotion'
import { AbsoluteFill, Audio, staticFile } from 'remotion'
import { z } from 'zod'

import { PainPointRail } from '../components/PainPointRail'
import { safeAudioDuration } from '../lib/audioDuration'
import { secondsToFrames } from '../lib/timing'

export const painPointRevealSchema = z.object({
  audioFile: z.string().default('audio/samuel-painpoints.mp3'),
  tailSeconds: z.number().default(0.5),
  /** Populated by calculateMetadata from the real audio length. */
  totalFrames: z.number().optional(),
})

type Props = z.infer<typeof painPointRevealSchema>

const FPS = 60

/**
 * Insert Video 2 — the pain-points line, with a left rail (15% width)
 * that pops in phone → screen-share → screenshot icons roughly where
 * those words land, then slides off right as "I created a shareable
 * link" lands.
 *
 * This composition renders ONLY the rail graphic on a transparent
 * background — in Premiere, scale/crop the real recording to the right
 * 85% underneath it while this clip plays, then cut back to full-width
 * recording the moment the rail finishes exiting (see
 * `PainPointRail`'s `RAIL_EXIT_FRACTION` comment for the exact frame).
 */
export const PainPointReveal: React.FC<Props> = ({
  audioFile,
  totalFrames = secondsToFrames(18, FPS),
}) => {
  return (
    <AbsoluteFill style={{ background: 'transparent' }}>
      <Audio src={staticFile(audioFile)} />
      <PainPointRail durationInFrames={totalFrames} />
    </AbsoluteFill>
  )
}

export const calculatePainPointRevealMetadata: CalculateMetadataFunction<
  Props
> = async ({ props }) => {
  const seconds = await safeAudioDuration(staticFile(props.audioFile), 18)
  const totalFrames = secondsToFrames(seconds + props.tailSeconds, FPS)
  return {
    durationInFrames: totalFrames,
    props: { ...props, totalFrames },
  }
}
