# Architecture

## Shared execution path

ShowOnce and Nexa Benefits use one semantic command layer:

```text
Human UI ─┐
          ├─ executeCommand() ─ state mutation ─ SemanticEvent
WebMCP  ──┘
```

Commands are strongly typed. Events contain semantic input plus sanitized before/after state; they never contain DOM implementation details.

## Domain modules

- `commands`: account reads and mutations, source attribution, event creation, confirmation.
- `policies`: portable, recipient-specific, state-check, human-judgment, confirmation-required, and never-transfer classifications.
- `procedures`: compiles recorded events into reusable steps and safe handoff payloads.
- `adaptation`: deterministic comparison between a demonstrated task and recipient state.
- `repositories`: interfaces for procedures, handoffs, activity, and helper decisions.
- `security`: recursive sensitive-field sanitization.

## Application modules

TanStack Start provides SSR-capable application structure and file routing. Product pages read repository data with TanStack Query. TanStack Form handles structured creation and decision input. TanStack Table renders dense libraries and system logs.

## Persistence

Supabase stores procedures, handoffs, helper requests, helper decisions, and
shared activity. Recordings, demo accounts, recipient runs, and UI state remain
local. UI modules import repository interfaces, never Supabase.

Typed, per-operation TanStack Start server functions read `SUPABASE_URL` and
`SUPABASE_ANON_KEY` inside request handlers. There is no generic RPC dispatcher.
Sender operations receive their private workspace capability from a Secure,
HttpOnly, SameSite=Lax browser-session cookie inside the server function.
Owner capability values never enter client code. Recipient and helper
operations carry their resource-specific 24-character public capability.
Opening a recipient handoff additionally binds it to a server-owned recipient
capability stored only in a Secure, HttpOnly, SameSite=Lax cookie. Public reads
do not create or bind this capability.
SQL tables deny anonymous access and expose validated `SECURITY DEFINER` RPCs,
including per-owner storage quotas.

Public URLs are `/s/$publicToken` and `/help/$publicToken`. They contain no
database IDs or serialized payloads. A public handoff read has no side effect;
the live recipient route explicitly and idempotently marks it opened. Sender
scenario links use a read-only `preview=true` mode that does not bind a
recipient, persist workflow changes, enable mutations, or register WebMCP.
The displayed recipient URL omits that flag. Helper
decisions are detected with reliable 2.5-second polling by request token.

Consequential completion uses a dedicated confirmation table and two narrow
RPCs. UI confirmation creates a 120-second, single-use opaque token tied to the
handoff and bound recipient hash. Atomic completion validates and consumes that
token while moving the handoff to `completed` and writing the successful
`submit_renewal` activity event in the same transaction; the generic transition
RPC and public activity stream cannot authorize completion. Submission is first
validated without persisting `submittedAt`; account and completed-run state are
saved only after atomic completion returns successfully. Transient failures
remain retryable, while expired/rejected confirmation returns to reconfirmation.

Runtime shared resources are Supabase-only. Missing Supabase configuration
produces a clear persistence error in every environment. The in-memory adapter
exists only as an isolated test implementation; it is not selected by the
runtime application.

## WebMCP

Tool registration happens only in the browser. Route scope determines which tools are relevant. Each registration receives an AbortSignal and disappears when its scope unmounts. Tool handlers call domain commands and append visible invocation events. No registered tool creates, accepts, or returns a confirmation token. After a human UI confirmation, the site retains the token in route memory and uses internal context to atomically complete a successful submit.

## State adaptation

Adaptation is deterministic and does not require an LLM. A plan is reused only if available. Current addresses are skipped. Dependents are left alone. Material price differences use a configurable threshold. Missing demonstrated plans require human judgment. Helper alternatives use the actual Silver and Platinum plan IDs. Submission requires a selected available plan and a short-lived server-issued confirmation token.
