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
- `benefits_set_renewal_period`
- `benefits_set_paperless`
- `benefits_preview_renewal`
- `showonce_request_helper`
- `showonce_get_helper_decision`
- `benefits_prepare_renewal`

Tools are intentionally task-level rather than a large set of tiny UI operations. `benefits_prepare_renewal` is the last tool in the list an agent can ever call for a given renewal: it validates that a plan is selected, runs a non-submitting preview, and returns a summary with `awaitingHumanApproval: true`. There is no `benefits_submit_renewal` tool and no other tool that submits — submission is not reachable through WebMCP at all.

## Testing in Chrome

1. Use a Chrome build that supports WebMCP and enable `chrome://flags/#enable-webmcp-testing` if required.
2. Serve ShowOnce from HTTPS or localhost in an origin-isolated top-level document.
3. Open a recipient handoff.
4. Confirm the status reads **WebMCP ready** and the inspector reads **WEBMCP LIVE**.
5. Use Chrome's Model Context Tool Inspector extension or a WebMCP-capable in-app browser.
6. Ask: "Do what Samuel showed me."
7. Verify that tool calls appear in ShowOnce's live inspector and visible account state changes.
8. Let the agent continue through comparison, safe preferences, and preview, ending with a call to `benefits_prepare_renewal`. Verify the tool result reports `awaitingHumanApproval: true` and that the recipient UI now shows the "Awaiting human approval" screen with the full summary and any material differences. This is the end of the agent's turn — there is nothing further for it to call.
9. As the human recipient, check the personal attestation checkbox and click **Confirm & submit** once. Verify the handoff completes immediately, with no further agent turn and no separate WebMCP call involved in either the attestation or the submission.

No WebMCP tool can create, accept, or satisfy the human attestation. `recipient_attestation` is a semantic command type that `executeCommand()` refuses whenever its source is `'webmcp'` — it is only ever recorded when the source is `'human'`. The recipient UI's single **Confirm & submit** button executes the attestation event and `submit_renewal` together, atomically, using a fresh confirmation token minted at that exact moment. There is no earlier "create confirmation" step for the recipient to race against, and no window of time to beat: the token is created and consumed in the same client-side call that records the attestation.

If the API is unavailable, ShowOnce says **WebMCP unavailable**. Its optional preview is labeled **DEMO PREVIEW** and is not presented as a WebMCP invocation.
