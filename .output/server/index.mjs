globalThis.__nitro_main__ = import.meta.url;
import { a as toEventHandler, c as NodeResponse, i as defineLazyEventHandler, l as serve, n as HTTPError, r as defineHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/logo.png": {
		"type": "image/png",
		"etag": "\"56c6-YH8qPdgYfGAqvnRLzI15Q0r0L84\"",
		"mtime": "2026-09-03T06:15:41.834Z",
		"size": 22214,
		"path": "../public/logo.png"
	},
	"/logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"a13-cJrZeIeUYQ/1cJrjhLkvm5brPSE\"",
		"mtime": "2026-09-03T06:15:41.834Z",
		"size": 2579,
		"path": "../public/logo.svg"
	},
	"/assets/AppShell-Dw9N1ZMN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c94-f3wxxAAlkDsxuY2t61FVFPs7JcQ\"",
		"mtime": "2026-09-03T06:15:41.540Z",
		"size": 7316,
		"path": "../public/assets/AppShell-Dw9N1ZMN.js"
	},
	"/assets/ActivityTable-DOMTtK3F.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"58b-jttN13KTrAbKO3gtwwQNUbzGias\"",
		"mtime": "2026-09-03T06:15:41.540Z",
		"size": 1419,
		"path": "../public/assets/ActivityTable-DOMTtK3F.js"
	},
	"/assets/ConfirmDialog-CsgXCdZ7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"391-+2VQPKkEKz+ZA+5blDzPDC2VWnk\"",
		"mtime": "2026-09-03T06:15:41.540Z",
		"size": 913,
		"path": "../public/assets/ConfirmDialog-CsgXCdZ7.js"
	},
	"/assets/Icon-Dgf2O3_P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22c6-LtE00KiV/9GbmYn+cxf80pXX1yY\"",
		"mtime": "2026-09-03T06:15:41.541Z",
		"size": 8902,
		"path": "../public/assets/Icon-Dgf2O3_P.js"
	},
	"/assets/NorthstarApp-B75-Wub2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3eff-LgRpTyISfyIsUedfV5qih7lsMhw\"",
		"mtime": "2026-09-03T06:15:41.541Z",
		"size": 16127,
		"path": "../public/assets/NorthstarApp-B75-Wub2.js"
	},
	"/assets/Card-Cdxp_IHA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a8ae-fZSFH2ATvrqQuA+VkpRjBmIgqqU\"",
		"mtime": "2026-09-03T06:15:41.540Z",
		"size": 43182,
		"path": "../public/assets/Card-Cdxp_IHA.js"
	},
	"/assets/activity-D478ZWM8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"431-UxiJ/h+vA3dLr5UYYeOQy9ZjmHs\"",
		"mtime": "2026-09-03T06:15:41.541Z",
		"size": 1073,
		"path": "../public/assets/activity-D478ZWM8.js"
	},
	"/assets/QueryClientProvider-DkBrXRje.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8887-8XmoV8EfytjKsgG2IiNdEMYy+S0\"",
		"mtime": "2026-09-03T06:15:41.541Z",
		"size": 34951,
		"path": "../public/assets/QueryClientProvider-DkBrXRje.js"
	},
	"/assets/app-CFTYFInp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b71-YB9CYjIWw8F0OdP7+jRc+b4bvlM\"",
		"mtime": "2026-09-03T06:15:41.541Z",
		"size": 7025,
		"path": "../public/assets/app-CFTYFInp.js"
	},
	"/assets/demo.benefits._section-BNKhVmPH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14cf-P9BwRnLhXnYJcHAfSFNJDbBa1Og\"",
		"mtime": "2026-09-03T06:15:41.541Z",
		"size": 5327,
		"path": "../public/assets/demo.benefits._section-BNKhVmPH.js"
	},
	"/assets/describeCommand-DC-eI7uD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"395-MocEAgaCAg4mvi3rFinl2DQXdCY\"",
		"mtime": "2026-09-03T06:15:41.541Z",
		"size": 917,
		"path": "../public/assets/describeCommand-DC-eI7uD.js"
	},
	"/assets/handoffs-B0O8N-UF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47-PkPCjDXspBHS4lhFD9pqC57Hh1I\"",
		"mtime": "2026-09-03T06:15:41.541Z",
		"size": 71,
		"path": "../public/assets/handoffs-B0O8N-UF.js"
	},
	"/assets/handoffs._id-ayEYAgk0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1075-ax9RxfTMBVYIJvToDIMZGAR9MF8\"",
		"mtime": "2026-09-03T06:15:41.541Z",
		"size": 4213,
		"path": "../public/assets/handoffs._id-ayEYAgk0.js"
	},
	"/assets/help._publicToken-Czj5aB-4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af7-V5jBC+JIWHxCZCc0uu8r8shz91g\"",
		"mtime": "2026-09-03T06:15:41.542Z",
		"size": 2807,
		"path": "../public/assets/help._publicToken-Czj5aB-4.js"
	},
	"/assets/handoffs.index-CFp4zPir.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ef9-dNx1eEeUfjZVRdCIfshwbSqZwW8\"",
		"mtime": "2026-09-03T06:15:41.542Z",
		"size": 3833,
		"path": "../public/assets/handoffs.index-CFp4zPir.js"
	},
	"/assets/matchContext-MSFqSlIg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f-fUXtOSqSlmB1Hc1nW1IO/8sznjY\"",
		"mtime": "2026-09-03T06:15:41.542Z",
		"size": 159,
		"path": "../public/assets/matchContext-MSFqSlIg.js"
	},
	"/assets/not-found-DIgawKw1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"37-RTB6YH5iXRKeXz1Sn6ZQ+vS0lnc\"",
		"mtime": "2026-09-03T06:15:41.543Z",
		"size": 55,
		"path": "../public/assets/not-found-DIgawKw1.js"
	},
	"/assets/link-D0PpRgxq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c1e-dzPQjv6qWN4eT1x/GoOWdn5XSkw\"",
		"mtime": "2026-09-03T06:15:41.542Z",
		"size": 19486,
		"path": "../public/assets/link-D0PpRgxq.js"
	},
	"/assets/needs-input-BJU_Uc9L.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5e0-Tv+1shrQe3g5aVsQqcmnitUC1hI\"",
		"mtime": "2026-09-03T06:15:41.542Z",
		"size": 1504,
		"path": "../public/assets/needs-input-BJU_Uc9L.js"
	},
	"/assets/queries-CEfVbBs3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"314-L1+08AnTXxryt839c6EqruwNWvU\"",
		"mtime": "2026-09-03T06:15:41.543Z",
		"size": 788,
		"path": "../public/assets/queries-CEfVbBs3.js"
	},
	"/assets/index-CnoFQthm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"44077-zp6JcOd0YEPQPbn3cZZa2YTN41w\"",
		"mtime": "2026-09-03T06:15:41.540Z",
		"size": 278647,
		"path": "../public/assets/index-CnoFQthm.js"
	},
	"/assets/recordings-B0O8N-UF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47-PkPCjDXspBHS4lhFD9pqC57Hh1I\"",
		"mtime": "2026-09-03T06:15:41.543Z",
		"size": 71,
		"path": "../public/assets/recordings-B0O8N-UF.js"
	},
	"/assets/recordings._id-COEFhert.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"291e-Uy+gIa+UDJXrs1SBRT2EBIGu3AA\"",
		"mtime": "2026-09-03T06:15:41.543Z",
		"size": 10526,
		"path": "../public/assets/recordings._id-COEFhert.js"
	},
	"/assets/recordings.index-C1DI-ViB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"952-diZcowBZuumajxd0xt2OD+Ai8z0\"",
		"mtime": "2026-09-03T06:15:41.543Z",
		"size": 2386,
		"path": "../public/assets/recordings.index-C1DI-ViB.js"
	},
	"/assets/s._publicToken-BcgFp2MF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ca8-yJfLooY+lGnpmP+nNi8gtFXeh08\"",
		"mtime": "2026-09-03T06:15:41.543Z",
		"size": 19624,
		"path": "../public/assets/s._publicToken-BcgFp2MF.js"
	},
	"/assets/routes-DRM4MflZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"427-aiY47qEwHtnvVJJcoMwlVb4ygCs\"",
		"mtime": "2026-09-03T06:15:41.543Z",
		"size": 1063,
		"path": "../public/assets/routes-DRM4MflZ.js"
	},
	"/assets/settings-B1wQcxq3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"40f-B+QGsR07Kkif8i6DJlJrvUIDogs\"",
		"mtime": "2026-09-03T06:15:41.543Z",
		"size": 1039,
		"path": "../public/assets/settings-B1wQcxq3.js"
	},
	"/assets/shared-C6SlPWPT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6a0-rYyPHjI11rzgmq6To6jpMoGDGvs\"",
		"mtime": "2026-09-03T06:15:41.543Z",
		"size": 1696,
		"path": "../public/assets/shared-C6SlPWPT.js"
	},
	"/assets/useMutation-DNWigcp2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94e-pflCQ4b1rmmAhCxxIXFUxllUAqs\"",
		"mtime": "2026-09-03T06:15:41.544Z",
		"size": 2382,
		"path": "../public/assets/useMutation-DNWigcp2.js"
	},
	"/assets/useForm-DEkSSbaS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f5e3-T4p7tujvLT8kMo6gWkTHdcE7OZU\"",
		"mtime": "2026-09-03T06:15:41.544Z",
		"size": 62947,
		"path": "../public/assets/useForm-DEkSSbaS.js"
	},
	"/assets/useQuery-erBLM20_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1fa4-/h74rHOfdIKk6cb8mWghzKt3Zv4\"",
		"mtime": "2026-09-03T06:15:41.544Z",
		"size": 8100,
		"path": "../public/assets/useQuery-erBLM20_.js"
	},
	"/assets/useStore-BzJTmzE8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2923-wWIA6DfyY+tLTBtgEhKEmRCWcu4\"",
		"mtime": "2026-09-03T06:15:41.544Z",
		"size": 10531,
		"path": "../public/assets/useStore-BzJTmzE8.js"
	},
	"/assets/useTable-C-sThuRC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"808e-puQYfCkeVC5KHBXQcMLKox3H2iA\"",
		"mtime": "2026-09-03T06:15:41.544Z",
		"size": 32910,
		"path": "../public/assets/useTable-C-sThuRC.js"
	},
	"/assets/webmcp-BtZwvA4q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e22-bmb2ZxMND4HDEwqe1d65weou5k8\"",
		"mtime": "2026-09-03T06:15:41.544Z",
		"size": 3618,
		"path": "../public/assets/webmcp-BtZwvA4q.js"
	},
	"/assets/useWebMCP-xsNMkkzF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"303d-4pNYrhXCpN0//iGKuoYfcRms9SI\"",
		"mtime": "2026-09-03T06:15:41.544Z",
		"size": 12349,
		"path": "../public/assets/useWebMCP-xsNMkkzF.js"
	},
	"/assets/styles-Dm043MmY.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"eebf-CVp8p180zB2QoRk2xXFMSm1DU/Q\"",
		"mtime": "2026-09-03T06:15:41.544Z",
		"size": 61119,
		"path": "../public/assets/styles-Dm043MmY.css"
	},
	"/background.png": {
		"type": "image/png",
		"etag": "\"1d117f-TJWjIjlvZhzgz8vj+GtddqUh1tg\"",
		"mtime": "2026-09-03T06:15:41.836Z",
		"size": 1905023,
		"path": "../public/background.png"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_kpFeL6 = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_kpFeL6
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
