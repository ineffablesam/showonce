# Testing

## Automated checks

```bash
npm run typecheck
npm test -- --run
npm run build
```

The tests cover semantic command execution, event recording, procedure compilation, recursive sensitive-field sanitization, recipient-specific transfer boundaries, address skipping, dependent preservation, material price differences, unavailable plans, safe preferences, confirmation refusal/success/expiry, repositories, and mocked WebMCP registration.

## Manual critical path

1. Reset the demo and switch to Samuel.
2. Start a Nexa Benefits ShowOnce.
3. Complete the renewal and finish recording.
4. Inspect carry-over, adaptation, confirmation, and excluded data.
5. Create and open Mom’s handoff.
6. Verify the address is skipped and dependents remain unchanged.
7. Verify $88 versus $142 is flagged as material.
8. Apply annual renewal and paperless.
9. Call submit before confirmation; verify refusal.
10. Confirm and submit within 120 seconds; verify completion.
11. Reset to Plan unavailable.
12. Verify no plan is selected automatically.
13. Ask Samuel, resolve the helper decision, and continue.

## Real WebMCP

Run the manual path in a WebMCP-capable, secure browser context. Verify tool inventory with the browser inspector and `/webmcp`. Real calls must produce visible application updates and live invocation events.

## Unavailable browsers

In a browser without `document.modelContext`, verify the unavailable banner and status tooltip. A preview may exercise the deterministic domain flow, but every such surface must say **DEMO PREVIEW**.
