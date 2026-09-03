import { i as require_jsx_runtime } from "../_libs/@tanstack/react-form+[...].mjs";
import { h as resetDemo, m as repositories, t as Card } from "./Card-NQF5GieP.mjs";
import { a as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as AppShell } from "./AppShell-DW6Fv0xd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-BQqEOouj.js
var import_jsx_runtime = require_jsx_runtime();
function Settings() {
	const queryClient = useQueryClient();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "library-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "page-heading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Demo workspace"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Settings" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Local product-demo controls. Account management is not part of this build." })
			] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "settings-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Reset seeded demo data" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Restores Samuel, Mom, procedures, and activity to their initial local state." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--ghost",
				onClick: () => void resetDemo(repositories).then(() => queryClient.invalidateQueries()),
				type: "button",
				children: "Reset demo"
			})]
		})]
	}) });
}
//#endregion
export { Settings as component };
