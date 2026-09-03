import { i as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+solar-icons__react.mjs";
import { I as redirect, f as createRouter, g as createRootRoute, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-VfESfXhW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var styles_default = "/assets/styles-vF_jZTKG.css";
var Route$18 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "ShowOnce — hand off the outcome" },
			{
				name: "description",
				content: "Capture task intent once and create safe, outcome-aware handoffs."
			}
		],
		links: [{
			rel: "icon",
			type: "image/svg+xml",
			href: "/logo.svg"
		}, ...[{
			rel: "stylesheet",
			href: styles_default
		}]]
	}),
	component: RootComponent,
	shellComponent: RootDocument
});
function RootComponent() {
	const [queryClient] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		retry: 1,
		refetchOnWindowFocus: false
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
function RootDocument({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
var $$splitComponentImporter$15 = () => import("./routes-IawCCRq6.mjs");
var Route$17 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$15, "component") });
var $$splitComponentImporter$14 = () => import("./activity-d6FrNQ5b.mjs");
var Route$16 = createFileRoute("/activity")({ component: lazyRouteComponent($$splitComponentImporter$14, "component") });
var $$splitComponentImporter$13 = () => import("./app-BbOUsPnb.mjs");
var Route$15 = createFileRoute("/app")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
var Route$14 = createFileRoute("/dashboard")({ beforeLoad: () => {
	throw redirect({ to: "/app" });
} });
var $$splitComponentImporter$12 = () => import("./handoffs-DAUFPf8A.mjs");
var Route$13 = createFileRoute("/handoffs")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var $$splitComponentImporter$11 = () => import("./needs-input-DgvNkRQL.mjs");
var Route$12 = createFileRoute("/needs-input")({ component: lazyRouteComponent($$splitComponentImporter$11, "component") });
var $$splitComponentImporter$10 = () => import("./recordings-DPIz3dcL.mjs");
var Route$11 = createFileRoute("/recordings")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
var $$splitComponentImporter$9 = () => import("./settings-C8808UFD.mjs");
var Route$10 = createFileRoute("/settings")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./shared-sywwSY6o.mjs");
var Route$9 = createFileRoute("/shared")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./webmcp-BS0_WbJE.mjs");
var Route$8 = createFileRoute("/webmcp")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var Route$7 = createFileRoute("/demo/")({ beforeLoad: () => {
	throw redirect({
		to: "/demo/benefits/$section",
		params: { section: "renewal" },
		search: { recording: void 0 }
	});
} });
var $$splitComponentImporter$6 = () => import("./handoffs.index-C8LXiJZ7.mjs");
var Route$6 = createFileRoute("/handoffs/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./handoffs._id-DrIlktrk.mjs");
var Route$5 = createFileRoute("/handoffs/$id")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./help._publicToken-DvSFvjgM.mjs");
var Route$4 = createFileRoute("/help/$publicToken")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./recordings.index-BWN-tXYP.mjs");
var Route$3 = createFileRoute("/recordings/")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./recordings._id-2QvfAOBJ.mjs");
var Route$2 = createFileRoute("/recordings/$id")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./s._publicToken-EbI-tJD4.mjs");
var Route$1 = createFileRoute("/s/$publicToken")({
	validateSearch: (search) => ({
		scenario: search.scenario === "unavailable" ? "unavailable" : "normal",
		preview: search.preview === true || search.preview === "true"
	}),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./demo.benefits._section-BD646G94.mjs");
var Route = createFileRoute("/demo/benefits/$section")({
	validateSearch: (search) => ({ recording: typeof search.recording === "string" ? search.recording : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$17.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$18
});
var ActivityRoute = Route$16.update({
	id: "/activity",
	path: "/activity",
	getParentRoute: () => Route$18
});
var AppRoute = Route$15.update({
	id: "/app",
	path: "/app",
	getParentRoute: () => Route$18
});
var DashboardRoute = Route$14.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => Route$18
});
var HandoffsRoute = Route$13.update({
	id: "/handoffs",
	path: "/handoffs",
	getParentRoute: () => Route$18
});
var NeedsInputRoute = Route$12.update({
	id: "/needs-input",
	path: "/needs-input",
	getParentRoute: () => Route$18
});
var RecordingsRoute = Route$11.update({
	id: "/recordings",
	path: "/recordings",
	getParentRoute: () => Route$18
});
var SettingsRoute = Route$10.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$18
});
var SharedRoute = Route$9.update({
	id: "/shared",
	path: "/shared",
	getParentRoute: () => Route$18
});
var WebmcpRoute = Route$8.update({
	id: "/webmcp",
	path: "/webmcp",
	getParentRoute: () => Route$18
});
var DemoIndexRoute = Route$7.update({
	id: "/demo/",
	path: "/demo/",
	getParentRoute: () => Route$18
});
var HandoffsIndexRoute = Route$6.update({
	id: "/",
	path: "/",
	getParentRoute: () => HandoffsRoute
});
var HandoffsIdRoute = Route$5.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => HandoffsRoute
});
var HelpPublicTokenRoute = Route$4.update({
	id: "/help/$publicToken",
	path: "/help/$publicToken",
	getParentRoute: () => Route$18
});
var RecordingsIndexRoute = Route$3.update({
	id: "/",
	path: "/",
	getParentRoute: () => RecordingsRoute
});
var RecordingsIdRoute = Route$2.update({
	id: "/$id",
	path: "/$id",
	getParentRoute: () => RecordingsRoute
});
var SPublicTokenRoute = Route$1.update({
	id: "/s/$publicToken",
	path: "/s/$publicToken",
	getParentRoute: () => Route$18
});
var DemoBenefitsSectionRoute = Route.update({
	id: "/demo/benefits/$section",
	path: "/demo/benefits/$section",
	getParentRoute: () => Route$18
});
var HandoffsRouteChildren = {
	HandoffsIdRoute,
	HandoffsIndexRoute
};
var HandoffsRouteWithChildren = HandoffsRoute._addFileChildren(HandoffsRouteChildren);
var RecordingsRouteChildren = {
	RecordingsIdRoute,
	RecordingsIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	ActivityRoute,
	AppRoute,
	DashboardRoute,
	HandoffsRoute: HandoffsRouteWithChildren,
	NeedsInputRoute,
	RecordingsRoute: RecordingsRoute._addFileChildren(RecordingsRouteChildren),
	SettingsRoute,
	SharedRoute,
	WebmcpRoute,
	HelpPublicTokenRoute,
	SPublicTokenRoute,
	DemoIndexRoute,
	DemoBenefitsSectionRoute
};
var routeTree = Route$18._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter(options = {}) {
	return createRouter({
		routeTree,
		history: options.history,
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0
	});
}
//#endregion
export { Route$4 as a, Route$2 as i, Route as n, Route$5 as o, Route$1 as r, router_exports as t };
