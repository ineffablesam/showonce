//#region node_modules/.nitro/vite/services/ssr/assets/describeCommand-ZF5dEcVF.js
/**
* Turns a semantic command/event input into a short human-readable label.
* Shared between the recorder rail, procedure detail, and adaptation views so
* captured actions read the same way everywhere they appear.
*/
function describeCommand(input, plans = []) {
	switch (input.type) {
		case "select_plan": {
			const planId = typeof input.planId === "string" ? input.planId : null;
			const name = plans.find((plan) => plan.id === planId)?.name ?? planId;
			return name ? `Selected ${name} coverage` : "Selected coverage";
		}
		case "set_preference":
			if (input.key === "renewalFrequency") return input.value === "annual" ? "Set renewal to annual" : "Set renewal to monthly";
			if (input.key === "paperless") return input.value ? "Enabled paperless communication" : "Enabled paper communication";
			if (input.key === "communication") return `Set communication to ${String(input.value)}`;
			return "Updated a preference";
		case "set_address": return "Updated address";
		case "add_dependent": return "Added a dependent";
		case "review_recipient_details": return "Confirmed address and dependents";
		case "preview_renewal": return "Reviewed renewal summary";
		case "create_confirmation": return "Approved for 120 seconds";
		case "submit_renewal": return "Submitted renewal";
		case "record_decision": return "Recorded a decision";
		default: return input.type.replaceAll("_", " ");
	}
}
//#endregion
export { describeCommand as t };
