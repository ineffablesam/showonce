# ShowOnce

**Show once. Their agent takes it from there.**

ShowOnce turns a successful web task into an adaptive handoff another person’s agent can carry out through WebMCP—using their account, their state, and their confirmation.

## The problem

Remote web help still relies on screenshots, calls, screen sharing, remote control, or brittle recordings. These options either demand both people’s time, expose too much access, or assume the second account and UI state match the first.

## The product

A helper completes a task normally in a WebMCP-enabled application. ShowOnce captures semantic actions through the same typed command layer used by the application’s UI. It compiles those successful actions into a procedure that separates reusable choices from recipient-specific state, safety checks, judgment points, and consequential actions.

The recipient opens the handoff in their own account. Their external WebMCP-capable agent reads the task, inspects current state, applies safe preferences, skips steps that no longer apply, and stops when a meaningful difference needs a person.

## Why this is a strong WebMCP use case

This problem needs more than reliable clicking. The recipient is a different person with different account state. WebMCP gives their agent structured tools for reading that state and applying task-level changes without copying selectors, coordinates, sessions, or credentials.

## How it improves UX

The helper demonstrates instead of writing instructions. The recipient keeps control of their own account. Current addresses are skipped, dependents stay untouched, material price changes are surfaced, unavailable plans trigger a decision, and final submission waits for explicit confirmation.

## What humans and agents can do together

Humans provide intent, demonstrate a successful path, make substitutions, and approve consequential actions. Agents inspect structured state, compare it with the handoff, execute safe preferences, and maintain an audit trail. ShowOnce brings a helper back only where judgment is actually needed.

## How WebMCP was implemented

ShowOnce registers route-specific imperative tools on `document.modelContext` in the client. Tools use strict JSON Schemas, read/write annotations, untrusted-content hints, and AbortController lifecycle cleanup. Both UI and tool calls use `executeCommand()`, so visible application state and semantic audit events share one source of truth. The WebMCP inspector shows real registered tools and real invocation activity.

## Potential impact

The pattern can support family assistance, customer support, employee onboarding, IT help, education, and administrative workflows. It is especially useful when someone can demonstrate a task but should not receive access to the recipient’s account.

## Novelty versus screen recording and browser automation

ShowOnce does not record a screen or replay UI gestures. It records semantic outcomes and transfer policies, then adapts them to another person. Traditional browser automation asks, “How do I repeat these clicks?” ShowOnce asks, “What part of this task still applies here, what must be checked, and where must a person decide?”

## Scope

The hackathon build includes one fictional connected application, Nexa Benefits, to demonstrate the complete integration. ShowOnce does not claim arbitrary third-party site support; applications need to expose suitable WebMCP tools and semantic commands.
