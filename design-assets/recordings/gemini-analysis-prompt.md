# Gemini video analysis prompt — ShowOnce demo recording

Paste this into Gemini (Advanced/Pro, video understanding) along with `for-gemini.mp4`.

---

You are a video editor's assistant. Analyze this screen recording frame-by-frame
at high temporal resolution (aim for ~0.25s precision on cut points). The video
shows a split demo: a person ("Samuel") recording himself completing a task on
a government-style benefits portal, then his mom ("Mom") pasting a link into
ChatGPT which uses WebMCP tools to finish the task on her behalf, with a
back-and-forth approval at the end.

Return your analysis as **strict JSON** matching this schema exactly (no
markdown, no commentary outside the JSON):

```json
{
  "videoDurationSeconds": 0,
  "resolution": "1920x1080",
  "segments": [
    {
      "startSeconds": 0.0,
      "endSeconds": 0.0,
      "label": "short human-readable label for this beat",
      "speaker": "samuel | mom | none",
      "screenContent": "what is literally visible on screen: app name, URL bar text, which UI panel is focused, any modal/dialog title",
      "onScreenText": "any literal text/labels/buttons visible worth quoting",
      "action": "what is happening: typing, clicking, scrolling, waiting, a tool call firing, a page transition, a modal opening/closing",
      "cameraNote": "does this moment deserve a zoom-in, a highlight ring/box around a specific UI element, or a slow-motion beat? if yes, describe the exact screen region (approx x/y as % of frame) and why",
      "insertOpportunity": "none | ios_message_bubble | link_copied_toast | phone_notification | lower_third | zoom_highlight",
      "insertDetail": "if insertOpportunity is not none, what should the overlay say/show and roughly how many seconds should it stay on screen"
    }
  ],
  "keyMoments": {
    "momTextsForHelp": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "samuelStartsRecordingOnPortal": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "samuelFinishesAndCreatesHandoffLink": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "linkCopiedOrShared": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "momPastesLinkIntoChatGPT": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "momTypesDoAsSamuelSaid": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "agentBeginsToolCalls": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "priceMismatchDetected": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "agentAsksShouldIAskSamuel": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "samuelGetsNotification": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "samuelPicksPlanAndResponds": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "agentResumesAfterDecision": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "approvalModalOpens": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "momConfirmsAndSubmits": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" },
    "successScreen": { "startSeconds": 0.0, "endSeconds": 0.0, "note": "" }
  },
  "screenRegions": {
    "note": "for any moment where two panels are visible side by side (e.g. Samuel's control window + the WaitingRoom.gov site, or a left rail/sidebar + main content), estimate the pixel-region bounding boxes as percentages of the 1920x1080 frame for: leftRailPercent (x,y,w,h), mainContentPercent (x,y,w,h). If this changes over time, list each distinct layout as its own entry with the startSeconds/endSeconds it applies to."
  },
  "textLegibilityWarnings": [
    "list any moments where on-screen text is too small/blurry to read at normal viewing size — these are candidates for a zoom-in insert"
  ]
}
```

Rules:
- Be exhaustive on `segments` — err on the side of more, shorter segments over
  fewer long ones. Every distinct screen state or action change should be its
  own segment.
- Timestamps must be in seconds with one decimal place, measured from the
  start of the file (0.0 = first frame).
- Only mark `insertOpportunity` when it's a genuinely good moment (don't
  overload every segment) — the total should be roughly 10–16 insert
  opportunities across the whole video.
- For `phone_notification`, only flag moments where Samuel would plausibly
  see a push notification about the price mismatch/decision request.
- For `link_copied_toast`, only flag the moment(s) where a link is
  visibly copied or pasted.
- For `lower_third`, flag moments where identifying who's on screen
  (Samuel vs. Mom vs. ChatGPT vs. WaitingRoom.gov) would help a first-time
  viewer, especially right after a hard cut or panel switch.
