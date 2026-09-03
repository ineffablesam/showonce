import { i as __toESM } from "../_runtime.mjs";
import { i as require_jsx_runtime, r as require_react } from "../_libs/@tanstack/react-form+[...].mjs";
import { t as Icon } from "./Icon-BxtODSXJ.mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as resetDemo, i as applyRecordedCommand, m as repositories, n as EmptyState, p as finishRecording, t as Card } from "./Card-NQF5GieP.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as Route } from "./router-D2nkK8AS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/demo.benefits._section-DRflMoZ1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PersonaSwitcher({ persona, scenario, onPersonaChange, onScenarioChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "demo-switchers",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Viewing as" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
			"aria-label": "Persona",
			onChange: (event) => onPersonaChange(event.target.value),
			value: persona,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "samuel",
				children: "Samuel"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "mom",
				children: "Mom"
			})]
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Scenario" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
			"aria-label": "Scenario",
			onChange: (event) => onScenarioChange(event.target.value),
			value: scenario,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "normal",
				children: "Normal differences"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
				value: "unavailable",
				children: "Plan unavailable"
			})]
		})] })]
	});
}
var sections = [
	"overview",
	"coverage",
	"dependents",
	"address",
	"preferences",
	"renewal"
];
function BenefitsShell({ children, persona, scenario, onPersonaChange, onScenarioChange, onReset }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "benefits-app",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "benefits-header",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					className: "benefits-brand",
					to: "/app",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "N" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Nexa Benefits" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonaSwitcher, {
					onPersonaChange,
					onScenarioChange,
					persona,
					scenario
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "button button--ghost",
					onClick: onReset,
					type: "button",
					children: "Reset demo"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "benefits-layout",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Benefits",
				children: sections.map((section) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					activeProps: { className: "benefits-nav__active" },
					params: { section },
					search: { recording: void 0 },
					to: "/demo/benefits/$section",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: section === "overview" ? "grid" : section === "renewal" ? "spark" : section === "dependents" ? "home" : section === "preferences" ? "settings" : "archive" }), section[0].toUpperCase() + section.slice(1)]
				}, section))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children })]
		})]
	});
}
var actions = [
	{
		label: "Use annual renewal",
		command: {
			type: "set_preference",
			key: "renewalFrequency",
			value: "annual"
		},
		detail: "Billing cadence"
	},
	{
		label: "Turn on paperless",
		command: {
			type: "set_preference",
			key: "paperless",
			value: true
		},
		detail: "Delivery preference"
	},
	{
		label: "Choose Gold · $88/mo",
		command: {
			type: "select_plan",
			planId: "gold"
		},
		detail: "Coverage choice"
	},
	{
		label: "Review address and dependent",
		command: { type: "review_recipient_details" },
		detail: "Recipient details"
	},
	{
		label: "Preview annual renewal",
		command: { type: "preview_renewal" },
		detail: "State check"
	},
	{
		label: "Approve for 120 seconds",
		command: { type: "create_confirmation" },
		detail: "Human confirmation"
	},
	{
		label: "Submit Samuel’s renewal",
		command: {
			type: "submit_renewal",
			confirmationToken: ""
		},
		detail: "Submission"
	}
];
function RenewalFlow({ account, recording, onAction }) {
	const completedCount = recording.events.filter((event) => event.status === "applied").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "renewal-flow",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "benefits-page-heading",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "2027 enrollment"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Renew your benefits" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Review each choice for Samuel. ShowOnce captures the meaningful outcome of each action." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "renewal-progress",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${completedCount / actions.length * 100}%` } })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "renewal-grid",
				children: actions.map((action, index) => {
					const complete = index < completedCount;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: `renewal-action ${complete ? "renewal-action--done" : ""}`,
						disabled: complete || index > completedCount,
						onClick: () => void onAction(action.command),
						type: "button",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "renewal-action__number",
								children: complete ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "check" }) : index + 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: action.detail }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: action.label })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })
						]
					}, action.label);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "account-snapshot",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Current account" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.selectedPlanId ? `${account.selectedPlanId.toUpperCase()} selected` : "No plan selected" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
						account.submittedAt ? "submitted · " : "",
						account.preferences.renewalFrequency ?? "monthly",
						" ·",
						" ",
						account.preferences.paperless ? "paperless" : "paper delivery",
						" ·",
						" ",
						account.dependents.length,
						" dependent",
						account.dependents.length === 1 ? "" : "s"
					] })
				]
			})
		]
	});
}
function RecorderWidget({ eventCount, onFinish, finishing, readyToFinish }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		"aria-label": "ShowOnce recorder",
		className: "recorder-widget",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "recorder-widget__pulse" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Capturing actions, not your screen" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [eventCount, " semantic actions captured"] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				disabled: finishing || !readyToFinish,
				onClick: onFinish,
				title: readyToFinish ? "Compile this recording" : "Complete all seven renewal actions first",
				type: "button",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "check" }), "Finish"]
			})
		]
	});
}
function BenefitsRoute() {
	const { section } = Route.useParams();
	const { recording: recordingId } = Route.useSearch();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [persona, setPersona] = (0, import_react.useState)("samuel");
	const [scenario, setScenario] = (0, import_react.useState)("normal");
	const [confirmation, setConfirmation] = (0, import_react.useState)();
	const accountId = persona === "samuel" ? "samuel" : scenario === "normal" ? "mom-normal" : "mom-unavailable";
	const accountQuery = useQuery({
		queryKey: ["account", accountId],
		queryFn: () => repositories.accounts.get(accountId)
	});
	const recordingQuery = useQuery({
		queryKey: ["recording", recordingId],
		queryFn: () => recordingId ? repositories.recordings.get(recordingId) : null
	});
	const action = useMutation({
		mutationFn: async (command) => {
			const account = accountQuery.data;
			if (!recordingId || !account) throw new Error("Recording context missing");
			const commandWithConfirmation = command.type === "submit_renewal" && confirmation ? {
				...command,
				confirmationToken: confirmation.token
			} : command;
			const result = await applyRecordedCommand(repositories, recordingId, account, commandWithConfirmation, {
				confirmation,
				createToken: () => crypto.randomUUID()
			});
			if (result.confirmation) setConfirmation(result.confirmation);
			return result;
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["account", accountId] }),
				queryClient.invalidateQueries({ queryKey: ["recording", recordingId] }),
				queryClient.invalidateQueries({ queryKey: ["activity"] })
			]);
		}
	});
	const finish = useMutation({
		mutationFn: () => {
			if (!recordingId) throw new Error("Recording context missing");
			return finishRecording(repositories, recordingId);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["procedures"] });
			await navigate({
				to: "/recordings/$id",
				params: { id: recordingId ?? "" }
			});
		}
	});
	const reset = async () => {
		await resetDemo(repositories);
		await queryClient.invalidateQueries();
	};
	const content = section === "renewal" && accountQuery.data && recordingQuery.data && persona === "samuel" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RenewalFlow, {
		account: accountQuery.data,
		onAction: async (command) => {
			await action.mutateAsync(command);
		},
		recording: recordingQuery.data
	}) : section === "renewal" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "benefits-placeholder",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "preview-label",
			children: "DEMO PREVIEW"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			detail: persona === "mom" ? "Switch to Samuel to record the demonstrated renewal." : "Start a New ShowOnce from the workspace to capture this flow.",
			title: "Renewal walkthrough"
		})]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "benefits-placeholder",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "eyebrow",
				children: "Nexa Benefits"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: section.charAt(0).toUpperCase() + section.slice(1) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This connected account page is available during the walkthrough. Mutations are performed only from the guided renewal flow." }),
			accountQuery.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "benefits-facts",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Member" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: persona === "samuel" ? "Samuel Reed" : "Mom Reed" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Available plans" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: accountQuery.data.availablePlans.length })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Dependents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: accountQuery.data.dependents.length })] })
				]
			}) : null
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BenefitsShell, {
		onPersonaChange: setPersona,
		onReset: () => void reset(),
		onScenarioChange: setScenario,
		persona,
		scenario,
		children: [accountQuery.isPending || recordingQuery.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			"aria-label": "Loading benefits",
			className: "page-loading",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})]
		}) : accountQuery.isError || recordingQuery.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "error-state",
			children: "Unable to load the connected demo."
		}) : content, recordingQuery.data?.status === "capturing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecorderWidget, {
			eventCount: recordingQuery.data.events.length,
			finishing: finish.isPending,
			readyToFinish: recordingQuery.data.events.length === 7 && accountQuery.data?.submittedAt !== null,
			onFinish: () => finish.mutate()
		}) : null]
	});
}
//#endregion
export { BenefitsRoute as component };
