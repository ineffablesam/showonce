# ShowOnce — Demo Video Direction

**Target:** [WebMCP Challenge](https://webmcp.devpost.com/) submission
**Length:** Under 3 minutes (aim for 2:10–2:20)
**Format:** Public YouTube video with clear audio
**Tools:** Remotion (motion graphics) · CapCut / After Effects (edit) · screen recording (ChatGPT in-app browser + ShowOnce)

---

## The frame (one sentence)

**Mom needs help → I record it once → her agent runs it → it hits a real snag → it asks me, not her → it finishes itself.**

> Mom is stuck on a portal. I'm far away. No screen recording, no screenshots, no hour-long call — I record it once, and her agent takes it from there. When something doesn't match, it doesn't guess — it asks me the one specific question it needs, then finishes on its own.

---

## Judging criteria — what this video must prove

| Criterion | What to show / say |
|---|---|
| **WebMCP leverage** | Agent calls real, scoped tools on the page — including a purpose-built escalation tool (`showonce_request_helper`) when it hits a case it can't safely decide, not generic UI guessing |
| **Execution** | Full story: record → handoff → agent runs → agent hits a mismatch → human resolves *asynchronously* → agent auto-resumes → done |
| **Potential impact** | Relatable remote-help scenario, including the messy real-world case (prices/plans differ) that breaks naive automation |
| **Creativity & ambition** | WaitingRoom.gov parody + procedure handoff + scoped human-in-the-loop escalation, not a rubber-stamp approval |

---

## Architecture (for narration & Devpost text)

Answer "does this generalize?" with three layers:

| Layer | What it is | Generalizes? |
|---|---|---|
| **WebMCP** (open standard) | Site registers tools on the page | Any site can adopt this |
| **Portal** (WaitingRoom.gov) | One implementation + UI | Swappable per vertical |
| **ShowOnce** (your layer) | Procedure, handoff, compare, scoped escalation, approval | Works on **any** WebMCP-enabled site |

**One-liner for judges:**

> WebMCP is how any site exposes capabilities. ShowOnce is what makes delegation safe — record once, hand off a portable procedure, the agent executes within scope, and when it hits something it can't safely decide, it asks a scoped question instead of guessing.

**Do not say:** "We built a fake insurance site."
**Do say:** "We built a reference portal that looks like the ones people actually struggle with."

---

## Tooling split

| Segment | Tool |
|---|---|
| iMessage hook (Acts 0 and 3) | **Remotion** (iOS bubbles, kinetic type) |
| Screen recordings (dashboard, recording, handoff, ChatGPT browser, notification) | Screen record → **CapCut** or **After Effects** |
| Left-rail overlay on top of screen recording | **Remotion** (composited over the screen capture) |
| Voiceover | ElevenLabs → CapCut / Audacity |
| Final assembly | **CapCut** or AE — VO bed under everything |

Export Remotion segments as `.mp4` → import into CapCut on top of screen recordings.

---

## On-screen text style

### iOS / personal story (Acts 0 and 3)

- **Font:** SF Pro / Inter — clean, modern
- **Chat:** left gray bubbles (Mom), right blue (you)

### Pain-points icon row (Act 1a only)

A **horizontal row of 3 small icons**, full-screen, right after Mom's message and before the pivot line. This replaces the old standalone "old ways" scene — same message, but fast, with audio under it, and it flows straight into the real footage instead of sitting there in silence.

| Icon | Label | Treatment |
|---|---|---|
| 🖥 | Screen recording | Appears → **struck through (X)** on the beat |
| 📸 | Screenshots | Appears → **struck through (X)** on the beat |
| ☎ | 1+ hour call | Appears → **struck through (X)** on the beat |

- Each icon pops in and gets struck through in sync with one word of the VO line — total beat is ~5–6s, not a lingering scene
- No silence, no separate title card — this is a fast montage, not Act "Old ways" reborn
- Cuts directly into the pivot line, no pause

### Product demo (Acts 1b–6) — Split screen

**Layout:** Left rail (~20%) + right screen recording (~80%). Holds from Act 1's transition through the close, with brief full-screen cutaways back to the iMessage thread for Acts 3 and 5.

**Left rail — 4 step icons:**

| Icon | Label | State progression |
|---|---|---|
| ● | Record | Dimmed → **filled/highlighted** (Act 2) → ✓ (Act 3+) |
| ● | Hand off | Dimmed → **filled** (Act 2b) → ✓ (Act 3+) |
| ● | Agent | Dimmed → **filled/running** (Act 4) → **amber/paused** (mid Act 4, waiting on you) → **running again** (Act 6) → ✓ |
| ● | Approve | Dimmed → **filled** (Act 6) → ✓ (close) |

- Completed = checkmark, active/running = filled, **paused-on-you = amber pulse** — this is the key visual beat, don't skip it
- Rail stays visible so judges always know where they are; no separate title cards needed
- The amber pulse on "Agent" is the moment that proves the escalation is real, not scripted luck

**Right side:** the actual screen recording, full quality.

**When WaitingRoom.gov appears:** intentionally ugly gov fonts (Arial / Verdana / Times) — visual contrast with the clean iOS opener.

---

## Full script (~2:15)

**Rule:** Show, don't explain. One line per beat. Let the screen do the talking.

### ACT 0 — Hook (0:00–0:15) · Remotion iOS bubbles

**On screen:** iMessage-style chat.

**Mom bubble (Mom voice — ElevenLabs):**

> Hey… can you help me? I need to upgrade my insurance on that portal. I don't know what to do 😔

**Your bubble (typing… then):**

> Give me a minute.

---

### ACT 1a — No screen recording, no screenshots, no hour-long call (0:15–0:21) · Remotion icon row

**On screen:** the 3-icon row described above, each one popping in and getting struck through in turn.

**Voiceover (Your voice, one beat per icon — fast, no pauses):**

> No screen recording. No screenshots. No hour-long call.

Cuts immediately into Act 1b — no gap, no silence.

---

### ACT 1b — Pivot into real footage (0:21–0:40)

**Voiceover (Your voice):**

> This is where ShowOnce will be useful.

**Transition:** hard cut from the icon row straight into **real screen recording** — no motion-graphic pivot card. The left rail fades in over the footage.

**On screen (real footage, not staged):** you, live, setting up — signing in / claiming your ShowOnce username. This is genuinely the first real action, not a mocked B-roll clip.

**Voiceover (Your voice, naming the rail one step at a time as it fades in, one beat per word):**

> Record it. Hand it off. Her agent runs it. If it needs me — it asks me.

Each phrase lands as its rail icon appears (dimmed outline, nothing highlighted yet — this is a preview, not the walkthrough). Then settle: cut to the real Dashboard for Act 2.

---

### ACT 2 — Screen: Record + Handoff (0:35–1:10)

**Left rail:** Step 1 highlighted → ✓, Step 2 highlighted → ✓ by the end. Steps 3–4 dimmed.

**Voiceover (Your voice, one line):**

> I do the renewal myself, for her — on WaitingRoom.gov, a portal built to look like the ones people actually struggle with.

**Show (right side):** Dashboard → New ShowOnce → start recording → complete the renewal on WaitingRoom.gov, filling it out exactly the way Mom needs it.

**Voiceover (Your voice, one line):**

> ShowOnce saves **what to do** — not a video of me doing it.

**Show (right side):** stop recording → create handoff → copy link.

**Voiceover (Your voice, one line):**

> Then I send her the link.

**Cutaway (brief, full screen):** back to the iMessage thread — you paste the link into the chat with Mom.

---

### ACT 3 — Mom's side (1:10–1:20) · Remotion iOS bubbles

**On screen:** Mom opens the link in ChatGPT, pastes it into the chat.

**Mom bubble (Mom voice):**

> Do as Samuel said.

**On screen:** nothing else typed. That's the whole prompt.

---

### ACT 4 — Screen: Agent runs → hits a snag (1:20–1:45)

**Left rail:** Steps 1–2 ✓, Step 3 ("Agent") highlighted/running.

**Voiceover (Your voice, one line):**

> Her agent picks up where I left off — same tools, live on the page.

**Show (right side):** ChatGPT in-app browser on the recipient link → agent calls WebMCP tools → portal updates live (plan, preferences).

**Beat:** the agent hits a mismatch — Mom's region changed, so the plan I recorded isn't available; prices are different.

**Rail changes:** Step 3 icon pulses **amber** (paused, waiting on you) — hold this a beat.

**Voiceover (Your voice, one line):**

> It doesn't guess. It has one tool for exactly this — and it asks me, not her.

---

### ACT 5 — Your side: the ask (1:45–1:58)

**Cutaway (brief):** your dashboard — the handoff now shows **"Needs input."**

**Voiceover (Your voice, one line):**

> I get a notification — not a phone call. I pick the closest plan for her new region and send it back.

**Show:** open the request → see the region-specific options → choose one → send.

---

### ACT 6 — Agent resumes + approval + close (1:58–2:15)

**Left rail:** Step 3 back to running → ✓. Step 4 ("Approve") highlighted.

**Voiceover (Your voice, one line):**

> The agent picks it up automatically and finishes. She just approves.

**Show (right side):** back in ChatGPT — agent applies the decision, finishes the remaining steps, opens the approval dialog → Mom approves → submitted.

**Left rail:** All four steps ✓.

**Close (Your voice + text):**

> **ShowOnce — record once, hand off safely. When the agent can't decide, it asks — and finishes on its own.**

**Small text:**

> WebMCP Challenge · showonce.vercel.app

---

## Timing cheat sheet

| Time | Segment | Medium |
|---|---|---|
| 0:00–0:15 | Mom iMessage hook | Remotion |
| 0:15–0:21 | "No screen recording. No screenshots. No hour-long call." icon row | Remotion |
| 0:21–0:40 | Pivot line → real footage → rail naming | Screen recording + Remotion overlay |
| 0:40–1:15 | Screen: record procedure + create handoff | Screen recording |
| 1:15–1:25 | Mom pastes link — "Do as Samuel said" | Remotion iMessage |
| 1:25–1:50 | Screen: agent runs → hits region/plan mismatch → escalates | Screen recording |
| 1:50–2:03 | Your side: notification → pick plan → send | Screen recording |
| 2:03–2:20 | Agent auto-resumes → approval → close | Screen recording |

**One line per beat. Silence is fine. Don't over-narrate. The amber-pulse-on-Agent beat is the moment judges should remember — protect it, don't rush it.**

---

## Screen recording checklist

Record these as separate takes, then cut in CapCut:

- [ ] Sign in / claim ShowOnce username (real footage for the Act 1 naming beat)
- [ ] Dashboard → New ShowOnce → start recording
- [ ] Complete the renewal on WaitingRoom.gov exactly as Mom needs it
- [ ] Stop recording → create handoff for "Mom" → copy link
- [ ] Paste the link into the iMessage thread (or screenshot for the Remotion cut)
- [ ] Open link in **ChatGPT in-app browser** as Mom (required for judges)
- [ ] Prompt: *"Do as Samuel said."* — nothing more
- [ ] Agent runs tools — portal updates live — until it hits the region/plan mismatch
- [ ] Agent calls `showonce_request_helper` — capture this tool call if the ChatGPT UI shows it
- [ ] Your dashboard shows the handoff status as **"Needs input"**
- [ ] Open the request → pick the region-appropriate plan → send the decision
- [ ] Back in ChatGPT: agent calls `showonce_get_helper_decision` and auto-resumes
- [ ] Approval dialog opens (`showonce_request_human_approval`) → Mom approves → submitted

**Live URL for submission:** deploy production handoff link judges can open, ideally pre-seeded into the "unavailable region" scenario so the mismatch is reproducible.

---

## Remotion scene list

| Scene | Duration | Content |
|---|---|---|
| `01-imessage-hook` | 15s | Chat bubbles animate in; Mom message → your reply |
| `02-pain-points` | 6s | Icon row: screen recording, screenshots, 1+ hour call — each struck through in beat with the VO |
| `03-rail-overlay` | overlay, ~20s | Left rail UI composited over real screen recording for Act 1b's naming beat and held through Acts 2–6 |
| `04-imessage-link` | 10s | Mom pastes the link, sends "Do as Samuel said" |

Export each scene as H.264 `.mp4`, 1920×1080 or 1080×1920 depending on final format.

---

## Voice roles

Two voices. Generated in ElevenLabs, then laid over the video in CapCut.

| Voice | Who | When | Lines |
|---|---|---|---|
| **Mom voice** | ElevenLabs — warm, older, slightly unsure | Act 0 and Act 3 (iMessage bubbles) | "Hey… can you help me? I need to upgrade my insurance on that portal. I don't know what to do 😔" / "Do as Samuel said." |
| **Your voice** | ElevenLabs — calm, confident, younger | All VO from Act 1 through close | Everything else |

**Why two voices:** The Mom voice makes the hook personal in 5 seconds, and makes "Do as Samuel said" land as something *she* actually said, not a caption. Your voice carries the rest — it's your product, your story.

**ElevenLabs tips:**
- Generate Mom's two lines as separate clips — natural pause, slightly hesitant
- Generate your lines as separate clips per beat — easier to sync in CapCut
- Keep your voice consistent across all clips (same voice preset)
- Export as `.mp3` or `.wav` — import to CapCut as audio tracks

---

## Voiceover rules

- **One line per beat.** If you can't say it in one breath, cut it.
- **Show, don't explain.** The screen proves it.
- Say "WebMCP" once. Say the escalation tool's purpose once ("it has one tool for exactly this"). Move on.
- Silence between beats is fine — judges don't need constant audio.
- Keep total under 3 minutes.
- Public YouTube (unlisted OK if form accepts it).

---

## Devpost description (paste-ready)

> **Why WebMCP:** WaitingRoom.gov registers WebMCP tools on the page so agents act structurally — not by parsing legacy HTML.
>
> **Why ShowOnce:** An expert records a portable procedure once, creates a handoff link, and a recipient's agent executes within that scope. `showonce_compare_to_handoff` verifies progress against the recording. When the agent hits something it can't safely decide on its own — like a plan that isn't offered in the recipient's region — it doesn't guess. It calls `showonce_request_helper`, a purpose-built scoped tool, which notifies the original expert asynchronously. The expert answers the one specific question, the agent calls `showonce_get_helper_decision` and resumes automatically, and `showonce_request_human_approval` gates the final submission.
>
> **What was hard before:** Remote help meant screen shares, screenshot ping-pong, and phone calls on portals built for neither agents nor remote assistance — and any automation that tried to skip the human would silently guess wrong when the real world didn't match the recording.
>
> **What's possible now:** Record once → send a link → agent + WebMCP run the live page → when it hits a real mismatch, it asks one scoped question instead of guessing → resumes on its own → human approves the final step. WaitingRoom.gov is a reference implementation styled after real legacy portals — the handoff and escalation layer generalizes to any WebMCP-enabled site.

---

## Submission checklist

- [ ] Working live URL (ChatGPT in-app browser or Chrome with WebMCP enabled)
- [ ] Text description (above)
- [ ] **<3 min YouTube video with audio**
- [ ] Public GitHub repo with open-source license
- [ ] Visible `registerTool` / WebMCP code in repository

---

## Key lines — use verbatim

| Moment | Line |
|---|---|
| Hook (Mom) | "Hey… can you help me? I need to upgrade my insurance on that portal. I don't know what to do." |
| No old ways | "No screen recording. No screenshots. No hour-long call." |
| Pivot | "This is where ShowOnce will be useful." |
| Naming beat | "Record it. Hand it off. Her agent runs it. If it needs me — it asks me." |
| Recording | "ShowOnce saves what to do — not a video of me doing it." |
| Mom's prompt | "Do as Samuel said." |
| Escalation | "It doesn't guess. It has one tool for exactly this — and it asks me, not her." |
| Notification | "I get a notification — not a phone call." |
| Resume | "The agent picks it up automatically and finishes. She just approves." |
| Close | "ShowOnce — record once, hand off safely. When the agent can't decide, it asks — and finishes on its own." |
