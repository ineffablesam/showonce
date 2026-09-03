# Cross-Device Supabase and Vercel Implementation Plan

**Goal:** Make public ShowOnce handoff and helper links work across unrelated browsers through Supabase, then deploy the existing TanStack Start app to Vercel through Nitro.

> Historical implementation plan: the later security review replaced the
> development runtime fallback with Supabase-only shared persistence and moved
> the owner workspace capability into a Secure HttpOnly session cookie.

## Storage boundary

- Supabase stores procedures, handoffs, helper requests, helper decisions, and shared activity.
- Browser storage remains limited to recordings in progress, demo accounts/scenarios, local UI preferences, and local recipient workflow presentation state.
- UI components consume repository interfaces. Supabase calls run behind TanStack Start server functions so the requested unprefixed environment variables are never bundled into browser code.
- When Supabase variables are absent, runtime shared persistence fails clearly. The in-memory adapter is limited to isolated automated tests.

## Public capabilities

- Handoffs and helper requests have separate cryptographically random public tokens generated with Web Crypto.
- Public records include expiration timestamps and the minimum fields required by their route.
- Public route reads use token-specific repository methods; internal IDs never appear in public URLs.
- Handoff status transitions are validated: `created → opened → running → needs_input|waiting_confirmation → completed`, with expiration checked on every public read/write.
- Helper polling runs every few seconds. Supabase Realtime may be added only if it remains deterministic without requiring browser-side database credentials.

## Database

SQL migration creates `procedures`, `handoffs`, `helper_requests`, `helper_decisions`, and `shared_activity_events`. Public-token columns are unique and indexed. JSON payload columns contain already-sanitized typed values. Row-level security denies direct anonymous table access because all reads and writes flow through guarded server functions.

## Deployment

- Install current `nitro` and register `nitro()` beside `tanstackStart()` and React in Vite.
- Add `.env.example`, preserve `.env.local` ignore rules, and document environment setup.
- Add `/dashboard` and `/demo` application routes required for direct production navigation.
- Let Vercel auto-detect TanStack Start/Nitro; do not define a static output directory or convert frameworks.

## Verification

1. Unit-test token entropy/format, sanitizer boundaries, status transitions, expiration, repository selection, and public DTO validation.
2. Integration-test two independent repository clients sharing only a fake Supabase transport: create handoff, load by token, create helper request, decide, poll, and continue.
3. Run full Vitest, strict typecheck, ESLint, and production build.
4. Deploy only after real Supabase variables and schema exist.
5. Verify direct route refreshes and repeat the Browser A/Browser B acceptance flow against production.
