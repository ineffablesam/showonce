# ShowOnce

**Show once. Their agent takes it from there.**

ShowOnce turns a successful web task into an adaptive handoff another person's agent can carry out through WebMCP — using their account, their state, and their own final approval.

## The problem

Remote web help still relies on screenshots, phone calls, screen sharing, remote control software, or handing over a password. Every one of these either demands both people's time at once, exposes too much access, or silently assumes the second person's account and UI state match the first person's. None of them let a second person's own agent finish a task the way the first person actually did it.

## The product

A sender completes a task normally inside a fully interactive connected demo application, Northstar Benefits (an employee benefits portal). ShowOnce captures semantic actions through the same typed command layer the application's own UI uses — there is no manual step-picking. It compiles those captured actions into a portable procedure that separates what's reusable, what's recipient-specific state, what needs a safety check, what needs human judgment, and what is consequential enough to require explicit human approval.

The recipient opens the handoff in their own account, in the same live app. They can act on it directly, or ask a WebMCP-capable agent to read the task, inspect their current state, apply safe preferences, skip steps that no longer apply, and stop the moment a meaningful difference needs a person's judgment.

## Why this is a strong WebMCP use case

This problem needs more than reliable clicking against a fixed page. The recipient is a different person with different account state: a different plan, different dependents, a different address, different pricing. WebMCP gives the recipient's agent structured, typed tools for reading that state and applying task-level changes — without ever copying selectors, coordinates, browser sessions, or credentials from the sender. Because every tool call runs through the same domain command layer the human UI uses, the agent's actions are indistinguishable from a careful human's actions from the application's point of view, and they show up live in the same visible UI the recipient is looking at.

## How it improves UX

The sender demonstrates instead of writing a support ticket or a screenshot-laden email. The recipient never has to hand over their password or their screen, and keeps full control of their own account throughout. ShowOnce, not the agent, decides what's safe: the recipient's current address is left alone, their existing dependents are left alone, a material price change is surfaced explicitly, an unavailable plan triggers a request for a human decision instead of a guess, and final submission always stops at a single, clearly labeled human approval step before anything consequential happens. The recipient sees exactly what changed and why before they ever have to act.

## What people and agents can do together that was previously difficult

Previously, getting help on a task either meant a human walking another human through it in real time, or a human handing over enough access that "helping" became "doing it for them" with no boundary. ShowOnce lets the sender's demonstrated intent travel to a completely different account and a completely different agent, get automatically re-checked against that account's real state, and get carried out through the exact same commands a person would use — while the one truly consequential step (submitting) is structurally reserved for a human. The agent does the routine, reversible, inspectable work; the recipient makes the one identity-bearing decision that matters, in one click, with a full summary in front of them.

## How WebMCP was implemented

ShowOnce registers route-scoped, imperative tools on `document.modelContext` from the client (`document.modelContext.registerTool(...)`, see `src/webmcp/registerTools.ts`). Each tool has a strict JSON Schema, `readOnlyHint`/`untrustedContentHint` annotations, and is registered with an `AbortController` signal so it unregisters cleanly when the recipient route unmounts. Both the human UI and every WebMCP tool call the same `executeCommand()` domain function — there is exactly one implementation of "select a plan" or "set paperless," not a UI code path and a separate agent code path — so visible application state and the semantic audit trail always agree.

The last tool an agent can call is `benefits_prepare_renewal`, which validates a plan is selected, runs a non-submitting preview, and returns a summary with `awaitingHumanApproval: true`. That is the end of the line for any agent. The UI then shows an "Awaiting human approval" screen with the full summary, any material differences from what was demonstrated, and a personal attestation checkbox ("I am {recipient} and I approve this renewal."). A single human click on "Confirm & submit" — enabled only once that box is checked — atomically records a HUMAN-only `recipient_attestation` semantic event and executes `submit_renewal` through the exact same `executeCommand()` layer, completing the handoff immediately. `executeCommand()` refuses `recipient_attestation` outright if the source is `'webmcp'`, so no tool, prompt, or agent can ever create, accept, or satisfy that event. There is no second agent turn and no round trip back through a chat session: the recipient's one click both attests and submits.

## Potential impact

The pattern generalizes to family assistance, customer support, employee onboarding, IT help, education, and administrative workflows — anywhere someone can demonstrate a task competently but should never receive access to the recipient's account to finish it for them.

## Novelty versus screen recording and browser automation

ShowOnce does not record a screen or replay UI gestures. It records semantic outcomes and transfer policy, then adapts them to another person's actual state. Traditional browser automation asks, "how do I repeat these exact clicks?" ShowOnce asks, "what part of this still applies here, what must be checked, and where must a person decide?"

## Scope

The hackathon build includes one fully interactive connected application, Northstar Benefits, to demonstrate the complete integration end to end. ShowOnce does not claim arbitrary third-party site support; any application that adopts it needs to expose suitable WebMCP tools and semantic commands of its own.
