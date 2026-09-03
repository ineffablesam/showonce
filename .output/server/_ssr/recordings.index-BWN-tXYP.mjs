import { i as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+solar-icons__react.mjs";
import { t as Icon } from "./Icon-6S9CLHWQ.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { m as repositories, n as EmptyState, t as Card } from "./Card-BvuBlAzF.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as AppShell } from "./AppShell-C0CT2omY.mjs";
import { i as recordingsQuery } from "./queries-G3gVVpfF.mjs";
import { t as ConfirmDialog } from "./ConfirmDialog-BEkNnYzz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/recordings.index-BWN-tXYP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Recordings() {
	const recordings = useQuery(recordingsQuery);
	const queryClient = useQueryClient();
	const [pendingDeleteId, setPendingDeleteId] = (0, import_react.useState)();
	const deleteRecording = useMutation({
		mutationFn: async (id) => {
			const procedure = await repositories.procedures.getByRecordingId(id);
			if (procedure) await repositories.procedures.remove(procedure.id);
			await repositories.recordings.remove(id);
		},
		onSuccess: async () => {
			setPendingDeleteId(void 0);
			await queryClient.invalidateQueries();
		}
	});
	const pendingRecording = recordings.data?.find((recording) => recording.id === pendingDeleteId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
			children: recordings.data.map((recording) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "recording-list__row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					className: "recording-list__link",
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
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					"aria-label": `Delete ${recording.title}`,
					className: "row-delete-button",
					onClick: () => setPendingDeleteId(recording.id),
					type: "button",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "trash" })
				})]
			}, recording.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			detail: "Use New ShowOnce to record the connected benefits flow.",
			title: "No recordings yet"
		}) })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
		description: pendingRecording ? `This deletes “${pendingRecording.title}” along with its compiled procedure and any handoffs created from it. This can’t be undone.` : "",
		onCancel: () => setPendingDeleteId(void 0),
		onConfirm: () => {
			if (pendingDeleteId) deleteRecording.mutate(pendingDeleteId);
		},
		open: Boolean(pendingDeleteId),
		pending: deleteRecording.isPending,
		title: "Delete this recording?"
	})] });
}
//#endregion
export { Recordings as component };
