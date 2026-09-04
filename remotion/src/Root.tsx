import { Composition } from 'remotion'

import {
  OpeningBubbles,
  calculateOpeningBubblesMetadata,
  openingBubblesSchema,
} from './compositions/OpeningBubbles'
import {
  PainPointReveal,
  calculatePainPointRevealMetadata,
  painPointRevealSchema,
} from './compositions/PainPointReveal'
import {
  SendLinkPopup,
  calculateSendLinkPopupMetadata,
  sendLinkPopupSchema,
} from './compositions/SendLinkPopup'

const WIDTH = 1920
const HEIGHT = 1080
const FPS = 60

/**
 * Three independent inserts, three independent renders — each one drops
 * into Premiere at its own point in the timeline. None of them run on a
 * shared master timeline; each is sized from its own ElevenLabs audio
 * file via `calculateMetadata`, so durations below are just Studio
 * placeholders shown before that resolves.
 *
 * Render all three transparent ProRes 4444 outputs with:
 *   npx remotion render OpeningBubbles out/1-opening-bubbles.mov
 *   npx remotion render PainPointReveal out/2-pain-point-reveal.mov
 *   npx remotion render SendLinkPopup out/3-send-link-popup.mov
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="OpeningBubbles"
        component={OpeningBubbles}
        durationInFrames={7 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={openingBubblesSchema}
        defaultProps={openingBubblesSchema.parse({})}
        calculateMetadata={calculateOpeningBubblesMetadata}
      />
      <Composition
        id="PainPointReveal"
        component={PainPointReveal}
        durationInFrames={18 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={painPointRevealSchema}
        defaultProps={painPointRevealSchema.parse({})}
        calculateMetadata={calculatePainPointRevealMetadata}
      />
      <Composition
        id="SendLinkPopup"
        component={SendLinkPopup}
        durationInFrames={4 * FPS}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        schema={sendLinkPopupSchema}
        defaultProps={sendLinkPopupSchema.parse({})}
        calculateMetadata={calculateSendLinkPopupMetadata}
      />
    </>
  )
}
