import { i as require_jsx_runtime } from "../_libs/@tanstack/react-form+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as EmptyState, t as Card } from "./Card-NQF5GieP.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as AppShell } from "./AppShell-DW6Fv0xd.mjs";
import { i as recordingsQuery } from "./queries-CdP21cP3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recordings.index-ZhpN7182.js
var import_jsx_runtime = require_jsx_runtime();
function Recordings() {
	const recordings = useQuery(recordingsQuery);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "library-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "page-heading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Semantic capture"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Recordings" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Meaningful human actions—not screenshots or coordinates." })
			] })
		}), recordings.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-label": "Loading recordings",
			className: "page-loading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
		}) : recordings.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "error-state",
			children: "Unable to load recordings."
		}) : recordings.data.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "recording-list",
			children: recordings.data.map((recording) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				params: { id: recording.id },
				to: "/recordings/$id",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `pill ${recording.status === "finished" ? "pill--ready" : ""}`,
						children: recording.status
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: recording.title }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [recording.events.length, " semantic actions"] })
				] })
			}, recording.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			detail: "Use New ShowOnce to record the connected benefits flow.",
			title: "No recordings yet"
		}) })]
	}) });
}
//#endregion
export { Recordings as component };
