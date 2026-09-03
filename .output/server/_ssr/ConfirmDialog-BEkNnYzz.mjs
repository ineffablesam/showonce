import { i as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+solar-icons__react.mjs";
import { n as Button } from "./AppShell-C0CT2omY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ConfirmDialog-BEkNnYzz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ConfirmDialog({ open, title, description, confirmLabel = "Delete", pending = false, onCancel, onConfirm }) {
	const dialogRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dialog", {
		"aria-labelledby": "confirm-dialog-title",
		className: "dialog dialog--confirm",
		onCancel,
		onClose: onCancel,
		ref: dialogRef,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-label": "Close",
				className: "dialog__close",
				onClick: onCancel,
				type: "button",
				children: "×"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "confirm-dialog-title",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: description }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dialog__actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onCancel,
					type: "button",
					variant: "ghost",
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: pending,
					onClick: onConfirm,
					type: "button",
					variant: "danger",
					children: pending ? "Deleting…" : confirmLabel
				})]
			})
		]
	});
}
//#endregion
export { ConfirmDialog as t };
