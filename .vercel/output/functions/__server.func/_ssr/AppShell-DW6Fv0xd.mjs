import { i as __toESM } from "../_runtime.mjs";
import { i as require_jsx_runtime, r as require_react, t as useForm } from "../_libs/@tanstack/react-form+[...].mjs";
import { t as Icon } from "./Icon-BxtODSXJ.mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as executeCommand, g as startRecording, m as repositories } from "./Card-NQF5GieP.mjs";
import { i as compareProcedureToRecipient, n as TopBar, o as useWebMCP } from "./useWebMCP-DuVSGfPx.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-DW6Fv0xd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Button({ children, className = "", variant = "primary", icon, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		className: `button button--${variant} ${className}`.trim(),
		...props,
		children: [icon, children]
	});
}
function CreateShowOnceDialog({ open, onClose, onCreate, returnFocusRef }) {
	const dialogRef = (0, import_react.useRef)(null);
	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			targetApp: "nexa-benefits"
		},
		onSubmit: async ({ value }) => {
			await onCreate(value);
		}
	});
	(0, import_react.useEffect)(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dialog", {
		"aria-labelledby": "create-showonce-title",
		className: "dialog",
		onCancel: onClose,
		onClose: () => {
			onClose();
			returnFocusRef.current?.focus();
		},
		ref: dialogRef,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-label": "Close",
				className: "dialog__close",
				onClick: onClose,
				type: "button",
				children: "×"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "dialog__eyebrow",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "spark" }), " New workflow"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "create-showonce-title",
				children: "New ShowOnce"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Capture a task once, then share an outcome-aware handoff that adapts safely for the next person." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (event) => {
					event.preventDefault();
					event.stopPropagation();
					form.handleSubmit();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
						name: "name",
						validators: { onSubmit: ({ value }) => value.trim() ? void 0 : "Give this ShowOnce a name." },
						children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ShowOnce name" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									autoFocus: true,
									name: field.name,
									onBlur: field.handleBlur,
									onChange: (event) => field.handleChange(event.target.value),
									placeholder: "e.g. Quarterly close",
									value: field.state.value
								}),
								field.state.meta.errors[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
									className: "field__error",
									children: String(field.state.meta.errors[0])
								}) : null
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
						name: "description",
						children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Optional description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								name: field.name,
								onChange: (event) => field.handleChange(event.target.value),
								placeholder: "What should the recipient accomplish?",
								value: field.state.value
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
						name: "targetApp",
						children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "field",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Target app" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								disabled: true,
								name: field.name,
								value: field.state.value,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "nexa-benefits",
									children: "Nexa Benefits Demo"
								})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "dialog__actions",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: onClose,
							type: "button",
							variant: "ghost",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Create ShowOnce"
						})]
					})
				]
			})
		]
	});
}
var primaryNavigation = [
	{
		label: "Overview",
		to: "/app",
		icon: "home"
	},
	{
		label: "Recordings",
		to: "/recordings",
		icon: "record"
	},
	{
		label: "Handoffs",
		to: "/handoffs",
		icon: "share"
	},
	{
		label: "Needs input",
		to: "/needs-input",
		icon: "help"
	},
	{
		label: "Activity",
		to: "/activity",
		icon: "activity"
	}
];
var secondaryNavigation = [
	{
		label: "Shared library",
		to: "/shared",
		icon: "archive"
	},
	{
		label: "WebMCP",
		to: "/webmcp",
		icon: "bolt"
	},
	{
		label: "Settings",
		to: "/settings",
		icon: "settings"
	}
];
function NavItems({ items }) {
	return items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		activeOptions: { exact: item.to === "/app" },
		activeProps: { className: "sidebar__link sidebar__link--active" },
		className: "sidebar__link",
		to: item.to,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: item.icon }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.label })]
	}, item.to));
}
function Sidebar({ mobileOpen = false, onClose }) {
	const [workspaceOpen, setWorkspaceOpen] = (0, import_react.useState)(false);
	const closeButtonRef = (0, import_react.useRef)(null);
	const sidebarRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (mobileOpen) closeButtonRef.current?.focus();
	}, [mobileOpen]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [mobileOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		"aria-label": "Close navigation",
		className: "nav-scrim",
		onClick: onClose,
		type: "button"
	}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		"aria-label": "Workspace navigation",
		"aria-modal": mobileOpen ? true : void 0,
		className: `sidebar ${mobileOpen ? "sidebar--open" : ""}`,
		id: "workspace-navigation",
		onKeyDown: (event) => {
			if (event.key === "Escape") onClose?.();
			if (mobileOpen && event.key === "Tab") {
				const focusable = [...sidebarRef.current?.querySelectorAll("button:not([disabled]), a[href], input:not([disabled])") ?? []].filter((element) => element.offsetParent !== null);
				const first = focusable[0];
				const last = focusable.at(-1);
				if (event.shiftKey && document.activeElement === first) {
					event.preventDefault();
					last?.focus();
				} else if (!event.shiftKey && document.activeElement === last) {
					event.preventDefault();
					first.focus();
				}
			}
		},
		ref: sidebarRef,
		role: mobileOpen ? "dialog" : void 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-label": "Close navigation",
				className: "sidebar__close",
				onClick: onClose,
				ref: closeButtonRef,
				type: "button",
				children: "×"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				className: "brand",
				to: "/",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "brand__mark",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "spark" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "ShowOnce" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				"aria-expanded": workspaceOpen,
				className: "workspace-select",
				onClick: () => setWorkspaceOpen((value) => !value),
				type: "button",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "workspace-select__avatar",
						children: "AS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Workspace" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Acme Studio" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "workspace-select__chevron",
						children: "⌄"
					})
				]
			}),
			workspaceOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "workspace-menu",
				role: "status",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Acme Studio" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Local demo workspace · selected" })]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Workspace",
				className: "sidebar__nav",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItems, { items: primaryNavigation })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Resources",
				className: "sidebar__nav sidebar__nav--bottom",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItems, { items: secondaryNavigation })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sidebar__profile",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "profile-avatar",
						children: "AM"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Alex Morgan" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "alex@acme.studio" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": "true",
						children: "•••"
					})
				]
			})
		]
	})] });
}
var baseState = {
	id: "workspace-account",
	availablePlans: [],
	selectedPlanId: null,
	preferences: {
		paperless: true,
		communication: "email"
	},
	address: "",
	dependents: [],
	submittedAt: null
};
var accountState = baseState;
function useWorkspaceWebMCP(scope = "library") {
	const context = (0, import_react.useMemo)(() => ({
		document: typeof document === "undefined" ? void 0 : document,
		repositories: {
			...repositories,
			activity: { append: repositories.activity.save }
		},
		execute: (command) => {
			const result = executeCommand({
				state: accountState,
				source: "webmcp",
				now: Date.now(),
				createId: () => crypto.randomUUID()
			}, command);
			accountState = result.state;
			return result;
		},
		compare: compareProcedureToRecipient,
		getRecipientState: () => accountState,
		getInitialState: () => baseState,
		now: () => Date.now(),
		createId: () => crypto.randomUUID()
	}), []);
	return useWebMCP(scope, context);
}
var WebMCPContext = (0, import_react.createContext)(null);
function useAppWebMCP() {
	const state = (0, import_react.useContext)(WebMCPContext);
	if (!state) throw new Error("useAppWebMCP must be used inside AppShell");
	return state;
}
function AppShell({ children }) {
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const createButtonRef = (0, import_react.useRef)(null);
	const navigationButtonRef = (0, import_react.useRef)(null);
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const webmcp = useWorkspaceWebMCP("library");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WebMCPContext.Provider, {
		value: webmcp,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "app-shell",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
					mobileOpen,
					onClose: () => {
						setMobileOpen(false);
						requestAnimationFrame(() => navigationButtonRef.current?.focus());
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "app-shell__main",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
						createButtonRef,
						onCreate: () => setCreating(true),
						onOpenNavigation: () => setMobileOpen(true),
						navigationButtonRef,
						navigationOpen: mobileOpen,
						webmcp
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "app-main",
						children
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateShowOnceDialog, {
					onClose: () => setCreating(false),
					onCreate: async ({ name, description, targetApp }) => {
						const recording = await startRecording(repositories, name, {
							description,
							targetApp
						});
						await queryClient.invalidateQueries({ queryKey: ["recordings"] });
						setCreating(false);
						await navigate({
							to: "/demo/benefits/$section",
							params: { section: "renewal" },
							search: { recording: recording.id }
						});
					},
					open: creating,
					returnFocusRef: createButtonRef
				})
			]
		})
	});
}
//#endregion
export { Button as n, useAppWebMCP as r, AppShell as t };
