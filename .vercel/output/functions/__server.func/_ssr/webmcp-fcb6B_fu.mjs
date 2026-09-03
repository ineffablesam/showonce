import { i as __toESM } from "../_runtime.mjs";
import { i as require_jsx_runtime, r as require_react } from "../_libs/@tanstack/react-form+[...].mjs";
import { n as EmptyState, t as Card } from "./Card-NQF5GieP.mjs";
import { t as SHOWONCE_TOOLS } from "./useWebMCP-DuVSGfPx.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as useAppWebMCP, t as AppShell } from "./AppShell-DW6Fv0xd.mjs";
import { b as flexRender, t as useTable } from "../_libs/@tanstack/react-table+[...].mjs";
import { n as tableFeatures, t as columnVisibilityFeature } from "../_libs/tanstack__table-core.mjs";
import { t as ActivityTable } from "./ActivityTable-BpxmjiCc.mjs";
import { t as activityQuery } from "./queries-CdP21cP3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/webmcp-fcb6B_fu.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var features = tableFeatures({ columnVisibilityFeature });
var columns = [
	{
		accessorKey: "name",
		header: "Tool"
	},
	{
		accessorKey: "title",
		header: "Purpose"
	},
	{
		accessorKey: "scope",
		header: "Route scope"
	},
	{
		accessorKey: "mode",
		header: "Mode"
	},
	{
		accessorKey: "status",
		header: "Actual status",
		cell: (info) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `pill ${info.getValue() === "registered" ? "pill--live" : ""}`,
			children: String(info.getValue())
		})
	}
];
function ToolsTable({ registeredToolNames, browserToolNames }) {
	const registered = new Set(registeredToolNames);
	const showOnceRows = SHOWONCE_TOOLS.map((tool) => ({
		name: tool.name,
		title: tool.title,
		scope: tool.scopes.join(", "),
		mode: tool.annotations.readOnlyHint ? "Read" : "Write",
		status: registered.has(tool.name) ? "registered" : "not registered"
	}));
	const known = new Set(showOnceRows.map((row) => row.name));
	const browserRows = browserToolNames.filter((name) => !known.has(name)).map((name) => ({
		name,
		title: "Browser-reported tool",
		scope: "Browser",
		mode: "Reported by getTools",
		status: "browser-reported"
	}));
	const table = useTable({
		features,
		data: [...showOnceRows, ...browserRows],
		columns
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "data-table-wrap",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
			className: "data-table",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: table.getHeaderGroups().map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: group.headers.map((header) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: flexRender(header.column.columnDef.header, header.getContext()) }, header.id)) }, group.id)) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: table.getRowModel().rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: row.getVisibleCells().map((cell) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: flexRender(cell.column.columnDef.cell, cell.getContext()) }, cell.id)) }, row.id)) })]
		})
	});
}
function WebMCP() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inspector, {}) });
}
function Inspector() {
	const webmcp = useAppWebMCP();
	const activity = useQuery({
		...activityQuery,
		refetchInterval: 1e3
	});
	const [browserTools, setBrowserTools] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (webmcp.status !== "available" || typeof document === "undefined") return;
		if (!document.modelContext) return;
		const context = document.modelContext;
		if (!context.getTools) return;
		let active = true;
		const refresh = () => void Promise.resolve(context.getTools?.()).then((value) => {
			if (!active || !Array.isArray(value)) return;
			setBrowserTools(value.flatMap((tool) => {
				if (typeof tool === "string") return [tool];
				if (tool !== null && typeof tool === "object" && "name" in tool && typeof tool.name === "string") return [tool.name];
				return [];
			}));
		});
		refresh();
		const interval = window.setInterval(refresh, 2e3);
		return () => {
			active = false;
			window.clearInterval(interval);
		};
	}, [webmcp.status]);
	const invocations = activity.data?.filter((event) => event.kind === "webmcp_invocation") ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "library-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "page-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "Browser capability"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "WebMCP inspector" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Actual registrations and invocation outcomes for this route." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `live-banner ${webmcp.status === "available" ? "live-banner--on" : ""}`,
					children: webmcp.status === "available" ? "WEBMCP LIVE" : `WEBMCP ${webmcp.status.toUpperCase()}`
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "section-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Tool inventory" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [webmcp.registeredToolNames.length, " registered here"] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToolsTable, {
				browserToolNames: browserTools,
				registeredToolNames: webmcp.registeredToolNames
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "inspector-log",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "section-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Actual invocation log" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "No synthetic calls" })]
				}), invocations.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityTable, { data: invocations }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					detail: "Real browser tool calls will be audited here.",
					title: "No WebMCP invocations"
				}) })]
			})
		]
	});
}
//#endregion
export { WebMCP as component };
