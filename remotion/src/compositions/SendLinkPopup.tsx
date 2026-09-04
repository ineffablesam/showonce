import type { CalculateMetadataFunction } from 'remotion'
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion'
import { z } from 'zod'

import { NewLinkBubble, PhoneFrame, ThreadBubble } from '../components/PhoneFrame'
import { safeAudioDuration } from '../lib/audioDuration'
import { secondsToFrames } from '../lib/timing'

export const sendLinkPopupSchema = z.object({
  audioFile: z.string().default('audio/samuel-send-link.mp3'),
  momAskText: z
    .string()
    .default('Hey… can you help me? I need to upgrade my insurance 😔'),
  samuelReplyText: z.string().default('Give me a minute.'),
  link: z.string().default('showonce.app/s/8f2a1c'),
  leadInSeconds: z.number().default(0.2),
  tailSeconds: z.number().default(0.8),
  /** Populated by calculateMetadata from the real audio length. */
  totalFrames: z.number().optional(),
  linkAppearFrame: z.number().optional(),
})

type Props = z.infer<typeof sendLinkPopupSchema>

const FPS = 60

/**
 * Insert Video 3 — GTA-style phone card slides up showing the existing
 * thread (Mom's ask, Samuel's "give me a minute" — already settled, no
 * entrance animation on those two) then the new outgoing link bubble
 * pops in right as "...send her the link" lands.
 */
export const SendLinkPopup: React.FC<Props> = ({
  audioFile,
  momAskText,
  samuelReplyText,
  link,
  leadInSeconds,
  totalFrames = secondsToFrames(4, FPS),
  linkAppearFrame = secondsToFrames(2.6, FPS),
}) => {
  const leadIn = secondsToFrames(leadInSeconds, FPS)

  return (
    <AbsoluteFill style={{ background: 'transparent' }}>
      <Sequence from={leadIn}>
        <Audio src={staticFile(audioFile)} />
      </Sequence>
      <PhoneFrame durationInFrames={totalFrames}>
        <ThreadBubble from="mom" text={momAskText} />
        <ThreadBubble from="samuel" text={samuelReplyText} />
        <NewLinkBubble appearAtFrame={linkAppearFrame} link={link} />
      </PhoneFrame>
    </AbsoluteFill>
  )
}

export const calculateSendLinkPopupMetadata: CalculateMetadataFunction<
  Props
> = async ({ props }) => {
  const seconds = await safeAudioDuration(staticFile(props.audioFile), 3)
  const leadIn = secondsToFrames(props.leadInSeconds, FPS)
  const speechFrames = secondsToFrames(seconds, FPS)
  const tail = secondsToFrames(props.tailSeconds, FPS)
  // Link bubble pops in right as the line finishes ("...send her the link").
  const linkAppearFrame = leadIn + speechFrames - secondsToFrames(0.15, FPS)
  const totalFrames = leadIn + speechFrames + tail

  return {
    durationInFrames: totalFrames,
    props: { ...props, totalFrames, linkAppearFrame },
  }
}
