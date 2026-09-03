import { i as __toESM } from "../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../_libs/react+solar-icons__react.mjs";
import { t as Icon } from "./Icon-6S9CLHWQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/NorthstarApp-CWj2r21G.js
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
var NAV_ITEMS = [
	{
		screen: "overview",
		label: "Overview",
		icon: "grid"
	},
	{
		screen: "coverage",
		label: "Coverage",
		icon: "clipboard"
	},
	{
		screen: "dependents",
		label: "Dependents",
		icon: "users"
	},
	{
		screen: "claims",
		label: "Claims",
		icon: "activity"
	},
	{
		screen: "documents",
		label: "Documents",
		icon: "file"
	},
	{
		screen: "profile",
		label: "Profile",
		icon: "settings"
	}
];
function resolvePlan(account) {
	const id = account.selectedPlanId ?? account.availablePlans.find((plan) => plan.id === "gold")?.id ?? account.availablePlans[0]?.id;
	return account.availablePlans.find((plan) => plan.id === id);
}
function NorthstarApp({ memberName, account, mode, runCommand, initialScreen = "overview", addressConfirmed, onAddressConfirm, submissionHint }) {
	const [screen, setScreen] = (0, import_react.useState)(initialScreen);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)();
	const previousSubmittedAt = (0, import_react.useRef)(account.submittedAt);
	(0, import_react.useEffect)(() => {
		if (previousSubmittedAt.current === null && account.submittedAt !== null) setScreen("renewal-done");
		previousSubmittedAt.current = account.submittedAt;
	}, [account.submittedAt]);
	const plan = resolvePlan(account);
	const act = async (command) => {
		setBusy(true);
		setError(void 0);
		try {
			const result = await runCommand(command);
			if (!result.ok) setError(describeRefusal(result.reason));
			return result;
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-app",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "northstar-app__header",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "northstar-app__brand",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "northstar-app__mark",
					children: "N"
				}), "Northstar Benefits"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "northstar-app__member",
				children: ["Signed in as ", memberName]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "northstar-app__layout",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Northstar Benefits",
				className: "northstar-app__nav",
				children: NAV_ITEMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: screen === item.screen || item.screen === "coverage" && screen === "dental" || item.screen === "overview" && screen.startsWith("renewal") ? "northstar-app__nav-active" : "",
					onClick: () => setScreen(item.screen),
					type: "button",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: item.icon }), item.label]
				}, item.screen))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "northstar-app__main",
				children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "northstar-app__error",
					role: "alert",
					children: error
				}) : null, screen === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OverviewScreen, {
					account,
					memberName,
					onNavigate: setScreen,
					plan
				}) : screen === "coverage" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverageScreen, {
					onNavigate: setScreen,
					plan
				}) : screen === "dental" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DentalDetailScreen, {
					account,
					busy,
					onManage: async () => {
						if (account.selectedPlanId === null && plan) await act({
							type: "select_plan",
							planId: plan.id
						});
						setScreen(account.submittedAt !== null ? "renewal-done" : account.selectedPlanId !== null ? "renewal-4" : "renewal-1");
					},
					plan
				}) : screen === "renewal-1" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RenewalStep1, {
					account,
					busy,
					onChangeFrequency: (value) => void act({
						type: "set_preference",
						key: "renewalFrequency",
						value
					}),
					onContinue: () => setScreen("renewal-2"),
					plan
				}) : screen === "renewal-2" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RenewalStep2, {
					account,
					addressConfirmed,
					busy,
					onConfirmAddress: async () => {
						await act({ type: "review_recipient_details" });
						onAddressConfirm();
					},
					onContinue: () => setScreen("renewal-3")
				}) : screen === "renewal-3" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RenewalStep3, {
					account,
					busy,
					onContinue: async () => {
						await act({ type: "preview_renewal" });
						setScreen("renewal-4");
					},
					onTogglePaperless: (enabled) => void act({
						type: "set_preference",
						key: "paperless",
						value: enabled
					})
				}) : screen === "renewal-4" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RenewalReview, {
					account,
					busy,
					mode,
					onSubmit: mode === "demonstrator" ? async () => {
						const confirmed = await act({ type: "create_confirmation" });
						if (!confirmed.confirmation) return;
						await act({
							type: "submit_renewal",
							confirmationToken: confirmed.confirmation.token
						});
					} : void 0,
					plan,
					submissionHint
				}) : screen === "renewal-done" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RenewalDoneScreen, {
					onBack: () => setScreen("overview"),
					plan
				}) : screen === "dependents" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DependentsScreen, { account }) : screen === "claims" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimsScreen, {}) : screen === "documents" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocumentsScreen, { account }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileScreen, {
					account,
					memberName
				})]
			})]
		})]
	});
}
function describeRefusal(reason) {
	switch (reason) {
		case "plan_unavailable": return "That plan is not available on this account.";
		case "confirmation_required":
		case "requires_user_confirmation": return "This needs confirmation before it can be applied.";
		case "confirmation_invalid":
		case "confirmation_expired": return "That confirmation is no longer valid.";
		case "already_submitted": return "This renewal was already submitted.";
		case "plan_required": return "Choose a plan before continuing.";
		case "judgment_required": return "This choice needs a person to decide.";
		default: return "That action could not be completed.";
	}
}
function StatusChip({ tone, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `status-chip status-chip--${tone}`,
		children
	});
}
function OverviewScreen({ memberName, account, plan, onNavigate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "northstar-screen__heading",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "eyebrow",
						children: "2027 enrollment"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: ["Welcome, ", memberName] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Here is everything active on this account right now." })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "coverage-cards",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "coverage-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "coverage-card__label",
							children: "Dental"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [plan?.name ?? "No plan selected", " Dental"] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "coverage-card__price",
							children: plan ? `$${plan.monthlyPrice}/month` : "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {
							tone: "active",
							children: "Active"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "coverage-card coverage-card--static",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "coverage-card__label",
							children: "Medical"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Standard PPO" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "coverage-card__price",
							children: "Managed separately"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {
							tone: "active",
							children: "Active"
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overview-stats",
				"aria-label": "Live account details",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Renewal frequency" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.preferences.renewalFrequency === "annual" ? "Annual" : "Monthly" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Paperless" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.preferences.paperless ? "On" : "Off" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.address })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Dependents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.dependents.length })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "upcoming-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Upcoming"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Dental renewal due" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "button button--primary",
					onClick: () => onNavigate("dental"),
					type: "button",
					children: ["Review renewal ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
				})]
			})
		]
	});
}
function CoverageScreen({ plan, onNavigate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "northstar-screen__heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Coverage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Your active lines of coverage for this enrollment year." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "coverage-row",
				onClick: () => onNavigate("dental"),
				type: "button",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [plan?.name ?? "Dental", " Dental"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: plan ? `$${plan.monthlyPrice}/month` : "Not yet selected" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {
						tone: "active",
						children: "Active"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "coverage-row coverage-row--static",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Standard PPO" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Medical · managed separately" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {
					tone: "active",
					children: "Active"
				})]
			})
		]
	});
}
function DentalDetailScreen({ plan, account, onManage, busy }) {
	const renewed = account.submittedAt !== null;
	const inProgress = account.selectedPlanId !== null && !renewed;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "northstar-screen__heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "eyebrow",
					children: "Dental coverage"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", { children: [plan?.name ?? "Dental", " Dental"] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "detail-facts",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Current price" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: plan ? `$${plan.monthlyPrice}/month` : "—" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Dependents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.dependents.length })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Renewal" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: renewed ? "Renewed" : "Available" })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "button button--primary button--large",
				disabled: busy,
				onClick: onManage,
				type: "button",
				children: [renewed ? "View renewal" : inProgress ? "Continue renewal" : "Manage coverage", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
			})
		]
	});
}
function RenewalStep1({ plan, account, onChangeFrequency, onContinue, busy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen renewal-wizard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "renewal-wizard__steps",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "renewal-wizard__step--active",
						children: "Frequency"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Address" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Communication" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Review" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "northstar-screen__heading",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "eyebrow",
						children: ["Renew ", plan?.name ?? "coverage"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Renewal frequency" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"Current plan: ",
						plan?.name ?? "—",
						" Dental"
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "radio-row",
				role: "radiogroup",
				children: ["monthly", "annual"].map((value) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "radio-option",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						checked: (account.preferences.renewalFrequency ?? "monthly") === value,
						disabled: busy,
						name: "renewal-frequency",
						onChange: () => onChangeFrequency(value),
						type: "radio"
					}), value === "monthly" ? "Monthly" : "Annual"]
				}, value))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "button button--primary",
				onClick: onContinue,
				type: "button",
				children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
			})
		]
	});
}
function RenewalStep2({ account, addressConfirmed, onConfirmAddress, onContinue, busy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen renewal-wizard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "renewal-wizard__steps",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Frequency" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "renewal-wizard__step--active",
						children: "Address"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Communication" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Review" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "northstar-screen__heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: account.address })]
			}),
			addressConfirmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {
				tone: "active",
				children: "Confirmed"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {
				tone: "warn",
				children: "Needs confirmation"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--ghost",
				disabled: busy,
				onClick: () => void onConfirmAddress(),
				type: "button",
				children: "Confirm address is current"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "button button--primary",
				disabled: !addressConfirmed,
				onClick: onContinue,
				type: "button",
				children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
			})
		]
	});
}
function RenewalStep3({ account, onTogglePaperless, onContinue, busy }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen renewal-wizard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "renewal-wizard__steps",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Frequency" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Address" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "renewal-wizard__step--active",
						children: "Communication"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Review" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "northstar-screen__heading",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Communication" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "toggle-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Paper notices" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.preferences.paperless ? "Disabled" : "Enabled" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "toggle-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Paperless" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "switch",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						"aria-label": "Paperless",
						checked: account.preferences.paperless,
						disabled: busy,
						onChange: (event) => onTogglePaperless(event.target.checked),
						type: "checkbox"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "switch__track" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "button button--primary",
				disabled: busy,
				onClick: () => void onContinue(),
				type: "button",
				children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "arrow" })]
			})
		]
	});
}
function RenewalReview({ plan, account, mode, onSubmit, busy, submissionHint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen renewal-wizard",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "renewal-wizard__steps",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Frequency" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Address" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Communication" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "renewal-wizard__step--active",
						children: "Review"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "northstar-screen__heading",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Review" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "review-summary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Plan" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [plan?.name ?? "—", " Dental"] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Frequency" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.preferences.renewalFrequency === "annual" ? "Annual" : "Monthly" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Price" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: plan ? `$${plan.monthlyPrice}/month` : "—" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Dependents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.dependents.length })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Paperless" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.preferences.paperless ? "Enabled" : "Disabled" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Updated" })] })
				]
			}),
			mode === "demonstrator" && onSubmit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--primary button--large",
				disabled: busy || account.submittedAt !== null,
				onClick: () => void onSubmit(),
				type: "button",
				children: "Submit Renewal"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "northstar-app__hint",
				children: submissionHint ?? "Final submission needs your confirmation in the ShowOnce panel →"
			})
		]
	});
}
function RenewalDoneScreen({ plan, onBack }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen renewal-done",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "renewal-done__mark",
				"data-state": "in",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "check" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Coverage renewed." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [plan?.name ?? "Your plan", " Dental is renewed for the year ahead."] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "button button--ghost",
				onClick: onBack,
				type: "button",
				children: "Back to Overview"
			})
		]
	});
}
function DependentsScreen({ account }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "northstar-screen__heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Dependents" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [account.dependents.length, " covered on this account."] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "dependents-list",
				children: account.dependents.map((name) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "dependents-list__row",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "dependents-list__avatar",
							children: name.charAt(0)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: name }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusChip, {
							tone: "active",
							children: "Covered"
						})
					]
				}, name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "button button--ghost",
				disabled: true,
				title: "Not available in this demo",
				type: "button",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "plus" }), " Add dependent"]
			})
		]
	});
}
function ClaimsScreen() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "northstar-screen__heading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Claims" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "empty-panel",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "activity" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "No claims filed" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Claims submitted for covered services will appear here." })
			]
		})]
	});
}
function DocumentsScreen({ account }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "northstar-screen__heading",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Documents" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "document-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "file" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "2027 enrollment summary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: account.preferences.paperless ? "Delivered electronically" : "Mailed" })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "empty-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { name: "file" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "No other documents yet" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Renewal confirmations will be added here once submitted." })
				]
			})
		]
	});
}
function ProfileScreen({ account, memberName }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "northstar-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "northstar-screen__heading",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Profile" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "profile-facts",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Member" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: memberName })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Account" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.id })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.address })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Communication" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: account.preferences.communication === "email" ? "Email" : "Mail" })] })
			]
		})]
	});
}
//#endregion
export { NorthstarApp as n, BrowserFrame as t };
