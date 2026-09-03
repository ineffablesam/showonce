import { i as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+solar-icons__react.mjs";
import { t as Icon } from "./Icon-6S9CLHWQ.mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as useForm } from "../_libs/@tanstack/react-form+[...].mjs";
import { c as createHandoff, m as repositories, n as EmptyState, t as Card } from "./Card-BvuBlAzF.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as Button, t as AppShell } from "./AppShell-C0CT2omY.mjs";
import { i as Route$2 } from "./router-VfESfXhW.mjs";
import { t as describeCommand } from "./describeCommand-ZF5dEcVF.mjs";
import { t as ConfirmDialog } from "./ConfirmDialog-BEkNnYzz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recordings._id-2QvfAOBJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PERMISSIONS = [
	[
		"allowSafePreferences",
		"Allow safe preferences",
		"Carry over paperless, communication, and renewal-frequency choices."
	],
	[
		"requireConfirmation",
		"Require confirmation",
		"The recipient must explicitly approve before anything submits."
	],
	[
		"allowHelperEscalation",
		"Allow helper escalation",
		"Let the recipient ask a trusted helper when a choice needs judgment."
	]
];
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
		className: "flex w-full max-w-xl flex-col gap-6",
		onSubmit: (event) => {
			event.preventDefault();
			form.handleSubmit();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-bold uppercase tracking-wider text-emerald-700",
						children: "Share safely"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-xl font-semibold text-neutral-900",
						children: "Create a recipient handoff"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-neutral-500",
						children: "The handoff includes portable intent only—never screen data."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
				name: "title",
				validators: { onSubmit: ({ value }) => value.trim() ? void 0 : "Add a handoff title." },
				children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium text-neutral-700",
							children: "Handoff title"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10",
							name: field.name,
							onBlur: field.handleBlur,
							onChange: (event) => field.handleChange(event.target.value),
							value: field.state.value
						}),
						field.state.meta.errors[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
							className: "text-xs font-medium text-red-600",
							children: String(field.state.meta.errors[0])
						}) : null
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
					name: "recipient",
					validators: { onSubmit: ({ value }) => value.trim() ? void 0 : "Name the recipient." },
					children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-neutral-700",
								children: "Recipient"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10",
								name: field.name,
								onBlur: field.handleBlur,
								onChange: (event) => field.handleChange(event.target.value),
								placeholder: "e.g. Mom",
								value: field.state.value
							}),
							field.state.meta.errors[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
								className: "text-xs font-medium text-red-600",
								children: String(field.state.meta.errors[0])
							}) : null
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
					name: "expirationDays",
					children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium text-neutral-700",
							children: "Expiration"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "w-full cursor-not-allowed rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm text-neutral-500 shadow-sm",
							disabled: true,
							value: `${field.state.value} days`
						})]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
				name: "note",
				children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium text-neutral-700",
						children: "Optional note"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "min-h-20 w-full resize-none rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-900/10",
						name: field.name,
						onChange: (event) => field.handleChange(event.target.value),
						placeholder: "Add context for the recipient",
						value: field.state.value
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
					className: "mb-1 px-0.5 text-sm font-semibold text-neutral-700",
					children: "Recipient permissions"
				}), PERMISSIONS.map(([name, label, hint]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
					name,
					children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex cursor-pointer items-start gap-3 rounded-lg p-1.5 transition hover:bg-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							checked: field.state.value,
							className: "mt-0.5 size-4 shrink-0 accent-neutral-900",
							onChange: (event) => field.handleChange(event.target.checked),
							type: "checkbox"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex flex-col gap-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium text-neutral-800",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs leading-snug text-neutral-500",
								children: hint
							})]
						})]
					})
				}, name))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "inline-flex w-full items-center justify-center rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 sm:w-auto sm:self-start",
				type: "submit",
				children: "Create recipient link"
			})
		]
	});
}
var NEVER_TRANSFER = [
	"Credentials",
	"Session data",
	"Screen selectors or coordinates"
];
function bucketSteps(steps) {
	return {
		carryOver: steps.filter((step) => step.policy === "safe_preference" || step.policy === "availability_checked"),
		adapt: steps.filter((step) => step.policy === "recipient_specific"),
		alwaysAsk: steps.filter((step) => step.policy === "confirmation_required" || step.policy === "state_check")
	};
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
	const [confirmingDelete, setConfirmingDelete] = (0, import_react.useState)(false);
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
	const deleteRecording = useMutation({
		mutationFn: async () => {
			if (procedure.data) await repositories.procedures.remove(procedure.data.id);
			await repositories.recordings.remove(id);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries();
			await navigate({ to: "/recordings" });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [recording.isPending || procedure.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pill pill--ready",
							children: "Ready to share"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: procedure.data.title }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							procedure.data.steps.length,
							" meaningful actions captured from",
							" ",
							"Northstar Benefits — automatically, with no manual step selection."
						] })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "procedure-score",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Transfer safety" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Explicit" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "trash" }),
						onClick: () => setConfirmingDelete(true),
						type: "button",
						variant: "ghost",
						children: "Delete"
					})
				]
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Carry over" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "policy-card__steps",
								children: bucketSteps(procedure.data.steps).carryOver.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: describeCommand(step.input) }, step.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Safe preferences & checked availability" })
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "policy-card__steps",
								children: bucketSteps(procedure.data.steps).adapt.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: describeCommand(step.input) }, step.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Recipient-specific" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "policy-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "policy-card__icon policy-card__icon--ask",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "help" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Always ask" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "policy-card__steps",
								children: bucketSteps(procedure.data.steps).alwaysAsk.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: describeCommand(step.input) }, step.id))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Plan substitution & final submission" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "policy-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "policy-card__icon policy-card__icon--never",
								children: "×"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Never transfer" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "policy-card__steps",
								children: NEVER_TRANSFER.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: item }, item))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Never captured, never shared" })
						]
					})
				]
			}) : tab === "Steps" || tab === "Rules" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "procedure-steps",
				children: procedure.data.steps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "procedure-step",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: index + 1 }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: describeCommand(step.input) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: JSON.stringify(step.input) })] }),
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
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
		description: procedure.data ? `This deletes “${procedure.data.title}” along with its recording and any handoffs created from it. This can’t be undone.` : "",
		onCancel: () => setConfirmingDelete(false),
		onConfirm: () => deleteRecording.mutate(),
		open: confirmingDelete,
		pending: deleteRecording.isPending,
		title: "Delete this recording?"
	})] });
}
//#endregion
export { RecordingDetail as component };
