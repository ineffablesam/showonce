# Judging checklist

## WebMCP leverage

- Real client-side `document.modelContext.registerTool(...)` registrations
- Focused semantic tools with strict JSON Schemas
- Read versus write annotations
- Untrusted handoff-content annotation
- Route-specific AbortController lifecycle
- Real account state reads and writes
- Shared command path for humans and tools
- Explicit recipient confirmation
- Live invocation inspector

## Execution

- Product-first dashboard and navigation
- Semantic recording, not screen recording
- Generated procedure and transfer rules
- Handoff creation and recipient view
- Normal adaptation and plan-divergence paths
- Helper decision and synchronized resume
- Confirmation gate and completion summary
- Resettable Nexa Benefits demo

## Potential impact

ShowOnce helps people complete remote web tasks without giving another person control of their account. It applies to family assistance, support, onboarding, education, IT, and administrative operations where recipient state matters.

## Creativity and ambition

Most automation replays one user’s interaction against the same or similar UI. ShowOnce hands the task to a different user’s agent, then adapts against that recipient’s current state while preserving judgment and control.

## Internal release check

- Typecheck passes
- Vitest suite passes
- Production build passes
- No unavailable WebMCP state is labeled live
- No sensitive or recipient-specific values appear in handoff serialization
- Both critical demo paths can be reset and repeated
