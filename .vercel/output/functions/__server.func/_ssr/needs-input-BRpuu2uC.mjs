import { i as require_jsx_runtime } from "../_libs/@tanstack/react-form+[...].mjs";
import { t as Icon } from "./Icon-BxtODSXJ.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as EmptyState, t as Card } from "./Card-NQF5GieP.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as AppShell } from "./AppShell-DW6Fv0xd.mjs";
import { r as helpRequestsQuery } from "./queries-CdP21cP3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/needs-input-BRpuu2uC.js
var import_jsx_runtime = require_jsx_runtime();
function NeedsInput() {
	const requests = useQuery(helpRequestsQuery);
	const open = requests.data?.filter((request) => request.status === "open") ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "library-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "page-heading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Human judgment"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Needs input" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Only material differences that automation must not decide." })
			] })
		}), requests.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-label": "Loading input queue",
			className: "page-loading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
		}) : requests.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "error-state",
			children: "Unable to load requests."
		}) : open.length ? open.filter((request) => request.publicToken).map((request) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "queue-row",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "help" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Plan unavailable" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "No recipient details shared" })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "button button--ghost",
					params: { publicToken: request.publicToken ?? "" },
					to: "/help/$publicToken",
					children: "Review"
				})
			]
		}, request.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			detail: "Differences that need a person will appear here.",
			title: "Nothing needs input"
		}) })]
	}) });
}
//#endregion
export { NeedsInput as component };
