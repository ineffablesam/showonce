# ShowOnce Product Design

## Product

ShowOnce is a task-handoff platform for the WebMCP web. A demonstrator performs a task through the same typed command layer exposed to WebMCP, then ShowOnce compiles the resulting semantic events into a portable procedure. A recipient opens that handoff in their own account, where an external WebMCP-capable agent can inspect current state, compare it deterministically with the procedure, apply safe preferences, request human judgment, and submit only after explicit confirmation.

The product does not transfer credentials, sessions, selectors, coordinates, screenshots, or recipient-specific values. The Nexa Benefits portal is an embedded fictional connected application used to prove the end-to-end model.

## Architecture

The application uses TanStack Start, Router, Query, Form, and Table with React, strict TypeScript, Tailwind CSS, Vite, webmcp-types, and Vitest. Route components compose focused product components; domain behavior remains framework-independent and testable.

The dependency flow is:

1. UI actions and WebMCP tools call `executeCommand`.
2. Commands read or mutate a demo account and emit sanitized `SemanticEvent` records.
3. Recording completion compiles events and transfer policies into a `Procedure`.
4. Repository interfaces persist shared procedures, handoffs, activity, and decisions through typed capability-guarded Supabase adapters; local storage is limited to recordings and demo/UI state.
5. `compareProcedureToRecipient` deterministically produces matches, safe actions, skipped actions, differences, judgment gates, and confirmation gates.
6. Route-scoped WebMCP registration feature-detects `document.modelContext`, registers real tools on the client, logs real invocations, and unregisters with lifecycle cleanup.

## Product surfaces

- `/`: short public landing page.
- `/app`: dashboard with reusable work, attention items, activity, and WebMCP state.
- `/recordings/$id`: recorder, procedure detail, tabs, and handoff creation.
- `/handoffs` and `/handoffs/$id`: table library and detailed audit trail.
- `/shared`, `/needs-input`, `/activity`, `/webmcp`: recipient library, decisions, audit log, and live tool inspector.
- `/s/$handoffId`: recipient explanation, deterministic adaptation, decision path, confirmation gate, and completion.
- `/help/$requestId`: minimum-information helper decision.
- `/demo/benefits/*`: Nexa Benefits account and renewal workflow.

## Domain boundaries

- `domain/commands`: command names, inputs, results, account state, executor, and event creation.
- `domain/policies`: transfer classification for each command and sensitive-field rules.
- `domain/procedures`: semantic-event compilation and portable handoff serialization.
- `domain/adaptation`: deterministic state comparison and the 25% material-price rule.
- `domain/repositories`: storage interfaces, typed Supabase adapters, and an in-memory test adapter; runtime shared resources are Supabase-only and UI components import neither Supabase nor storage primitives.
- `domain/activity`: activity models and formatting.
- `webmcp`: typed tool definitions, client lifecycle, invocation logging, and route scope.

## Safety

Sensitive keys are recursively removed before event or handoff serialization. Recipient-specific address and dependent values are never carried over. Plan reuse requires availability checks. Plan substitution always requires judgment. Submission requires a recipient-created token that expires after 120 seconds. Untrusted handoff content is marked through WebMCP annotations where supported.

If WebMCP is unavailable, the product says so and offers a clearly labeled `DEMO PREVIEW`; it does not simulate or mislabel WebMCP calls.

## Visual system

The interface uses warm neutral backgrounds, near-black typography, one restrained green accent, compact information density, subtle one-pixel borders, small radii, and restrained motion. The app shell prioritizes desktop productivity while collapsing cleanly for mobile.

## Verification

Vitest covers command execution, event capture, procedure compilation, sanitization, recipient-specific transfer rules, adaptation branches, safe writes, confirmation timing, repositories, and mocked WebMCP registration. Completion requires fresh successful runs of typecheck, the full test suite, and the production build.
