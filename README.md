# ShowOnce

**Show it once. Hand off the outcome.**

> Built for the [WebMCP Challenge](https://webmcp.devpost.com/).

## The problem

Remote web help today relies on screenshots, phone calls, screen sharing, remote control software, or handing over a password. Screenshots lose context. Screen sharing and remote control require both people to be free at the same time and give one person full access to the other's session. Credential sharing gives up account security entirely. None of these let a second person's own agent pick up where the first person left off, on the second person's own account.

## What ShowOnce does

A sender demonstrates a real task once, live, inside a fully interactive connected demo application called **Northstar Benefits** (an employee benefits portal). ShowOnce does not screen-record or ask the sender to pick steps manually: because the demo app's UI and ShowOnce both call the same shared domain command layer, every meaningful action the sender takes (selecting a plan, changing a preference, confirming an address) is automatically captured as a semantic event. Those events are compiled into a portable, sanitized procedure — intent only, no selectors, credentials, sessions, or screenshots.

A recipient opens the resulting handoff link. They can act on it directly in the same live app, rendered against their own account state, or they can ask a WebMCP-capable agent (for example, ChatGPT's in-app browser, or Chrome with WebMCP enabled) to "do what [the sender] showed me." When an agent is used, it invokes real `document.modelContext` tools registered by ShowOnce — the exact same commands the human UI uses — so the visible, live Northstar Benefits app updates in front of the recipient as the agent works. Nothing is simulated or faked. ShowOnce compares the demonstrated procedure against the recipient's actual state and decides, deterministically, what still applies, what can be safely applied, what differs materially, and what must be left for a human to decide.

For any consequential, identity-bearing action — actually submitting the renewal — an agent can get the recipient all the way to a final reviewable summary, but no further. A human must check a personal attestation checkbox and click "Confirm & submit" themselves. That single click is the only human step, and no WebMCP tool can ever perform it.

## How WebMCP is used

- Real `document.modelContext.registerTool(...)` registrations, made client-side once the recipient route mounts (see `src/webmcp/registerTools.ts`).
- Strict JSON Schemas for every tool's input, with no free-form or untyped arguments.
- `readOnlyHint` and `untrustedContentHint` annotations so a calling agent knows which tools only read state and which tools are handling handoff-authored content.
- `AbortController`-based lifecycle: tools are registered with a scoped signal and unregister themselves cleanly when the recipient route unmounts.
- A single shared `executeCommand()` domain layer used by both the human UI and every WebMCP tool, so there is exactly one implementation of the business logic behind "select a plan" or "set paperless" — not a UI code path and a separate agent code path.
- A human-only, atomic final step: WebMCP tools can read state, apply safe preferences, and prepare a renewal summary, but the `recipient_attestation` semantic event that authorizes submission can only ever be issued by a human clicking a button in the browser — `executeCommand()` refuses it outright if the source is `'webmcp'`.

See [`docs/WEBMCP.md`](docs/WEBMCP.md) for the full tool list and registration details, and [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for how the command layer, adaptation engine, and confirmation flow fit together.

## Quick start

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3000`.

Other useful scripts:

```bash
npm run build       # production build
npm run test        # run the Vitest suite once
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
```

## Environment variables

ShowOnce needs a Supabase project for cross-device sharing (handoffs, activity, and helper decisions are readable from a different browser than the one that created them). Copy `.env.example` to `.env.local` and fill in:

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

These are read only inside TanStack Start server functions; the anonymous key is never exposed to arbitrary client code, and every table denies direct anonymous access in favor of validated `SECURITY DEFINER` RPCs (see `supabase/migrations/`). Without Supabase configured, persistence-backed routes fail with an explicit error rather than silently falling back to an in-memory store.

## Project structure

```text
src/domain/      Command layer, policies, procedure compilation, and recipient adaptation logic
src/webmcp/      WebMCP tool definitions and document.modelContext registration
src/routes/      TanStack Start file-based routes (sender workspace, recipient handoff, helper flow)
src/components/  UI components shared by the sender and recipient experiences
supabase/        SQL schema, RPCs, and migrations backing cross-device sharing
```

## Testing

```bash
npm run test       # Vitest
npm run typecheck
npm run lint
```

The suite covers semantic command execution, procedure compilation, sensitive-field sanitization, recipient-specific adaptation (address skipping, dependent preservation, material price differences, unavailable plans), the attestation-and-submit flow, repositories, and mocked WebMCP registration. See [`docs/TESTING.md`](docs/TESTING.md) for the manual critical-path checklist, including a real-browser WebMCP walkthrough.

## More documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — domain modules, persistence, and the shared execution path
- [`docs/WEBMCP.md`](docs/WEBMCP.md) — tool registration details and the current tool list
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — the demo walkthrough used for judging
- [`docs/JUDGING.md`](docs/JUDGING.md) — a checklist mapped to the WebMCP Challenge judging criteria

## License

MIT. See [`LICENSE`](LICENSE).
