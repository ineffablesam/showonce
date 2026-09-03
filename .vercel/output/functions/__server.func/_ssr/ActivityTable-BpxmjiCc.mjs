import { i as require_jsx_runtime } from "../_libs/@tanstack/react-form+[...].mjs";
import { b as flexRender, t as useTable } from "../_libs/@tanstack/react-table+[...].mjs";
import { n as tableFeatures, t as columnVisibilityFeature } from "../_libs/tanstack__table-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ActivityTable-BpxmjiCc.js
var import_jsx_runtime = require_jsx_runtime();
var features = tableFeatures({ columnVisibilityFeature });
var columns = [
	{
		accessorKey: "timestamp",
		header: "Time",
		cell: (info) => typeof info.getValue() === "number" ? new Date(info.getValue()).toLocaleString() : "Unknown"
	},
	{
		accessorKey: "kind",
		header: "Event",
		cell: (info) => String(info.getValue()).replaceAll("_", " ")
	},
	{
		accessorKey: "source",
		header: "Source",
		cell: (info) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: `pill ${info.getValue() === "webmcp" ? "pill--live" : ""}`,
			children: info.getValue() === "webmcp" ? "Real WebMCP" : "Human"
		})
	},
	{
		accessorFn: (row) => row.toolName ?? row.commandType,
		id: "action",
		header: "Tool / action",
		cell: (info) => String(info.getValue() ?? "Manual semantic command")
	},
	{
		accessorKey: "policy",
		header: "Policy",
		cell: (info) => String(info.getValue() ?? "—").replaceAll("_", " ")
	},
	{
		accessorKey: "outcome",
		header: "Outcome",
		cell: (info) => String(info.getValue() ?? "recorded")
	}
];
function ActivityTable({ data }) {
	const table = useTable({
		features,
		data,
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
//#endregion
export { ActivityTable as t };
