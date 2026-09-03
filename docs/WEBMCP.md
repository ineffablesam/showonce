# WebMCP implementation

## What WebMCP does here

ShowOnce exposes structured, task-level tools to the external agent running in a WebMCP-capable browser. The site owns state, commands, policies, handoffs, adaptation, confirmation, and auditability. It does not include a custom agent.

## Registration

Tools register client-side through the current imperative API:

```ts
document.modelContext.registerTool(definition, { signal })
```

The application feature-detects `document.modelContext`. Registrations use route-scoped AbortControllers; aborting is the supported unregistration lifecycle. Read-only definitions include `readOnlyHint`. Handoff-originated content includes `untrustedContentHint` where supported.

## Tools

- `showonce_get_handoff`
- `benefits_get_account_state`
- `benefits_get_current_plan`
- `benefits_get_available_plans`
- `showonce_compare_to_handoff`
- `benefits_apply_safe_preferences`
- `benefits_preview_renewal`
- `showonce_request_helper`
- `showonce_get_helper_decision`
- `benefits_submit_renewal`

Tools are intentionally task-level rather than a large set of tiny UI operations.

## Testing in Chrome

1. Use a Chrome build that supports WebMCP and enable `chrome://flags/#enable-webmcp-testing` if required.
2. Serve ShowOnce from HTTPS or localhost in an origin-isolated top-level document.
3. Open a recipient handoff.
4. Confirm the status reads **WebMCP ready** and the inspector reads **WEBMCP LIVE**.
5. Use Chrome’s Model Context Tool Inspector extension or a WebMCP-capable in-app browser.
6. Ask: “Do what Samuel showed me.”
7. Verify that tool calls appear in ShowOnce’s live inspector and visible account state changes.
8. Attempt submission before confirmation and verify the structured `requires_user_confirmation` result.
9. Confirm in Mom’s UI and submit again within 120 seconds.

Confirmation is not a WebMCP tool. The registered submit tool has no token
input and never returns a confirmation token. Human confirmation calls a
TanStack server function, and the route keeps the returned 120-second token
only in memory. A successful WebMCP command is followed by the site’s internal
atomic completion call, which also requires the recipient’s HttpOnly
capability cookie. That database transaction consumes the confirmation, marks
the handoff completed, and writes the successful submission activity event
together. Activity events cannot substitute for this confirmation.

If the API is unavailable, ShowOnce says **WebMCP unavailable**. Its optional preview is labeled **DEMO PREVIEW** and is not presented as a WebMCP invocation.
