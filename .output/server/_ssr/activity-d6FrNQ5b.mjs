import { r as require_jsx_runtime } from "../_libs/react+solar-icons__react.mjs";
import { n as EmptyState, t as Card } from "./Card-BvuBlAzF.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as AppShell } from "./AppShell-C0CT2omY.mjs";
import { t as ActivityTable } from "./ActivityTable-BpxmjiCc.mjs";
import { t as activityQuery } from "./queries-G3gVVpfF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activity-d6FrNQ5b.js
var import_jsx_runtime = require_jsx_runtime();
function Activity() {
	const activity = useQuery(activityQuery);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "library-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "page-heading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Semantic audit"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Activity" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Human commands and real WebMCP invocations, clearly sourced." })
			] })
		}), activity.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-label": "Loading activity",
			className: "page-loading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
		}) : activity.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "error-state",
			children: "Unable to load activity."
		}) : activity.data.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityTable, { data: activity.data }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			detail: "Actions appear here as the connected flow runs.",
			title: "No activity yet"
		}) })]
	}) });
}
//#endregion
export { Activity as component };
