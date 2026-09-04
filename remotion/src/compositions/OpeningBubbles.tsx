import type { CalculateMetadataFunction } from 'remotion'
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion'
import { z } from 'zod'

import { MessageBubble } from '../components/MessageBubble'
import { safeAudioDuration } from '../lib/audioDuration'
import { secondsToFrames } from '../lib/timing'

export const openingBubblesSchema = z.object({
  momAskFile: z.string().default('audio/mom-ask.mp3'),
  samuelReplyFile: z.string().default('audio/samuel-reply.mp3'),
  momText: z
    .string()
    .default(
      "Hey… can you help me? I need to upgrade my insurance on that portal. I don't know what to do.",
    ),
  samuelText: z.string().default('Give me a minute.'),
  /** Gap between the two bubbles, and breathing room at head/tail. */
  gapSeconds: z.number().default(0.5),
  leadInSeconds: z.number().default(0.3),
  tailSeconds: z.number().default(0.6),
  /** Populated by calculateMetadata from the real audio file lengths —
   * leave untouched, don't set these in the Studio UI. */
  momFrames: z.number().optional(),
  samuelFrames: z.number().optional(),
  samuelStartFrame: z.number().optional(),
})

type Props = z.infer<typeof openingBubblesSchema>

const FPS = 60

/**
 * Insert Video 1 — the opening iMessage beat. Mom's bubble appears and
 * STAYS on screen (this is a real thread building up, not one message
 * replacing another) while Samuel's reply lands underneath it; both hold
 * together until the very end, then fade out as a pair. Sits on a soft
 * dark gradient background rather than plain transparent, so it reads as
 * a real opening card rather than bubbles floating on nothing.
 */
export const OpeningBubbles: React.FC<Props> = ({
  momAskFile,
  samuelReplyFile,
  momText,
  samuelText,
  leadInSeconds,
  momFrames = secondsToFrames(4.6, FPS),
  samuelFrames = secondsToFrames(2.1, FPS),
  samuelStartFrame = secondsToFrames(leadInSeconds + 4.6 + 0.5, FPS),
}) => {
  const leadIn = secondsToFrames(leadInSeconds, FPS)

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 90% at 50% 30%, #2c2e29 0%, #171815 55%, #0c0d0b 100%)',
        }}
      />
      <Sequence from={leadIn} durationInFrames={momFrames}>
        <Audio src={staticFile(momAskFile)} />
        <MessageBubble
          from="mom"
          text={momText}
          durationInFrames={momFrames}
          topPercent={40}
        />
      </Sequence>
      <Sequence from={samuelStartFrame} durationInFrames={samuelFrames}>
        <Audio src={staticFile(samuelReplyFile)} />
        <MessageBubble
          from="samuel"
          text={samuelText}
          durationInFrames={samuelFrames}
          topPercent={54}
        />
      </Sequence>
    </AbsoluteFill>
  )
}

export const calculateOpeningBubblesMetadata: CalculateMetadataFunction<
  Props
> = async ({ props }) => {
  const [momSeconds, samuelSeconds] = await Promise.all([
    safeAudioDuration(staticFile(props.momAskFile), 4.2),
    safeAudioDuration(staticFile(props.samuelReplyFile), 1.6),
  ])
  const leadIn = secondsToFrames(props.leadInSeconds, FPS)
  const gap = secondsToFrames(props.gapSeconds, FPS)
  const tail = secondsToFrames(props.tailSeconds, FPS)
  const momSpeakFrames = secondsToFrames(momSeconds, FPS)
  const samuelSpeakFrames = secondsToFrames(samuelSeconds, FPS)

  const samuelStartFrame = leadIn + momSpeakFrames + gap
  const totalFrames = samuelStartFrame + samuelSpeakFrames + tail

  return {
    durationInFrames: totalFrames,
    props: {
      ...props,
      // Both bubbles' Sequences run all the way to the end of the clip
      // (instead of just their own speaking length) so neither one exits
      // early — they hold together and fade out as a pair at the very end.
      momFrames: totalFrames - leadIn,
      samuelFrames: totalFrames - samuelStartFrame,
      samuelStartFrame,
    },
  }
}
