import { i as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+solar-icons__react.mjs";
import { t as Icon } from "./Icon-6S9CLHWQ.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as repositories, n as EmptyState, t as Card } from "./Card-BvuBlAzF.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as AppShell } from "./AppShell-C0CT2omY.mjs";
import { b as flexRender, t as useTable } from "../_libs/@tanstack/react-table+[...].mjs";
import { n as tableFeatures, t as columnVisibilityFeature } from "../_libs/tanstack__table-core.mjs";
import { n as handoffsQuery } from "./queries-G3gVVpfF.mjs";
import { t as ConfirmDialog } from "./ConfirmDialog-BEkNnYzz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/handoffs.index-C8LXiJZ7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var features = tableFeatures({ columnVisibilityFeature });
var formatDate = (value) => typeof value === "number" ? new Date(value).toLocaleDateString() : "—";
function buildColumns(onDelete) {
	const columns = [
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
			cell: ({ row }) => /benefits|renewal/iu.test(row.original.procedure?.title ?? row.original.title) ? "Northstar Benefits" : "—"
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
	if (onDelete) columns.push({
		id: "actions",
		header: "",
		cell: ({ row }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			"aria-label": `Delete ${row.original.title}`,
			className: "row-delete-button",
			onClick: () => onDelete(row.original),
			type: "button",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "trash" })
		})
	});
	return columns;
}
function HandoffsTable({ data, onDelete }) {
	const columns = (0, import_react.useMemo)(() => buildColumns(onDelete), [onDelete]);
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
	const queryClient = useQueryClient();
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)();
	const deleteHandoff = useMutation({
		mutationFn: (id) => repositories.handoffs.remove(id),
		onSuccess: async () => {
			setPendingDelete(void 0);
			await queryClient.invalidateQueries({ queryKey: ["handoffs"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
		}) : handoffs.data.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HandoffsTable, {
			data: handoffs.data,
			onDelete: setPendingDelete
		}) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			detail: "Finish a recording, then create its recipient link.",
			title: "No handoffs yet"
		}) })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
		description: pendingDelete ? `This revokes “${pendingDelete.title}” and removes it from your workspace. Anyone with the link will no longer be able to open it.` : "",
		onCancel: () => setPendingDelete(void 0),
		onConfirm: () => {
			if (pendingDelete) deleteHandoff.mutate(pendingDelete.id);
		},
		open: Boolean(pendingDelete),
		pending: deleteHandoff.isPending,
		title: "Delete this handoff?"
	})] });
}
//#endregion
export { Handoffs as component };
