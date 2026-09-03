import { r as require_jsx_runtime } from "../_libs/react+solar-icons__react.mjs";
import { t as Icon } from "./Icon-6S9CLHWQ.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as EmptyState, t as Card } from "./Card-BvuBlAzF.mjs";
import { a as getWebMCPPresentation } from "./useWebMCP-DXk4KqFy.mjs";
import { r as useAppWebMCP, t as AppShell } from "./AppShell-C0CT2omY.mjs";
import { a as useWorkspaceOverview } from "./queries-G3gVVpfF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-BbOUsPnb.js
var import_jsx_runtime = require_jsx_runtime();
function formatDate(timestamp) {
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric"
	}).format(timestamp);
}
function DashboardPage() {
	const overview = useWorkspaceOverview();
	const webmcp = useAppWebMCP();
	const webmcpPresentation = getWebMCPPresentation(webmcp);
	if (overview.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-label": "Loading workspace",
		className: "page-loading",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
		]
	});
	if (overview.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "error-state",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "We couldn’t load this workspace." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your local data is unchanged. Refresh to try again." })]
	});
	const procedures = overview.procedures.data ?? [];
	const handoffs = overview.handoffs.data ?? [];
	const activity = overview.activity.data ?? [];
	const recordings = overview.recordings.data ?? [];
	const openRequests = overview.helpRequests.data?.filter((request) => request.status === "open") ?? [];
	const finishedRecordings = recordings.filter((recording) => recording.status === "finished").length;
	const completionRate = recordings.length ? Math.round(finishedRecordings / recordings.length * 100) : 0;
	const today = new Intl.DateTimeFormat("en", {
		weekday: "long",
		month: "long",
		day: "numeric"
	}).format(/* @__PURE__ */ new Date());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "dashboard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "page-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: today
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Good evening, Alex." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Pick up where you left off or capture something worth repeating." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "page-heading__signal",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Recording completion" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [completionRate, "%"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
							finishedRecordings,
							" of ",
							recordings.length,
							" finished"
						] })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				"aria-labelledby": "overview-title",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "section-heading",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "overview-title",
						children: "Overview"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Live workspace" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "metric-grid",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "metric-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "metric-card__icon metric-card__icon--ink",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "record" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Reusable procedures" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: procedures.length }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ready to hand off" })
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "metric-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "metric-card__icon metric-card__icon--green",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "share" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Active handoffs" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: handoffs.length }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Across your workspace" })
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "metric-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "metric-card__icon metric-card__icon--amber",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "help" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Needs input" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: openRequests.length }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: openRequests.length ? "Judgment waiting" : "Queue clear" })
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "metric-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "metric-card__icon metric-card__icon--blue",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "bolt" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "WebMCP tools" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: webmcp.registeredToolNames.length }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: webmcpPresentation.shortLabel })
							] })]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dashboard-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "continue-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "continue-title",
							children: "Continue working"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/recordings",
							children: "View all"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "continue-card",
						children: [procedures.length ? procedures.slice(0, 2).map((procedure) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							className: "work-row",
							to: "/recordings",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "work-row__icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "record" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "work-row__content",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: procedure.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["Procedure · Updated ", formatDate(procedure.createdAt)] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pill pill--ready",
									children: "Ready"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })
							]
						}, procedure.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							detail: "Record a workflow to make it safely repeatable.",
							title: "Nothing in progress"
						}), handoffs.slice(0, 1).map((handoff) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							className: "work-row",
							to: "/handoffs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "work-row__icon work-row__icon--green",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "share" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "work-row__content",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: handoff.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: ["Handoff · Shared ", formatDate(handoff.createdAt)] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "pill",
									children: "Shared"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })
							]
						}, handoff.id))]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "input-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "input-title",
							children: "Needs your input"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/needs-input",
							children: "View queue"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "input-card",
						children: openRequests.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "input-card__icon",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "help" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "eyebrow",
								children: "Plan difference"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Benefits renewal needs a judgment call" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "The demonstrated plan is unavailable. No recipient-specific values are shared." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								className: "text-link",
								to: "/needs-input",
								children: ["Review difference ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
							})
						] })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							detail: "Material differences will pause here.",
							title: "Nothing needs input"
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dashboard-grid dashboard-grid--bottom",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "activity-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "activity-title",
							children: "Recent activity"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/activity",
							children: "Open audit trail"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "activity-card",
						children: activity.length ? activity.slice(0, 3).map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "activity-row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "activity-row__dot" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: event.toolName ?? event.kind }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: event.outcome ?? event.source })
							]
						}, event.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							detail: "Human actions and real WebMCP invocations will appear here.",
							title: "No activity yet"
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					"aria-labelledby": "webmcp-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "section-heading",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							id: "webmcp-title",
							children: "WebMCP"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/webmcp",
							children: "Inspector"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "webmcp-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "webmcp-card__glyph",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "bolt" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["WebMCP status: ", webmcpPresentation.shortLabel] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: webmcpPresentation.detail })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `pill ${webmcp.status === "available" ? "pill--ready" : ""}`,
								children: webmcpPresentation.shortLabel
							})
						]
					})]
				})]
			})
		]
	});
}
function AppRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DashboardPage, {}) });
}
//#endregion
export { AppRoute as component };
