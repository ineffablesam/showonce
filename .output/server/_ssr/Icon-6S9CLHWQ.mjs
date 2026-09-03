import { r as require_jsx_runtime, t as i } from "../_libs/react+solar-icons__react.mjs";
import { S as Activity, _ as CircleQuestionMark, a as Share2, b as ArrowRight, c as Plus, d as LayoutGrid, f as House, g as Clipboard, h as Disc, i as Trash2, l as Menu, m as ExternalLink, n as X, o as Settings, p as FileText, r as Users, s as RefreshCw, t as Zap, u as Lock, v as ChevronLeft, x as Archive, y as Check } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Icon-6S9CLHWQ.js
var import_jsx_runtime = require_jsx_runtime();
var lucideIcons = {
	activity: Activity,
	archive: Archive,
	arrow: ArrowRight,
	bolt: Zap,
	check: Check,
	chevronLeft: ChevronLeft,
	clipboard: Clipboard,
	external: ExternalLink,
	file: FileText,
	grid: LayoutGrid,
	help: CircleQuestionMark,
	home: House,
	lock: Lock,
	menu: Menu,
	plus: Plus,
	record: Disc,
	refresh: RefreshCw,
	settings: Settings,
	share: Share2,
	trash: Trash2,
	users: Users,
	x: X
};
function Icon({ name, ...props }) {
	if (name === "spark") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(i, {
		"aria-hidden": "true",
		color: "currentColor",
		size: 20,
		strokeWidth: 1.8,
		...props
	});
	const LucideComponent = lucideIcons[name];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LucideComponent, {
		"aria-hidden": "true",
		color: "currentColor",
		size: 20,
		strokeWidth: 1.8,
		...props
	});
}
//#endregion
export { Icon as t };
