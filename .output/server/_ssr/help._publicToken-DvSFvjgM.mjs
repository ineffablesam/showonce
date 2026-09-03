import { r as require_jsx_runtime } from "../_libs/react+solar-icons__react.mjs";
import { t as Icon } from "./Icon-6S9CLHWQ.mjs";
import { t as useForm } from "../_libs/@tanstack/react-form+[...].mjs";
import { f as executeCommand, m as repositories, n as EmptyState, s as createDemoAccount, t as Card } from "./Card-BvuBlAzF.mjs";
import { a as useQueryClient, r as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as Route$4 } from "./router-VfESfXhW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/help._publicToken-DvSFvjgM.js
var import_jsx_runtime = require_jsx_runtime();
function HelperRoute() {
	const { publicToken } = Route$4.useParams();
	const queryClient = useQueryClient();
	const request = useQuery({
		queryKey: ["public-help-request", publicToken],
		queryFn: () => repositories.helpRequests.getByPublicToken(publicToken)
	});
	const decision = useQuery({
		queryKey: ["decision-for-request", publicToken],
		queryFn: () => repositories.decisions.pollByRequestToken(publicToken)
	});
	const form = useForm({
		defaultValues: { choice: "silver" },
		onSubmit: async ({ value }) => {
			const result = executeCommand({
				state: createDemoAccount(),
				source: "human",
				now: Date.now(),
				createId: () => crypto.randomUUID()
			}, value.choice === "let_recipient_decide" ? {
				type: "record_decision",
				requestId: publicToken,
				outcome: "let_recipient_decide"
			} : {
				type: "record_decision",
				requestId: publicToken,
				outcome: "recommend_plan",
				recommendedPlanId: value.choice
			});
			if (!result.decision) throw new Error("Decision was not created");
			await repositories.decisions.saveForRequestToken(publicToken, result.decision);
			await queryClient.invalidateQueries({ queryKey: ["decision-for-request", publicToken] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "helper-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "brand__mark",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "spark" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "ShowOnce decision request" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: request.isPending || decision.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			"aria-label": "Loading helper request",
			className: "page-loading"
		}) : !request.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			detail: "This request may be expired or unavailable.",
			title: "Request unavailable"
		}) }) : decision.data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "completion-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Decision sent to the recipient." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: decision.data.outcome === "recommend_plan" ? `${decision.data.recommendedPlanId} was explicitly recommended.` : "The recipient will make the plan choice." })]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "helper-decision",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Minimum information"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "The recipient cannot access the demonstrated Gold plan." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No address, dependents, account, or screen details were shared." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => {
						event.preventDefault();
						form.handleSubmit();
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(form.Field, {
						name: "choice",
						children: (field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
							className: "decision-options",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", { children: "Recommendation" }), [
								["silver", "Recommend Silver"],
								["platinum", "Recommend Platinum"],
								["let_recipient_decide", "Let the recipient decide"]
							].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								checked: field.state.value === value,
								name: field.name,
								onChange: () => field.handleChange(value),
								type: "radio"
							}), label] }, value))]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "button button--primary",
						type: "submit",
						children: "Send exact decision"
					})]
				})
			]
		}) })]
	});
}
//#endregion
export { HelperRoute as component };
