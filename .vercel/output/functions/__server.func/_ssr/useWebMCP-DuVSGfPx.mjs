import { i as __toESM } from "../_runtime.mjs";
import { i as require_jsx_runtime, r as require_react } from "../_libs/@tanstack/react-form+[...].mjs";
import { t as Icon } from "./Icon-BxtODSXJ.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as assertHandoffPolicyAllows } from "./Card-NQF5GieP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/useWebMCP-DuVSGfPx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function getWebMCPPresentation(state) {
	switch (state.status) {
		case "available": return {
			label: "WebMCP ready",
			shortLabel: "Available",
			detail: `${state.registeredToolNames.length} real browser tools are registered for this page.`
		};
		case "registering": return {
			label: "WebMCP registering",
			shortLabel: "Registering",
			detail: "Checking whether this browser exposes document.modelContext."
		};
		case "error": return {
			label: "WebMCP error",
			shortLabel: "Error",
			detail: `WebMCP registration failed: ${state.error?.message ?? "Unknown error"}`
		};
		case "unavailable": return {
			label: "WebMCP unavailable",
			shortLabel: "Unavailable",
			detail: "WebMCP is not available in this browser. ShowOnce still works normally; no tools are simulated."
		};
	}
}
function WebMCPStatus({ state }) {
	const presentation = getWebMCPPresentation(state);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		"aria-label": presentation.detail,
		className: `webmcp-status webmcp-status--${state.status}`,
		role: "status",
		title: presentation.detail,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "status-dot" }), presentation.label]
	});
}
function TopBar({ onCreate, onOpenNavigation, webmcp, createButtonRef, navigationOpen, navigationButtonRef }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "topbar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-controls": "workspace-navigation",
				"aria-expanded": navigationOpen,
				"aria-label": "Open navigation",
				className: "mobile-menu",
				onClick: onOpenNavigation,
				ref: navigationButtonRef,
				type: "button",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "menu" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebMCPStatus, { state: webmcp }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				className: "topbar__help",
				to: "/shared",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "help" }), "Guide"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "button button--primary",
				onClick: onCreate,
				ref: createButtonRef,
				type: "button",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "plus" }), "New ShowOnce"]
			})
		]
	});
}
function roundPercent(value) {
	return Math.round(value * 100) / 100;
}
function compareProcedureToRecipient(procedure, initial, recipient, options = {}) {
	const threshold = options.materialPriceThresholdPercent ?? 25;
	const matches = [];
	const safeActions = [];
	const skippedActions = [];
	const differences = [];
	let needsJudgment = false;
	for (const step of procedure.steps) {
		if (step.commandType === "set_preference") {
			const command = step.input;
			if (recipient.preferences[command.key] === command.value) {
				matches.push({
					kind: "preference_match",
					command,
					detail: `${command.key} already matches`
				});
				continue;
			}
			differences.push({
				kind: "preference_difference",
				detail: `${command.key} differs from the demonstrated preference`
			});
			safeActions.push(command);
			continue;
		}
		if (step.commandType === "review_recipient_details") {
			differences.push({
				kind: "recipient_address_preserved",
				detail: "Recipient address is current and was skipped"
			});
			differences.push({
				kind: "recipient_dependents_preserved",
				detail: "Recipient dependents were left alone"
			});
			skippedActions.push({
				command: step.input,
				reason: "recipient_details_preserved"
			});
			skippedActions.push({
				command: step.input,
				reason: "recipient_dependents_left_alone"
			});
			continue;
		}
		if (step.commandType === "preview_renewal") {
			skippedActions.push({
				command: step.input,
				reason: "recipient_state_checked"
			});
			continue;
		}
		if (step.commandType === "create_confirmation" || step.commandType === "submit_renewal") {
			if (step.commandType === "submit_renewal") differences.push({
				kind: "confirmation_required",
				detail: "Recipient must confirm before renewal submission"
			});
			skippedActions.push({
				command: step.input,
				reason: "requires_user_confirmation"
			});
			continue;
		}
		const demonstrated = step.input;
		const portable = {
			type: "select_plan",
			planId: demonstrated.planId
		};
		const recipientPlan = recipient.availablePlans.find(({ id }) => id === demonstrated.planId);
		if (!recipientPlan) {
			differences.push({
				kind: "plan_unavailable",
				planId: demonstrated.planId,
				detail: "The demonstrated plan is not available to this recipient"
			});
			skippedActions.push({
				command: portable,
				reason: "plan_unavailable"
			});
			needsJudgment = true;
			continue;
		}
		const initialPlan = initial.availablePlans.find(({ id }) => id === demonstrated.planId);
		const observedPrice = demonstrated.observedMonthlyPrice ?? initialPlan?.monthlyPrice;
		if (observedPrice === 0 && recipientPlan.monthlyPrice > 0) {
			differences.push({
				kind: "material_price_change",
				planId: demonstrated.planId,
				detail: `Plan price changed from zero to ${recipientPlan.monthlyPrice}`
			});
			skippedActions.push({
				command: portable,
				reason: "judgment_required"
			});
			needsJudgment = true;
			continue;
		}
		if (observedPrice !== void 0 && observedPrice > 0) {
			const percentChange = roundPercent((recipientPlan.monthlyPrice - observedPrice) / observedPrice * 100);
			if (Math.abs(percentChange) > threshold) {
				differences.push({
					kind: "material_price_change",
					planId: demonstrated.planId,
					percentChange,
					detail: `Plan price changed by ${percentChange}%`
				});
				skippedActions.push({
					command: portable,
					reason: "judgment_required"
				});
				needsJudgment = true;
				continue;
			}
		}
		if (recipient.selectedPlanId === demonstrated.planId) {
			matches.push({
				kind: "plan_match",
				command: portable,
				detail: `${demonstrated.planId} is already selected`
			});
			continue;
		}
		differences.push({
			kind: "plan_difference",
			planId: demonstrated.planId,
			detail: "The selected plan differs from the demonstrated plan"
		});
		safeActions.push(portable);
	}
	return {
		matches,
		safeActions,
		skippedActions,
		differences,
		needsJudgment,
		confirmationRequired: true
	};
}
var objectSchema = (properties = {}, required = []) => ({
	type: "object",
	additionalProperties: false,
	properties,
	...required.length > 0 ? { required } : {}
});
var SHOWONCE_TOOLS = [
	{
		name: "showonce_get_handoff",
		title: "Inspect a handoff",
		description: "Returns the active sanitized portable handoff.",
		inputSchema: objectSchema({ id: { type: "string" } }, ["id"]),
		annotations: {
			readOnlyHint: true,
			untrustedContentHint: true
		},
		scopes: ["library", "recipient"]
	},
	{
		name: "benefits_get_account_state",
		title: "Inspect recipient state",
		description: "Returns the current connected recipient account state.",
		inputSchema: objectSchema(),
		annotations: { readOnlyHint: true },
		scopes: ["recipient"]
	},
	{
		name: "benefits_get_current_plan",
		title: "Get current plan",
		description: "Returns the recipient current selected plan.",
		inputSchema: objectSchema(),
		annotations: { readOnlyHint: true },
		scopes: ["recipient"]
	},
	{
		name: "benefits_get_available_plans",
		title: "Get available plans",
		description: "Lists plans actually available to this recipient.",
		inputSchema: objectSchema(),
		annotations: { readOnlyHint: true },
		scopes: ["recipient"]
	},
	{
		name: "showonce_compare_to_handoff",
		title: "Compare to handoff",
		description: "Deterministically compares the handoff with current recipient state.",
		inputSchema: objectSchema(),
		annotations: {
			readOnlyHint: true,
			untrustedContentHint: true
		},
		scopes: ["recipient"]
	},
	{
		name: "benefits_apply_safe_preferences",
		title: "Apply safe preferences",
		description: "Applies only safe preferences from the active handoff.",
		inputSchema: objectSchema(),
		annotations: { readOnlyHint: false },
		scopes: ["recipient"]
	},
	{
		name: "benefits_preview_renewal",
		title: "Preview renewal",
		description: "Runs a non-submitting renewal preview against current state.",
		inputSchema: objectSchema(),
		annotations: { readOnlyHint: false },
		scopes: ["recipient"]
	},
	{
		name: "showonce_request_helper",
		title: "Request helper decision",
		description: "Creates a minimum-information helper request.",
		inputSchema: objectSchema(),
		annotations: { readOnlyHint: false },
		scopes: ["recipient"]
	},
	{
		name: "showonce_get_helper_decision",
		title: "Get helper decision",
		description: "Returns the exact recommendation for the active request.",
		inputSchema: objectSchema(),
		annotations: { readOnlyHint: true },
		scopes: ["recipient"]
	},
	{
		name: "benefits_submit_renewal",
		title: "Submit renewal",
		description: "Submits only after a fresh confirmation performed by the recipient UI.",
		inputSchema: objectSchema(),
		annotations: { readOnlyHint: false },
		scopes: ["recipient"]
	}
];
function abortError() {
	return new DOMException("The WebMCP invocation was aborted", "AbortError");
}
function assertNotAborted(signal) {
	if (signal.aborted) throw abortError();
}
function stringInput(input, key) {
	return typeof input[key] === "string" ? input[key] : null;
}
function defaultId() {
	return globalThis.crypto.randomUUID();
}
async function audit(context, toolName, outcome) {
	await context.repositories.activity.append({
		id: (context.createId ?? defaultId)(),
		kind: "webmcp_invocation",
		timestamp: (context.now ?? Date.now)(),
		source: "webmcp",
		toolName,
		outcome
	});
}
async function invoke(descriptor, context, input, signal) {
	let result;
	let outcome = descriptor.annotations?.readOnlyHint ? "read" : "applied";
	try {
		assertNotAborted(signal);
		await context.onToolStart?.(descriptor.name);
		assertNotAborted(signal);
		switch (descriptor.name) {
			case "showonce_get_handoff": {
				const id = stringInput(input, "id");
				result = context.getActiveHandoff?.() ?? (id ? await context.repositories.handoffs.get(id) : null);
				break;
			}
			case "benefits_get_account_state":
				result = context.getRecipientState();
				break;
			case "benefits_get_current_plan": {
				const state = context.getRecipientState();
				result = state.availablePlans.find(({ id }) => id === state.selectedPlanId) ?? null;
				break;
			}
			case "benefits_get_available_plans":
				result = context.getRecipientState().availablePlans;
				break;
			case "showonce_compare_to_handoff": {
				const handoff = context.getActiveHandoff?.();
				if (!handoff?.procedure) {
					outcome = "refused";
					result = {
						ok: false,
						reason: "handoff_not_found"
					};
					break;
				}
				const recipient = context.getRecipientState();
				result = context.compare(handoff.procedure, context.getInitialState?.() ?? recipient, recipient);
				break;
			}
			case "benefits_apply_safe_preferences": {
				const handoff = context.getActiveHandoff?.();
				if (!handoff?.procedure) {
					outcome = "refused";
					result = {
						ok: false,
						reason: "handoff_not_found"
					};
					break;
				}
				try {
					assertHandoffPolicyAllows(handoff.policy ?? {
						allowSafePreferences: false,
						requireConfirmation: true,
						allowHelperEscalation: false
					}, "apply_safe_preferences");
				} catch {
					outcome = "refused";
					result = {
						ok: false,
						reason: "handoff_policy_denied"
					};
					break;
				}
				const adaptation = context.compare(handoff.procedure, context.getInitialState?.() ?? context.getRecipientState(), context.getRecipientState());
				const results = [];
				for (const command of adaptation.safeActions.filter((candidate) => candidate.type === "set_preference")) results.push(context.execute(command));
				result = {
					ok: results.every((item) => item.ok),
					results
				};
				outcome = results.every((item) => item.ok) ? "applied" : "refused";
				break;
			}
			case "benefits_preview_renewal": {
				const commandResult = context.execute({ type: "preview_renewal" });
				result = commandResult;
				outcome = commandResult.ok ? "applied" : "refused";
				break;
			}
			case "showonce_request_helper":
				if (!context.requestHelper) {
					outcome = "refused";
					result = {
						ok: false,
						reason: "helper_not_available"
					};
					break;
				}
				try {
					assertHandoffPolicyAllows(context.getActiveHandoff?.()?.policy ?? {
						allowSafePreferences: false,
						requireConfirmation: true,
						allowHelperEscalation: false
					}, "request_helper");
				} catch {
					outcome = "refused";
					result = {
						ok: false,
						reason: "handoff_policy_denied"
					};
					break;
				}
				result = await context.requestHelper();
				break;
			case "showonce_get_helper_decision": {
				const requestId = context.getActiveHelpRequestId?.();
				result = requestId ? await context.repositories.decisions.pollByRequestToken(requestId) : null;
				break;
			}
			case "benefits_submit_renewal": {
				const confirmation = context.getConfirmation?.();
				if (!confirmation) {
					outcome = "refused";
					result = {
						ok: false,
						reason: "requires_user_confirmation"
					};
					break;
				}
				const commandResult = context.execute({
					type: "submit_renewal",
					confirmationToken: confirmation.token
				});
				if (commandResult.ok) {
					if (!context.completeHandoff) throw new Error("Atomic handoff completion is unavailable");
					await context.completeHandoff(confirmation.token);
				}
				result = commandResult;
				outcome = commandResult.ok ? "applied" : "refused";
				break;
			}
		}
		assertNotAborted(signal);
	} catch (error) {
		outcome = signal.aborted || error instanceof DOMException && error.name === "AbortError" ? "aborted" : "error";
		await audit(context, descriptor.name, outcome);
		throw error;
	}
	if (descriptor.name !== "benefits_submit_renewal" || outcome !== "applied") await audit(context, descriptor.name, outcome);
	context.onToolResult?.(descriptor.name, result);
	return result;
}
function supportsScope(scopes, scope) {
	return scopes.includes(scope);
}
function activeDocument(supplied) {
	if (supplied) return supplied;
	return typeof document === "undefined" ? void 0 : document;
}
async function registerWebMCPTools(context, options = {}) {
	const modelContext = activeDocument(context.document)?.modelContext;
	if (!modelContext) return {
		available: false,
		registeredToolNames: [],
		dispose() {}
	};
	if (options.signal?.aborted) return {
		available: true,
		registeredToolNames: [],
		dispose() {}
	};
	const lifecycle = new AbortController();
	const abortLifecycle = () => lifecycle.abort(options.signal?.reason);
	options.signal?.addEventListener("abort", abortLifecycle, { once: true });
	const registeredToolNames = [];
	try {
		for (const descriptor of SHOWONCE_TOOLS.filter(({ scopes }) => supportsScope(scopes, context.scope))) {
			const tool = {
				name: descriptor.name,
				title: descriptor.title,
				description: descriptor.description,
				inputSchema: descriptor.inputSchema,
				annotations: descriptor.annotations,
				execute: (input, invocationOptions) => invoke(descriptor, context, input, invocationOptions.signal)
			};
			await modelContext.registerTool(tool, { signal: lifecycle.signal });
			registeredToolNames.push(descriptor.name);
		}
	} catch (error) {
		lifecycle.abort();
		options.signal?.removeEventListener("abort", abortLifecycle);
		throw error;
	}
	return {
		available: true,
		registeredToolNames,
		dispose: () => {
			options.signal?.removeEventListener("abort", abortLifecycle);
			lifecycle.abort();
		}
	};
}
function useWebMCP(scope, context, enabled = true) {
	const { document: contextDocument, repositories, execute, compare, getRecipientState, getInitialState, now, createId, getActiveHandoff, getConfirmation, completeHandoff, requestHelper, getActiveHelpRequestId, onToolStart, onToolResult } = context;
	const [state, setState] = (0, import_react.useState)({
		status: "registering",
		registeredToolNames: []
	});
	(0, import_react.useEffect)(() => {
		if (!enabled) {
			setState({
				status: "unavailable",
				registeredToolNames: []
			});
			return;
		}
		const controller = new AbortController();
		let cancelled = false;
		let dispose;
		setState({
			status: "registering",
			registeredToolNames: []
		});
		registerWebMCPTools({
			document: contextDocument,
			scope,
			repositories,
			execute,
			compare,
			getRecipientState,
			getInitialState,
			now,
			createId,
			getActiveHandoff,
			getConfirmation,
			completeHandoff,
			requestHelper,
			getActiveHelpRequestId,
			onToolStart,
			onToolResult
		}, { signal: controller.signal }).then((registration) => {
			dispose = registration.dispose;
			if (cancelled) {
				registration.dispose();
				return;
			}
			setState({
				status: registration.available ? "available" : "unavailable",
				registeredToolNames: registration.registeredToolNames
			});
		}).catch((error) => {
			if (!cancelled) setState({
				status: "error",
				registeredToolNames: [],
				error: error instanceof Error ? error : new Error(String(error))
			});
		});
		return () => {
			cancelled = true;
			controller.abort();
			dispose?.();
		};
	}, [
		contextDocument,
		repositories,
		execute,
		compare,
		getRecipientState,
		getInitialState,
		now,
		createId,
		getActiveHandoff,
		getConfirmation,
		completeHandoff,
		requestHelper,
		getActiveHelpRequestId,
		onToolStart,
		onToolResult,
		scope,
		enabled
	]);
	return state;
}
//#endregion
export { getWebMCPPresentation as a, compareProcedureToRecipient as i, TopBar as n, useWebMCP as o, WebMCPStatus as r, SHOWONCE_TOOLS as t };
