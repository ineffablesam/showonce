import { i as require_jsx_runtime } from "../_libs/@tanstack/react-form+[...].mjs";
import { t as Icon } from "./Icon-BxtODSXJ.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Card } from "./Card-NQF5GieP.mjs";
import { t as AppShell } from "./AppShell-DW6Fv0xd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shared-vkFycz4u.js
var import_jsx_runtime = require_jsx_runtime();
function Shared() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "library-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "page-heading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Recipient inbox"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Shared with me" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Seeded demo handoffs received from other people." })
			] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "handoff-audit-grid",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pill",
					children: "Seeded demo"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "From Samuel"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Renew dental coverage" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A recipient-side handoff ready to review and adapt." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					className: "text-link",
					params: { publicToken: "seedHandoffToken_1234567" },
					search: {
						preview: true,
						scenario: "normal"
					},
					to: "/s/$publicToken",
					children: ["Open ready handoff ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pill pill--ready",
					children: "Ready"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pill",
					children: "Seeded demo"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "From Support"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Update account preferences" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "A completed recipient-side example retained for its audit trail." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					className: "text-link",
					to: "/activity",
					children: ["View activity ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pill pill--ready",
					children: "Completed"
				})
			] })]
		})]
	}) });
}
//#endregion
export { Shared as component };
