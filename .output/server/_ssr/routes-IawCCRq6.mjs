import { r as require_jsx_runtime } from "../_libs/react+solar-icons__react.mjs";
import { t as Icon } from "./Icon-6S9CLHWQ.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-IawCCRq6.js
var import_jsx_runtime = require_jsx_runtime();
function LandingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "landing-hero",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "landing-hero__overlay" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "landing-hero__content",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					alt: "ShowOnce",
					className: "landing-hero__logo",
					src: "/logo.svg"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Show it once. Hand off the outcome." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "landing-hero__footer",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "landing-hero__tagline",
					children: "Teach it once. Trust it everywhere."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "landing-hero__actions",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							className: "button button--primary button--large",
							to: "/app",
							children: ["Open workspace ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							className: "button button--secondary button--large",
							to: "/demo",
							children: "Try live demo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							className: "button button--ghost button--large",
							to: "/shared",
							children: "View shared library"
						})
					]
				})]
			})
		]
	});
}
var SplitComponent = LandingPage;
//#endregion
export { SplitComponent as component };
