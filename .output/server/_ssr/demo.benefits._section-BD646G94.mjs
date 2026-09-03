import { i as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+solar-icons__react.mjs";
import { t as Icon } from "./Icon-6S9CLHWQ.mjs";
import { _ as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as resetDemo, i as applyRecordedCommand, m as repositories, n as EmptyState, p as finishRecording, t as Card } from "./Card-BvuBlAzF.mjs";
import { a as useQueryClient, r as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as Route } from "./router-VfESfXhW.mjs";
import { t as NorthstarApp } from "./NorthstarApp-DC4PElI6.mjs";
import { t as describeCommand } from "./describeCommand-ZF5dEcVF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/demo.benefits._section-BD646G94.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Presentational browser-chrome wrapper. Renders in the same DOM as the
* ShowOnce shell (no real iframe) so WebMCP tools registered on the
* top-level document keep working, while visually communicating "this is a
* separate website that ShowOnce is operating around."
*/
function BrowserFrame({ url, onRefresh, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "browser-frame",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "browser-frame__bar",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "browser-frame__dots",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "browser-frame__address",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "lock" }), url]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "browser-frame__actions",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						"aria-label": "Refresh",
						className: "browser-frame__icon-button",
						onClick: onRefresh,
						title: "Refresh",
						type: "button",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "refresh" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						"aria-label": "Open in new tab (visual only in this demo)",
						className: "browser-frame__icon-button",
						disabled: true,
						title: "Open externally",
						type: "button",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "external" })
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "browser-frame__viewport",
			children
		})]
	});
}
function useElapsedSeconds(startedAt) {
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const interval = window.setInterval(() => setNow(Date.now()), 1e3);
		return () => window.clearInterval(interval);
	}, []);
	return Math.max(0, Math.floor((now - startedAt) / 1e3));
}
function formatClock(totalSeconds) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
/**
* Left-hand teaching panel. Shows only what ShowOnce automatically captured
* from real UI interactions with the connected demo app on the right — there
* is no manual step picker here.
*/
function RecorderRail({ startedAt, events, plans, readyToFinish, finishing, onFinish, onReset }) {
	const elapsed = useElapsedSeconds(startedAt);
	const applied = events.filter((event) => event.status === "applied");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		"aria-label": "ShowOnce recorder",
		className: "recorder-rail",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "recorder-rail__brand",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "brand__mark",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "spark" })
				}), "ShowOnce"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "recorder-rail__status",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "recorder-rail__pulse" }),
					"Showing",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "recorder-rail__clock",
						children: formatClock(elapsed)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "recorder-rail__section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Actions captured"
				}), applied.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "recorder-rail__empty",
					children: "Use Northstar Benefits on the right — every meaningful choice is captured automatically."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "recorder-rail__list",
					children: applied.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "check" }), describeCommand({
						type: event.commandType,
						...event.input
					}, plans)] }, event.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "button button--primary recorder-rail__finish",
				disabled: finishing || !readyToFinish,
				onClick: onFinish,
				title: readyToFinish ? "Compile this recording" : "Finish the renewal in Northstar Benefits first",
				type: "button",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "check" }), "Finish showing"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "recorder-rail__reset",
				onClick: onReset,
				type: "button",
				children: "Reset demo"
			})
		]
	});
}
function BenefitsRoute() {
	const { recording: recordingId } = Route.useSearch();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const confirmationRef = (0, import_react.useRef)(void 0);
	const [addressConfirmed, setAddressConfirmed] = (0, import_react.useState)(false);
	const accountId = "samuel";
	const accountQuery = useQuery({
		queryKey: ["account", accountId],
		queryFn: () => repositories.accounts.get(accountId)
	});
	const recordingQuery = useQuery({
		queryKey: ["recording", recordingId],
		queryFn: () => recordingId ? repositories.recordings.get(recordingId) : null
	});
	const action = useMutation({
		mutationFn: async (command) => {
			const account = accountQuery.data;
			if (!recordingId || !account) throw new Error("Recording context missing");
			const confirmation = confirmationRef.current;
			const commandWithConfirmation = command.type === "submit_renewal" && confirmation ? {
				...command,
				confirmationToken: confirmation.token
			} : command;
			const result = await applyRecordedCommand(repositories, recordingId, account, commandWithConfirmation, {
				confirmation,
				createToken: () => crypto.randomUUID()
			});
			if (result.confirmation) confirmationRef.current = result.confirmation;
			return result;
		},
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: ["account", accountId] }),
				queryClient.invalidateQueries({ queryKey: ["recording", recordingId] }),
				queryClient.invalidateQueries({ queryKey: ["activity"] })
			]);
		}
	});
	const finish = useMutation({
		mutationFn: () => {
			if (!recordingId) throw new Error("Recording context missing");
			return finishRecording(repositories, recordingId);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["procedures"] });
			await navigate({
				to: "/recordings/$id",
				params: { id: recordingId ?? "" }
			});
		}
	});
	(0, import_react.useEffect)(() => {
		if (recordingQuery.data?.status === "finished") navigate({
			to: "/recordings/$id",
			params: { id: recordingQuery.data.id }
		});
	}, [
		navigate,
		recordingQuery.data?.id,
		recordingQuery.data?.status
	]);
	const reset = async () => {
		await resetDemo(repositories);
		await queryClient.invalidateQueries();
	};
	if (accountQuery.isPending || recordingQuery.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-label": "Loading benefits",
		className: "page-loading",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})]
	});
	if (!recordingId || !recordingQuery.data || !accountQuery.data || recordingQuery.data.status !== "capturing") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "teaching-empty",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			detail: "Start a New ShowOnce from the workspace to open Northstar Benefits and begin recording.",
			title: "No active recording"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			className: "button button--primary",
			to: "/app",
			children: "Back to workspace"
		})] })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "teaching-layout",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecorderRail, {
			events: recordingQuery.data.events,
			finishing: finish.isPending,
			onFinish: () => finish.mutate(),
			onReset: () => void reset(),
			plans: accountQuery.data.availablePlans,
			readyToFinish: accountQuery.data.submittedAt !== null,
			startedAt: recordingQuery.data.createdAt
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "teaching-layout__frame",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrowserFrame, {
				url: "benefits.northstar.demo",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NorthstarApp, {
					account: accountQuery.data,
					addressConfirmed,
					memberName: "Samuel",
					mode: "demonstrator",
					onAddressConfirm: () => setAddressConfirmed(true),
					runCommand: (command) => action.mutateAsync(command)
				})
			})
		})]
	});
}
//#endregion
export { BenefitsRoute as component };
