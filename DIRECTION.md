# ShowOnce — Demo VO Script & Recording Plan

Refactored so judges get the point fast — no lingering explanation. Split
into exactly the audio files you need to generate in ElevenLabs, one file
per line below. File names are exact — Remotion and the edit both expect
them.

Two voices: **Mom** and **Samuel**. Every line is short enough to read
naturally in one breath.

---

## Batch 1 — Insert Video 1: opening iMessage bubbles

Two files, two voices. Once both are generated, drop them into
`remotion/public/audio/` with these exact names — Remotion measures each
file's real length and times the bubble animation to it automatically.

| File | Voice | Line |
|---|---|---|
| `mom-ask.mp3` | Mom | "Hey… can you help me? I need to upgrade my insurance on that portal. I don't know what to do." |
| `samuel-reply.mp3` | Samuel | "Give me a minute." |

→ Renders as **Insert Video 1**: two iMessage bubbles, center screen, blur/fade/slide-up.

---

## Batch 2 — Insert Video 2: pain points → "I just walk through it once"

One file. This is the merged, tightened version of what used to be two
separate VO lines — shorter reads clearer, and the icon rail carries the
"phone / screen-share / screenshots" idea visually so the line doesn't
have to spell it out at length.

| File | Voice | Line |
|---|---|---|
| `samuel-painpoints.mp3` | Samuel | "I'm studying abroad — I can't just walk over and do this for her. Normally that's an hour on the phone, a screen-share, or screenshots of every single page. So this time, I did it differently — I just walk through it once." |

> Note: the file you generated actually reads "I just walk through it
> once" (not "created a shareable link" — that was an in-progress edit
> when you generated this take). Kept the take as-is rather than asking
> for a re-generation over one clause; the icon-rail timing below is
> pulled from Whisper on this exact recording, so it's already accurate
> to what's in the file.

→ Renders as **Insert Video 2**: left rail (15% width) with three icons —
phone call, screen-share, screenshot — appearing in step with those three
words, while the real recording sits at 85% width on the right. Rail
slides out and the recording expands to fill the frame right as "I just
walk through it once" lands. Icon and exit timing below are pulled from
real Whisper word timestamps on the actual file, not estimated:

| Beat | Time |
|---|---|
| "phone," | 5.80s |
| "screen share," | 6.34s |
| "screenshots" | 7.22s |
| rail exits ("I just walk through it once") | 12.26s |

---

## Batch 3 — Insert Video 3: sending the link

One file, short and punchy.

| File | Voice | Line |
|---|---|---|
| `samuel-send-link.mp3` | Samuel | "Then I just... send her the link." |

→ Renders as **Insert Video 3**: a GTA-style phone card slides up from the
bottom of the frame, showing the two earlier messages already in the
thread (Mom's ask, "give me a minute"), then a new outgoing bubble lands
with the handoff link.

---

## Everything else — plain VO over the raw recording, no inserts

These lines sit directly on the screen recording in Premiere. No Remotion
graphics — you asked to cut anything that isn't earning its place, and
none of these need a visual insert; the recording already shows it.

| File | Voice | Line |
|---|---|---|
| `samuel-renewal-myself.mp3` | Samuel | "So I go do the renewal myself — on one of those government websites that looks like it hasn't been touched since 2004 — exactly the way she needs it." |
| `mom-do-as-samuel-said.mp3` | Mom | "Do as Samuel said." |
| `samuel-outro.mp3` | Samuel | *see below — one continuous generation* |

### `samuel-outro.mp3` — generate this as ONE take

This used to be 5 separate files (`samuel-agent-picks-up`,
`samuel-mismatch-slower`, `samuel-notification-decision`,
`samuel-finishes`, `samuel-closing`). Merged into one script so you only
generate once — one voice take reads more consistently than five stitched
together anyway. Paste this whole block into ElevenLabs as-is; the blank
lines between paragraphs already read as natural pauses, so each beat
still lands separately even though it's one file. The `...` mid
paragraph 2 is there on purpose — it's the one moment that should slow
down and land heavier (the price mismatch), the ellipsis makes most TTS
voices pause and downshift there without you needing a second take.

```
Her agent picks up right where I left off — using WebMCP, same page, actually doing it.

Then it hits something I didn't plan for — the price is different on her side. So it doesn't guess. It just stops... and asks me. Not her.

I get a notification, not a phone call. I pick the plan, send it back.

And it just finishes — no restarting, no re-explaining.

That's ShowOnce — built on WebMCP. I don't screen-record, I show it once, for real. The agent does the rest.
```

**Small text on closing card:** WebMCP Challenge · showonce.vercel.app

In Premiere, this one clip spans from where the agent's tool calls start
firing all the way to the closing card — cut/trim the clip (don't
re-split it) if any single beat needs to shift against the picture.

---

## Why this cut what it cut

- The old "using WebMCP, tools the site itself gives it, so it's not
  guessing at buttons" clause moved out of the pain-points line (too much
  explanation stacked on top of the icon rail) and into the opening line
  of `samuel-outro.mp3` ("Her agent picks up... using WebMCP..."), which
  plays exactly when the agent's tool calls actually start firing on
  screen — WebMCP gets mentioned right when it's visibly true, not
  argued for in the abstract.
- "This isn't a recording of me clicking around... it's saving what I
  actually did" got folded into the closing line ("I don't screen-record,
  I show it once, for real") instead of standing alone mid-video — it's a
  real technical claim judges should hear, but it lands better as the
  takeaway than as a detour.
- The mismatch line was corrected to match what's actually in the take:
  it's a **price** difference ($88 → $142 on Gold), not an unavailable
  plan — the old line said "her plan isn't even offered anymore," which
  doesn't match this recording.
- "I just recorded it once" was flagged to avoid — "recorded" reads as
  *video recording*, undercutting the closing line's "I don't
  screen-record..." claim. Landed on "I just walk through it once" in
  the actual take (echoes the ShowOnce landing tagline, "Walk through it
  once. Agents complete it live."), which is what got generated and
  what the timing below matches.
- WebMCP is now mentioned exactly twice: once when the agent starts
  acting, once in the closing line — same as before, just relocated to
  where it's true on screen.
