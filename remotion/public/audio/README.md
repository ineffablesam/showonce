# Drop ElevenLabs audio here

Only these 4 files are read by Remotion (they drive the 3 insert
compositions). Everything else in `DIRECTION.md`'s script is VO that goes
straight onto the raw recording in Premiere — Remotion doesn't need it.

| File | Used by |
|---|---|
| `mom-ask.mp3` | `OpeningBubbles` |
| `samuel-reply.mp3` | `OpeningBubbles` |
| `samuel-painpoints.mp3` | `PainPointReveal` |
| `samuel-send-link.mp3` | `SendLinkPopup` |

Once a file lands here, `npm run studio` (or a render) automatically
re-measures that composition's real duration — nothing else to configure.
See `../../DIRECTION.md` for the exact line text for each file.
