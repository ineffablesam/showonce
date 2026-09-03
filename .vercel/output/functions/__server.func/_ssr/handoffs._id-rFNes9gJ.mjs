import { i as require_jsx_runtime } from "../_libs/@tanstack/react-form+[...].mjs";
import { t as Icon } from "./Icon-BxtODSXJ.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as repositories, n as EmptyState, s as createDemoAccount, t as Card, u as createRecipientAccount } from "./Card-NQF5GieP.mjs";
import { i as compareProcedureToRecipient, t as SHOWONCE_TOOLS } from "./useWebMCP-DuVSGfPx.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as AppShell } from "./AppShell-DW6Fv0xd.mjs";
import { o as Route$5 } from "./router-D2nkK8AS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/handoffs._id-rFNes9gJ.js
var import_jsx_runtime = require_jsx_runtime();
function HandoffDetail() {
	const { id } = Route$5.useParams();
	const handoff = useQuery({
		queryKey: ["handoff", id],
		queryFn: async () => (await repositories.handoffs.list()).find((candidate) => candidate.publicToken === id) ?? null
	});
	const sharePath = `/s/${id}?scenario=normal`;
	const procedure = handoff.data?.procedure;
	const adaptation = procedure ? compareProcedureToRecipient(procedure, createDemoAccount(), createRecipientAccount("normal")) : null;
	const recipientTools = SHOWONCE_TOOLS.filter((tool) => tool.scopes.includes("recipient"));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: !handoff.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		detail: "The recipient link may have been removed.",
		title: handoff.isPending ? "Loading handoff" : "Handoff not found"
	}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "handoff-detail",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "procedure-hero",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "pill pill--ready",
						children: (handoff.data.status ?? "created").replaceAll("_", " ")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: handoff.data.title }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Portable task with explicit adaptation, privacy, and activity." })
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "share-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "share-card__icon",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "share" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Recipient link" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: sharePath })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						className: "button button--primary",
						params: { publicToken: id },
						search: {
							preview: true,
							scenario: "normal"
						},
						to: "/s/$publicToken",
						children: "Open recipient view"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "handoff-audit-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "Original task"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: procedure?.title ?? handoff.data.title }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [procedure?.steps.length ?? 0, " sanitized semantic actions."] }),
						procedure?.steps.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "procedure-step",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: index + 1 }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: step.commandType.replaceAll("_", " ") })]
						}, step.id))
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "Recipient adaptation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Mom’s account stays authoritative" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							adaptation?.safeActions.length ?? 0,
							" safe actions can adapt;",
							" ",
							adaptation?.differences.length ?? 0,
							" differences remain visible."
						] }),
						adaptation?.differences.map((difference) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: difference.kind.replaceAll("_", " ") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: difference.detail })] }, `${difference.kind}-${difference.detail}`)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							className: "text-link",
							params: { publicToken: id },
							search: {
								preview: true,
								scenario: "normal"
							},
							to: "/s/$publicToken",
							children: ["Preview scenario — normal ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "Activity"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: (handoff.data.status ?? "created").replaceAll("_", " ") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Last lifecycle activity",
							" ",
							new Date(handoff.data.updatedAt ?? handoff.data.createdAt).toLocaleString(),
							"."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							className: "text-link",
							to: "/activity",
							children: ["View activity ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "Privacy"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "0 credentials shared" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No passwords, sessions, selectors, screenshots, addresses, or dependent values are included in this handoff." })
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "Agent tools"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: [recipientTools.length, " recipient tools"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Registered only on the recipient route when WebMCP is available." }),
						recipientTools.map((tool) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: tool.name }, tool.name))
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "eyebrow",
							children: "Plan unavailable preview"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "No automatic substitute" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Mom chooses or requests a minimum-information decision." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							className: "text-link",
							params: { publicToken: id },
							search: {
								preview: true,
								scenario: "unavailable"
							},
							to: "/s/$publicToken",
							children: ["Preview scenario — unavailable ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
						})
					] })
				]
			})
		]
	}) });
}
//#endregion
export { HandoffDetail as component };
