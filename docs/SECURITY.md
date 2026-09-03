# Security and privacy

## Data boundaries

ShowOnce transfers a task, not an identity or browser session. Handoffs may contain a goal, reusable preferences, constraints, state checks, judgment points, and confirmation requirements.

Handoffs never contain passwords, passcodes, OTPs, SSNs, social-security fields, card numbers, CVVs, access or refresh tokens, session values, cookies, authorization headers, screenshots, selectors, element IDs, mouse paths, or coordinates.

## Sanitization

Semantic events and shared DTOs pass through exact runtime validators before a
server function executes. Inputs have bounded strings, bounded JSON size,
allowlisted keys and command shapes, and recursive rejection of password,
authorization, credential, session, payment, card, cookie, and secret fields.
The SQL RPCs repeat the capability, shape, size, and sensitive-key checks so a
caller cannot bypass them by invoking Supabase directly.

## Capability boundaries

Recipient links use exact 24-character base64url public tokens. Helper requests
receive a separate token. Public reads are side-effect-free; only the recipient
route calls the idempotent `mark_handoff_opened` operation. That operation also
binds the handoff to a separate 256-bit recipient capability held in a Secure,
HttpOnly, SameSite=Lax, Path=/ cookie. TanStack server functions create and read
that capability; it is never included in client JavaScript, URLs, DTOs, WebMCP
tool inputs/outputs, logs, or local storage. Generic public reads cannot bind a
recipient.

Sender-side scenario links add an explicit `preview=true` search mode. Preview
uses the side-effect-free public read, never calls `mark_handoff_opened`, does
not create recipient workflow state, disables recipient mutations, and does not
register WebMCP tools. The displayed/copyable recipient URL omits preview mode,
so opening it in the recipient browser performs the real capability binding.

Sender records use a separate `own_` capability with 32 random base64url
characters. TanStack Start creates and reads it only inside server functions as
a Secure, HttpOnly, SameSite=Lax session cookie. Browser JavaScript cannot read
it, and it is never returned in a response DTO, URL, log, local storage, or
client state. Its SHA-256 digest is stored with each Supabase row and guards
workspace list/get/create/update and owner activity operations.

Tables deny direct anonymous access. `SECURITY DEFINER` RPCs use an empty
`search_path`, fully-qualified relations, exact validation, and either an owner
capability or a resource-specific public capability.

## Recipient-specific state

Addresses, dependents, and current pricing are inspected in the recipient’s account but not copied from the demonstrator. A current recipient address causes the demonstrated update step to be skipped. Different dependent configurations are left unchanged.

## Judgment

Unavailable plans are not substituted automatically. The recipient can choose
or request a helper decision. The helper request exposes only the decision
reason and the Silver, Platinum, or recipient-decides options; it omits account,
address, dependent, price, and browser state.

## Confirmation

Renewal submission is consequential. The submit command refuses unless a valid
available plan is selected and the recipient explicitly confirms in the UI.
The confirmation RPC requires the bound recipient cookie and stores only hashes
of both the recipient capability and a fresh opaque confirmation token. Tokens
expire after 120 seconds and are consumed exactly once by the atomic completion
RPC. The same transaction marks the handoff completed and writes the applied
`submit_renewal` activity event, so an audit-write failure rolls the completion
and token consumption back. Public activity—including a forged
`create_confirmation` event—has no confirmation authority, and the generic
lifecycle RPC cannot mark a handoff completed.

The UI keeps the short-lived confirmation token only in React memory. WebMCP
receives no confirmation tool or token parameter; after UI confirmation, the
site uses its internal route context to submit and atomically complete.
Account `submittedAt` and the completed workflow phase are persisted only after
the atomic database completion succeeds. Network failure leaves the same
confirmation retryable; confirmation rejection or expiry clears it and returns
the UI to an explicit reconfirmation state.

Handoff policy is enforced in the UI/WebMCP layer and repeated by capability
RPCs. Safe preferences and helper escalation can be disabled independently.
`requireConfirmation` adds a handoff requirement; when it is false, the
platform minimum still requires fresh human confirmation for consequential
submission.

## Demo limitations

This public demo has no account authentication and the server uses only the
Supabase anonymous key. Strong bearer capabilities prevent enumeration and
cross-owner reads, and per-owner database quotas bound stored procedures,
handoffs, helper requests, and activity. They do not prevent unauthenticated
callers from creating many browser sessions or consuming service/network quota.
Production should add Vercel/Supabase rate limits or WAF rules, global abuse
monitoring, capability rotation/revocation, and tamper-evident audit retention.
Account authentication is optional product hardening, not a claim made by this
hackathon architecture.
