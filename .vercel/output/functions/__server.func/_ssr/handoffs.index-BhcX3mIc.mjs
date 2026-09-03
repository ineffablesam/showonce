import { i as require_jsx_runtime } from "../_libs/@tanstack/react-form+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as EmptyState, t as Card } from "./Card-NQF5GieP.mjs";
import { r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as AppShell } from "./AppShell-DW6Fv0xd.mjs";
import { b as flexRender, t as useTable } from "../_libs/@tanstack/react-table+[...].mjs";
import { n as tableFeatures, t as columnVisibilityFeature } from "../_libs/tanstack__table-core.mjs";
import { n as handoffsQuery } from "./queries-CdP21cP3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/handoffs.index-BhcX3mIc.js
var import_jsx_runtime = require_jsx_runtime();
var features = tableFeatures({ columnVisibilityFeature });
var formatDate = (value) => typeof value === "number" ? new Date(value).toLocaleDateString() : "—";
var columns = [
	{
		accessorKey: "title",
		header: "Task",
		cell: (info) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			className: "table-link",
			params: { id: info.row.original.publicToken ?? info.row.original.id },
			to: "/handoffs/$id",
			children: String(info.getValue())
		})
	},
	{
		accessorKey: "recipient",
		header: "Recipient",
		cell: (info) => info.getValue() ?? "—"
	},
	{
		id: "sourceApp",
		header: "Source app",
		cell: ({ row }) => /benefits|renewal/iu.test(row.original.procedure?.title ?? row.original.title) ? "Nexa Benefits" : "—"
	},
	{
		accessorKey: "status",
		header: "Status",
		cell: (info) => {
			const status = String(info.getValue() ?? "created");
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `pill ${status === "completed" ? "pill--ready" : ""}`,
				children: status.replaceAll("_", " ")
			});
		}
	},
	{
		id: "adaptations",
		header: "Adaptations",
		cell: ({ row }) => row.original.procedure?.steps.filter((step) => step.policy === "safe_preference" || step.policy === "availability_checked" || step.policy === "recipient_specific").length ?? 0
	},
	{
		id: "needsInput",
		header: "Needs input",
		cell: ({ row }) => row.original.status === "needs_input" ? "Yes" : "—"
	},
	{
		accessorKey: "createdAt",
		header: "Created",
		cell: (info) => formatDate(info.getValue())
	},
	{
		accessorKey: "updatedAt",
		header: "Last activity",
		cell: ({ row }) => formatDate(row.original.updatedAt ?? row.original.createdAt)
	}
];
function HandoffsTable({ data }) {
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
function Handoffs() {
	const handoffs = useQuery(handoffsQuery);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "library-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "page-heading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Portable outcomes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Handoffs" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Recipient links with safe intent and explicit decision points." })
			] })
		}), handoffs.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-label": "Loading handoffs",
			className: "page-loading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
		}) : handoffs.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "error-state",
			children: "Unable to load handoffs."
		}) : handoffs.data.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandoffsTable, { data: handoffs.data }) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			detail: "Finish a recording, then create its recipient link.",
			title: "No handoffs yet"
		}) })]
	}) });
}
//#endregion
export { Handoffs as component };
