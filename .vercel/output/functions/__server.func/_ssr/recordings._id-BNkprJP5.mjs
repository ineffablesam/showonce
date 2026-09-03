import { i as __toESM } from "../_runtime.mjs";
import { i as require_jsx_runtime, r as require_react, t as useForm } from "../_libs/@tanstack/react-form+[...].mjs";
import { t as Icon } from "./Icon-BxtODSXJ.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createHandoff, m as repositories, n as EmptyState, t as Card } from "./Card-NQF5GieP.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as Button, t as AppShell } from "./AppShell-DW6Fv0xd.mjs";
import { i as Route$2 } from "./router-D2nkK8AS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recordings._id-BNkprJP5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CreateHandoffDialog({ procedure, onCreate }) {
	const form = useForm({
		defaultValues: {
			title: procedure.title,
			recipient: "Mom",
			note: "",
			expirationDays: 7,
			allowSafePreferences: true,
			requireConfirmation: true,
			allowHelperEscalation: true
		},
		onSubmit: async ({ value }) => {
			await onCreate(value);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "handoff-form",
		onSubmit: (event) => {
			event.preventDefault();
			form.handleSubmit();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Share safely"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Create a recipient handoff" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The handoff includes portable intent only—never screen data." })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
				name: "title",
				validators: { onSubmit: ({ value }) => value.trim() ? void 0 : "Add a handoff title." },
				children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Handoff title" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							name: field.name,
							onBlur: field.handleBlur,
							onChange: (event) => field.handleChange(event.target.value),
							value: field.state.value
						}),
						field.state.meta.errors[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
							className: "field__error",
							children: String(field.state.meta.errors[0])
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
					name: "recipient",
					children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Recipient" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							disabled: true,
							value: field.state.value
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
					name: "expirationDays",
					children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Expiration" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							disabled: true,
							value: `${field.state.value} days`
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
				name: "note",
				children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "field",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Optional note" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						name: field.name,
						onChange: (event) => field.handleChange(event.target.value),
						placeholder: "Add context for Mom",
						value: field.state.value
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "handoff-policy",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", { children: "Recipient permissions" }), [
					["allowSafePreferences", "Allow safe preferences"],
					["requireConfirmation", "Require confirmation"],
					["allowHelperEscalation", "Allow helper escalation"]
				].map(([name, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
					name,
					children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						checked: field.state.value,
						onChange: (event) => field.handleChange(event.target.checked),
						type: "checkbox"
					}), label] })
				}, name))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				children: "Create recipient link"
			})
		]
	});
}
var tabs = [
	"Overview",
	"Steps",
	"Rules",
	"Runs",
	"Activity"
];
function RecordingDetail() {
	const { id } = Route$2.useParams();
	const [tab, setTab] = (0, import_react.useState)("Overview");
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const recording = useQuery({
		queryKey: ["recording", id],
		queryFn: () => repositories.recordings.get(id)
	});
	const procedure = useQuery({
		queryKey: ["procedure-by-recording", id],
		queryFn: () => repositories.procedures.getByRecordingId(id)
	});
	const handoff = useMutation({
		mutationFn: async (value) => {
			if (!procedure.data) throw new Error("Procedure not ready");
			return createHandoff(repositories, procedure.data, value.title, {
				recipient: value.recipient,
				note: value.note || void 0,
				expiresAt: Date.now() + value.expirationDays * 24 * 60 * 60 * 1e3,
				policy: {
					allowSafePreferences: value.allowSafePreferences,
					requireConfirmation: value.requireConfirmation,
					allowHelperEscalation: value.allowHelperEscalation
				}
			});
		},
		onSuccess: async (created) => {
			await queryClient.invalidateQueries({ queryKey: ["handoffs"] });
			if (!created.publicToken) throw new Error("Share token was not created");
			await navigate({
				to: "/handoffs/$id",
				params: { id: created.publicToken }
			});
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: recording.isPending || procedure.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-label": "Loading procedure",
		className: "page-loading",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})]
	}) : !recording.data || !procedure.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		detail: "Finish a connected recording to compile its reusable procedure.",
		title: "Procedure not found"
	}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "procedure-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "procedure-hero",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "pill pill--ready",
						children: "Ready to share"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: procedure.data.title }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						procedure.data.steps.length,
						" portable steps from",
						" ",
						recording.data.events.length,
						" human actions."
					] })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "procedure-score",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Transfer safety" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Explicit" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Procedure sections",
				className: "procedure-tabs",
				children: tabs.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: tab === item ? "procedure-tabs__active" : "",
					onClick: () => setTab(item),
					type: "button",
					children: item
				}, item))
			}),
			tab === "Overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "procedure-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "policy-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "policy-card__icon policy-card__icon--carry",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "check" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Carry" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Annual renewal, paperless delivery, and email preference." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Safe preferences" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "policy-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "policy-card__icon",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "spark" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Adapt" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Gold is selected only when it exists for the recipient." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Availability checked" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "policy-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "policy-card__icon policy-card__icon--ask",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "help" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Ask" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Material price or plan differences wait for a person." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Judgment required" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "policy-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "policy-card__icon policy-card__icon--never",
								children: "×"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Never carry" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Addresses, dependents, confirmation tokens, or screen data." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Recipient-specific" })
						]
					})
				]
			}) : tab === "Steps" || tab === "Rules" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "procedure-steps",
				children: procedure.data.steps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "procedure-step",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: index + 1 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: step.commandType.replaceAll("_", " ") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: JSON.stringify(step.input) })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pill",
							children: step.policy.replaceAll("_", " ")
						})
					]
				}, step.id))
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				detail: tab === "Runs" ? "Recipient runs will appear after a shared handoff opens." : "Human and WebMCP activity is available in the audit trail.",
				title: `No ${tab.toLowerCase()} yet`
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "create-handoff-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateHandoffDialog, {
					onCreate: async (value) => {
						await handoff.mutateAsync(value);
					},
					procedure: procedure.data
				})
			})
		]
	}) });
}
//#endregion
export { RecordingDetail as component };
