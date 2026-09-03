import { i as __toESM } from "../_runtime.mjs";
import { i as require_jsx_runtime, r as require_react } from "../_libs/@tanstack/react-form+[...].mjs";
import { t as Icon } from "./Icon-BxtODSXJ.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as updateRecipientWorkflow, a as assertHandoffPolicyAllows, d as createRecipientWorkflow, f as executeCommand, l as createHelpRequest, m as repositories, n as EmptyState, o as completeRecipientSubmission, r as applyRecipientCommand, s as createDemoAccount, t as Card, u as createRecipientAccount } from "./Card-NQF5GieP.mjs";
import { i as compareProcedureToRecipient, o as useWebMCP, r as WebMCPStatus } from "./useWebMCP-DuVSGfPx.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as Route$1 } from "./router-D2nkK8AS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/s._publicToken-NFlulA65.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function words(value) {
	return value.replaceAll("_", " ");
}
function actionDetail(command) {
	if (command.type === "set_preference") return `${words(command.key)} will be set to ${String(command.value)}`;
	if (command.type === "select_plan") return `${command.planId} is available to select`;
	return `${words(command.type)} is safe to apply`;
}
function AdaptationPanel({ result, scenario, onChoose, onAsk, recipient }) {
	const unavailable = result.differences.some((difference) => difference.kind === "plan_unavailable");
	const planDifference = result.differences.find((difference) => difference.kind === "material_price_change" || difference.kind === "plan_unavailable" || difference.kind === "plan_difference");
	const priceDifference = result.differences.find((difference) => difference.kind === "material_price_change");
	const planName = recipient.availablePlans.find((plan) => plan.id === planDifference?.planId)?.name ?? planDifference?.planId ?? "Demonstrated plan";
	const recipientPlan = recipient.availablePlans.find((plan) => plan.id === planDifference?.planId);
	const factRows = [
		...result.matches.map((match) => ({
			key: `match-${match.kind}-${match.detail}`,
			icon: "check",
			label: match.kind === "plan_match" ? "Plan matched" : "Already matched",
			detail: match.detail
		})),
		...result.safeActions.map((command, index) => ({
			key: `safe-${command.type}-${index}`,
			icon: "check",
			label: "Safe to carry",
			detail: actionDetail(command)
		})),
		...result.skippedActions.map(({ reason }, index) => ({
			key: `skipped-${reason}-${index}`,
			icon: reason.includes("recipient") ? "home" : "help",
			label: reason === "recipient_details_preserved" ? "Address kept private" : reason === "recipient_dependents_left_alone" ? "Dependents left alone" : "Held back safely",
			detail: reason === "recipient_details_preserved" ? "Current recipient address retained" : reason === "recipient_dependents_left_alone" ? `${recipient.dependents.length} recipient records unchanged` : words(reason)
		})),
		...result.differences.map((difference, index) => ({
			key: `difference-${difference.kind}-${index}`,
			icon: difference.kind === "recipient_address_preserved" ? "home" : "help",
			label: difference.kind === "recipient_address_preserved" ? "Address difference" : difference.kind === "recipient_dependents_preserved" ? "Dependents difference" : words(difference.kind),
			detail: difference.percentChange === void 0 ? difference.detail : `${difference.detail} (${difference.percentChange}%)`
		}))
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "adaptation-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "adaptation-summary",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "adaptation-summary__icon",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "spark" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "Adapted for you"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Your details stayed yours." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"ShowOnce found ",
						result.matches.length,
						" existing matches and",
						" ",
						result.safeActions.length,
						" safe actions. Recipient-specific details remain under your control."
					] })
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "adaptation-facts",
				children: factRows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: row.icon }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: row.label }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: row.detail })
				] }, row.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "decision-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: unavailable ? "Plan unavailable" : "Material price difference"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: unavailable ? `${planName} is not offered for this account.` : `${planName} costs $${recipientPlan?.monthlyPrice ?? "—"}/month here.` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: unavailable ? "ShowOnce will not choose a substitute automatically." : `${priceDifference?.detail ?? "The demonstrated plan differs here."} This needs an explicit decision.` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "decision-card__actions",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--primary",
							onClick: onChoose,
							type: "button",
							children: unavailable ? "I'll choose" : `Choose ${planName}${recipientPlan ? ` at $${recipientPlan.monthlyPrice}` : ""}`
						}), scenario === "unavailable" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--ghost",
							onClick: onAsk,
							type: "button",
							children: "Ask Samuel"
						}) : null]
					})
				]
			})
		]
	});
}
function ConfirmationGate({ planName, monthlyPrice, submitting, onConfirm, onSubmit, confirmation, now }) {
	const [confirmed, setConfirmed] = (0, import_react.useState)(false);
	const [, setClockTick] = (0, import_react.useState)(0);
	const status = confirmationStatus(confirmation, now ?? Date.now());
	(0, import_react.useEffect)(() => {
		if (now !== void 0 || !confirmation) return;
		const delay = Math.max(0, confirmation.expiresAt - Date.now() + 10);
		const timeout = window.setTimeout(() => setClockTick((value) => value + 1), delay);
		return () => window.clearTimeout(timeout);
	}, [confirmation, now]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "confirmation-gate",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "confirmation-gate__icon",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "check" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Final confirmation"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Ready to submit Mom’s renewal" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
				planName,
				" at $",
				monthlyPrice,
				"/month · annual renewal · paperless. Human approval is separate from submission and remains valid for 120 seconds."
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				checked: confirmed,
				onChange: (event) => setConfirmed(event.target.checked),
				type: "checkbox"
			}), "I’m Mom and I approve this renewal."] }),
			status === "fresh" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				children: "Confirmed by Mom. WebMCP may now submit."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--primary",
				disabled: submitting,
				onClick: () => void onSubmit(),
				type: "button",
				children: "Submit renewal"
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [status === "expired" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				children: "Confirmation expired. Mom must approve again."
			}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--primary",
				disabled: !confirmed || submitting,
				onClick: () => void onConfirm(),
				type: "button",
				children: "Confirm for 120 seconds"
			})] })
		] })]
	});
}
function confirmationStatus(confirmation, now) {
	if (!confirmation) return "missing";
	return confirmation.expiresAt > now ? "fresh" : "expired";
}
function RecipientRoute() {
	const { publicToken } = Route$1.useParams();
	const { preview, scenario } = Route$1.useSearch();
	const queryClient = useQueryClient();
	const [confirmation, setConfirmation] = (0, import_react.useState)();
	const [choosing, setChoosing] = (0, import_react.useState)(false);
	const [submissionError, setSubmissionError] = (0, import_react.useState)();
	const clearConfirmation = (0, import_react.useCallback)(() => setConfirmation(void 0), []);
	const accountId = scenario === "normal" ? "mom-normal" : "mom-unavailable";
	const handoff = useQuery({
		queryKey: [
			"public-handoff",
			publicToken,
			preview
		],
		queryFn: async () => {
			const available = await repositories.handoffs.getByPublicToken(publicToken);
			if (!available) return null;
			if (preview) return available;
			return repositories.handoffs.markOpened(publicToken);
		}
	});
	const account = useQuery({
		queryKey: ["account", accountId],
		queryFn: async () => await repositories.accounts.get(accountId) ?? createRecipientAccount(scenario)
	});
	const workflow = useQuery({
		queryKey: [
			"recipient-run",
			publicToken,
			scenario,
			preview
		],
		queryFn: () => preview ? Promise.resolve({
			id: `preview-${publicToken}`,
			handoffId: publicToken,
			scenario,
			accountId,
			phase: "explain",
			createdAt: Date.now(),
			updatedAt: Date.now()
		}) : createRecipientWorkflow(repositories, publicToken, scenario, accountId)
	});
	const helperToken = workflow.data?.helperRequestId;
	const decision = useQuery({
		queryKey: ["helper-decision", helperToken],
		queryFn: () => helperToken ? repositories.decisions.pollByRequestToken(helperToken) : Promise.resolve(null),
		enabled: Boolean(helperToken),
		refetchInterval: 2500
	});
	const setAccount = (0, import_react.useCallback)((next) => {
		queryClient.setQueryData(["account", accountId], next);
		repositories.accounts.save(next);
	}, [accountId, queryClient]);
	const setRun = (0, import_react.useCallback)((update) => {
		const key = [
			"recipient-run",
			publicToken,
			scenario,
			preview
		];
		const current = queryClient.getQueryData(key);
		if (!current) return;
		const next = {
			...current,
			...update,
			updatedAt: Date.now()
		};
		queryClient.setQueryData(key, next);
		repositories.runs.save(next);
	}, [
		preview,
		publicToken,
		queryClient,
		scenario
	]);
	const askHelper = (0, import_react.useCallback)(async () => {
		if (preview) throw new Error("Preview mode is read-only");
		if (!workflow.data) throw new Error("Workflow unavailable");
		if (!handoff.data?.policy) throw new Error("Handoff policy unavailable");
		assertHandoffPolicyAllows(handoff.data.policy, "request_helper");
		const existing = workflow.data.helperRequestId ? await repositories.helpRequests.getByPublicToken(workflow.data.helperRequestId) : null;
		const request = existing ? {
			id: existing.publicToken,
			publicToken: existing.publicToken,
			handoffId: publicToken,
			createdAt: Date.now(),
			updatedAt: Date.now(),
			expiresAt: existing.expiresAt,
			status: existing.status,
			detail: existing.detail,
			options: existing.options
		} : await createHelpRequest(repositories, publicToken);
		const next = await updateRecipientWorkflow(repositories, workflow.data, {
			phase: "awaiting_helper",
			helperRequestId: request.publicToken
		});
		queryClient.setQueryData([
			"recipient-run",
			publicToken,
			scenario,
			preview
		], next);
		await repositories.handoffs.transitionByPublicToken(publicToken, "needs_input");
		return request;
	}, [
		handoff.data?.policy,
		preview,
		publicToken,
		queryClient,
		scenario,
		workflow.data
	]);
	const webmcp = useRecipientWebMCP({
		publicToken,
		handoff: handoff.data ?? null,
		account: account.data ?? null,
		run: workflow.data ?? null,
		confirmation,
		preview,
		onAccount: setAccount,
		onRun: setRun,
		onRequestHelper: askHelper,
		onConfirmationExpired: clearConfirmation,
		onSubmissionError: setSubmissionError
	});
	const procedure = handoff.data?.procedure;
	const adaptation = procedure && account.data ? compareProcedureToRecipient(procedure, createDemoAccount(), account.data) : null;
	const phase = workflow.data?.phase ?? "explain";
	const adapt = async () => {
		if (preview) return;
		if (!adaptation || !account.data || !workflow.data) return;
		await repositories.handoffs.transitionByPublicToken(publicToken, "running");
		let current = account.data;
		const safeCommands = handoff.data?.policy.allowSafePreferences ? adaptation.safeActions.filter((candidate) => candidate.type === "set_preference") : [];
		for (const command of safeCommands) current = (await applyRecipientCommand(repositories, current, command, {
			handoffToken: publicToken,
			policy: handoff.data?.policy
		})).state;
		setAccount(current);
		if (adaptation.needsJudgment) await repositories.handoffs.transitionByPublicToken(publicToken, "needs_input");
		const next = await updateRecipientWorkflow(repositories, workflow.data, {
			phase: "adapted",
			lastOutcome: "safe_preferences_applied"
		});
		queryClient.setQueryData([
			"recipient-run",
			publicToken,
			scenario,
			preview
		], next);
	};
	const choosePlan = async (planId, source = "human") => {
		if (preview) return;
		if (!account.data || !workflow.data) return;
		const result = await applyRecipientCommand(repositories, account.data, {
			type: "select_plan",
			planId
		}, {
			handoffToken: publicToken,
			policy: handoff.data?.policy
		});
		if (!result.ok) return;
		setAccount(result.state);
		setChoosing(false);
		setRun({
			phase: "confirmation",
			selectedPlanId: planId,
			lastOutcome: source
		});
	};
	const confirm = async () => {
		if (preview) return;
		if (!account.data) return;
		const result = await repositories.handoffs.createConfirmation(publicToken);
		setConfirmation(result);
		setSubmissionError(void 0);
		await repositories.handoffs.transitionByPublicToken(publicToken, "waiting_confirmation");
		setRun({
			phase: "confirmed",
			lastOutcome: "human_confirmation"
		});
	};
	const submit = async () => {
		if (preview) return;
		if (!account.data || !workflow.data || !confirmation || account.data.submittedAt !== null) return;
		const result = await completeRecipientSubmission(repositories, account.data, workflow.data, confirmation, {
			handoffToken: publicToken,
			source: "human"
		});
		if (result.ok) {
			queryClient.setQueryData(["account", accountId], result.account);
			queryClient.setQueryData([
				"recipient-run",
				publicToken,
				scenario,
				preview
			], result.run);
			setSubmissionError(void 0);
		} else {
			queryClient.setQueryData([
				"recipient-run",
				publicToken,
				scenario,
				preview
			], result.run);
			if (result.reason === "confirmation_expired") setConfirmation(void 0);
			setSubmissionError(result.reason === "confirmation_expired" ? "Confirmation expired. Confirm again to retry." : "Completion failed. Your renewal was not submitted; please retry.");
		}
	};
	const continueFromDecision = async () => {
		if (preview) return;
		if (decision.data?.outcome === "recommend_plan" && decision.data.recommendedPlanId) await choosePlan(decision.data.recommendedPlanId, "helper");
		else if (decision.data?.outcome === "let_recipient_decide") {
			setChoosing(true);
			setRun({
				phase: "adapted",
				lastOutcome: "human_choice_requested"
			});
		}
	};
	if (handoff.isPending || account.isPending || workflow.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-label": "Loading recipient handoff",
		className: "page-loading"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "recipient-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "recipient-header",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					className: "brand",
					to: "/",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "brand__mark",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "spark" })
					}), " ShowOnce"]
				}),
				preview ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pill",
					children: "DEMO PREVIEW"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebMCPStatus, { state: webmcp })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "recipient-main",
			children: [submissionError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				children: submissionError
			}) }) : null, !handoff.data || !procedure || !account.data || !adaptation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				detail: "Ask the sender for a current recipient link.",
				title: "This handoff is unavailable"
			}) }) : phase === "explain" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "recipient-intro",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "Shared by Samuel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: handoff.data.title }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This link carries sanitized intent, never sender browser state." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "button button--primary button--large",
						onClick: () => void adapt(),
						disabled: preview,
						type: "button",
						children: ["Adapt this ShowOnce for Mom ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
					})
				]
			}) : phase === "adapted" || phase === "awaiting_helper" || phase === "helper_resolved" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdaptationPanel, {
					onAsk: () => void askHelper(),
					onChoose: () => {
						if (scenario === "normal") choosePlan("gold");
						else setChoosing(true);
					},
					recipient: account.data,
					result: adaptation,
					scenario
				}),
				choosing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "plan-choices",
					children: account.data.availablePlans.map((plan) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => void choosePlan(plan.id),
						type: "button",
						children: [
							plan.name,
							" · $",
							plan.monthlyPrice,
							"/month"
						]
					}, plan.id))
				}) : null,
				helperToken ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "helper-request-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: decision.data ? "Decision received" : "Waiting for helper" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							params: { publicToken: helperToken },
							to: "/help/$publicToken",
							children: "Open minimum-information request"
						}),
						decision.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "button button--primary",
							onClick: () => void continueFromDecision(),
							type: "button",
							children: "Continue"
						}) : null
					]
				}) : null
			] }) : phase === "confirmation" || phase === "confirmed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmationGate, {
				confirmation,
				monthlyPrice: account.data.availablePlans.find((plan) => plan.id === account.data.selectedPlanId)?.monthlyPrice ?? 0,
				onConfirm: confirm,
				onSubmit: submit,
				planName: account.data.availablePlans.find((plan) => plan.id === account.data.selectedPlanId)?.name ?? "Selected plan",
				submitting: false
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "completion-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "completion-card__mark",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "check" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "Done"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Mom’s plan is renewed." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Mom’s benefits are submitted. The handoff completed with recipient confirmation." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "adaptation-facts",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Original actions" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: procedure.steps.length })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Reused" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: adaptation.matches.length })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Adapted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: adaptation.safeActions.length })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Skipped" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: adaptation.skippedActions.length })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Decision count" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: adaptation.needsJudgment ? 1 : 0 })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Credentials shared" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0" })] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "decision-card__actions",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							className: "button button--primary",
							to: "/activity",
							children: "View activity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							className: "button button--ghost",
							to: "/app",
							children: "Back to dashboard"
						})]
					})
				]
			})]
		})]
	});
}
function useRecipientWebMCP({ publicToken, handoff, account, run, confirmation, preview, onAccount, onRun, onRequestHelper, onConfirmationExpired, onSubmissionError }) {
	const accountRef = (0, import_react.useRef)(account);
	const handoffRef = (0, import_react.useRef)(handoff);
	const runRef = (0, import_react.useRef)(run);
	const confirmationRef = (0, import_react.useRef)(confirmation);
	const startedRef = (0, import_react.useRef)(false);
	const statusTransitionRef = (0, import_react.useRef)(Promise.resolve());
	accountRef.current = account;
	handoffRef.current = handoff;
	runRef.current = run;
	confirmationRef.current = confirmation;
	const markRunning = (0, import_react.useCallback)(async () => {
		if (startedRef.current) {
			await statusTransitionRef.current;
			return;
		}
		startedRef.current = true;
		statusTransitionRef.current = repositories.handoffs.transitionByPublicToken(publicToken, "running").then(() => void 0);
		await statusTransitionRef.current;
	}, [publicToken]);
	const execute = (0, import_react.useCallback)((command) => {
		const current = accountRef.current;
		if (!current) throw new Error("Recipient state is still loading");
		if (!startedRef.current) markRunning();
		const result = executeCommand({
			state: current,
			source: "webmcp",
			now: Date.now(),
			createId: () => crypto.randomUUID(),
			confirmation: confirmationRef.current
		}, command);
		if (command.type !== "submit_renewal") {
			accountRef.current = result.state;
			onAccount(result.state);
			repositories.activity.appendForHandoffToken(publicToken, {
				id: `activity-${result.event.id}`,
				kind: "command",
				timestamp: result.event.timestamp,
				source: "webmcp",
				commandType: result.event.commandType,
				policy: result.event.policy,
				outcome: result.ok ? "applied" : "refused"
			});
		} else if (!result.ok) {
			if (result.reason === "confirmation_expired") onConfirmationExpired();
			onSubmissionError(result.reason === "confirmation_expired" ? "Confirmation expired. Confirm again to retry." : "Submission was refused. Review the selected plan and confirm again.");
		}
		if (result.reason === "judgment_required") statusTransitionRef.current = statusTransitionRef.current.then(() => repositories.handoffs.transitionByPublicToken(publicToken, "needs_input").then(() => void 0));
		return result;
	}, [
		markRunning,
		onAccount,
		onConfirmationExpired,
		onSubmissionError,
		publicToken
	]);
	const activeHandoff = handoff;
	const context = (0, import_react.useMemo)(() => ({
		document: preview || typeof document === "undefined" ? void 0 : document,
		repositories: {
			...repositories,
			activity: { append: (event) => repositories.activity.appendForHandoffToken(publicToken, event) }
		},
		execute,
		compare: compareProcedureToRecipient,
		getRecipientState: () => {
			if (!accountRef.current) throw new Error("Recipient account unavailable");
			return accountRef.current;
		},
		getInitialState: createDemoAccount,
		getActiveHandoff: () => activeHandoff,
		getConfirmation: () => confirmationRef.current,
		completeHandoff: async (confirmationToken) => {
			const currentAccount = accountRef.current;
			const currentRun = runRef.current;
			const currentConfirmation = confirmationRef.current;
			if (!currentAccount || !currentRun || !currentConfirmation || currentConfirmation.token !== confirmationToken) throw new Error("Confirmation context is unavailable");
			const completed = await completeRecipientSubmission(repositories, currentAccount, currentRun, currentConfirmation, { handoffToken: publicToken });
			if (!completed.ok) {
				if (completed.reason === "confirmation_expired") onConfirmationExpired();
				onSubmissionError(completed.reason === "confirmation_expired" ? "Confirmation expired. Confirm again to retry." : "Completion failed. Your renewal was not submitted; please retry.");
				throw new Error(completed.reason);
			}
			accountRef.current = completed.account;
			runRef.current = completed.run;
			onAccount(completed.account);
			onRun({
				phase: "complete",
				lastOutcome: "submitted"
			});
			onSubmissionError(void 0);
		},
		requestHelper: onRequestHelper,
		getActiveHelpRequestId: () => runRef.current?.helperRequestId,
		onToolStart: markRunning,
		onToolResult: (name, result) => {
			if (name === "showonce_compare_to_handoff") {
				onRun({ phase: "adapted" });
				if (typeof result === "object" && result !== null && "needsJudgment" in result && result.needsJudgment === true) statusTransitionRef.current = statusTransitionRef.current.then(() => repositories.handoffs.transitionByPublicToken(publicToken, "needs_input").then(() => void 0));
			}
		},
		now: Date.now,
		createId: () => crypto.randomUUID()
	}), [
		activeHandoff,
		execute,
		markRunning,
		onRequestHelper,
		onRun,
		onConfirmationExpired,
		onSubmissionError,
		preview,
		publicToken
	]);
	return useWebMCP("recipient", context, !preview);
}
//#endregion
export { RecipientRoute as component };
