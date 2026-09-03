//#region node_modules/.nitro/vite/services/ssr/assets/validation-C0ioxYEO.js
var TOKEN_BYTES = 18;
var transitions = {
	created: ["opened", "expired"],
	opened: ["running", "expired"],
	running: [
		"needs_input",
		"waiting_confirmation",
		"completed",
		"expired"
	],
	needs_input: [
		"running",
		"waiting_confirmation",
		"expired"
	],
	waiting_confirmation: [
		"running",
		"completed",
		"expired"
	],
	completed: [],
	expired: []
};
function generatePublicToken() {
	return encodeRandom(TOKEN_BYTES);
}
function encodeRandom(size) {
	const bytes = crypto.getRandomValues(new Uint8Array(size));
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "");
}
function isPublicToken(value) {
	return /^[A-Za-z0-9_-]{24}$/u.test(value);
}
function isExpired(value, now = Date.now()) {
	return value.expiresAt !== void 0 && value.expiresAt <= now;
}
function assertHandoffTransition(from, to) {
	if (!transitions[from].includes(to)) throw new Error(`Illegal handoff status transition: ${from} → ${to}`);
}
var MAX_JSON_BYTES = 65536;
var MAX_TITLE = 120;
var MAX_NOTE = 500;
var MAX_RECIPIENT_NAME = 80;
var SENSITIVE_KEY = /password|authorization|credential|session|payment|card|cookie|secret|authToken/iu;
function assertRecord(value, label) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object`);
	return value;
}
function assertExactKeys(record, allowed, label) {
	const unexpected = Object.keys(record).find((key) => !allowed.includes(key));
	if (unexpected) {
		if (SENSITIVE_KEY.test(unexpected)) throw new Error(`${label} contains a sensitive field: ${unexpected}`);
		throw new Error(`${label} contains an unsupported field: ${unexpected}`);
	}
}
function assertString(value, label, maximum) {
	if (typeof value !== "string" || value.trim().length === 0 || value.length > maximum) throw new Error(`${label} is invalid or exceeds ${maximum} characters`);
}
function assertFiniteNumber(value, label) {
	if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`${label} must be a finite number`);
}
function assertSafeJson(value, label) {
	const seen = /* @__PURE__ */ new WeakSet();
	const visit = (candidate) => {
		if (candidate === null || typeof candidate !== "object") return;
		if (seen.has(candidate)) throw new Error(`${label} must not be cyclic`);
		seen.add(candidate);
		if (Array.isArray(candidate)) {
			for (const item of candidate) visit(item);
			return;
		}
		for (const [key, nested] of Object.entries(candidate)) {
			if (SENSITIVE_KEY.test(key)) throw new Error(`${label} contains a sensitive field: ${key}`);
			visit(nested);
		}
	};
	visit(value);
	const json = JSON.stringify(value);
	if (new TextEncoder().encode(json).byteLength > MAX_JSON_BYTES) throw new Error(`${label} exceeds ${MAX_JSON_BYTES} bytes`);
}
function validateProcedureStep(value) {
	const step = assertRecord(value, "Procedure step");
	assertExactKeys(step, [
		"id",
		"commandType",
		"policy",
		"input"
	], "Procedure step");
	assertString(step.id, "Procedure step id", 128);
	const input = assertRecord(step.input, "Procedure step input");
	if (![
		"set_preference",
		"select_plan",
		"review_recipient_details",
		"preview_renewal",
		"create_confirmation",
		"submit_renewal"
	].includes(String(step.commandType)) || input.type !== step.commandType) throw new Error("Procedure step command is invalid");
	assertExactKeys(input, step.commandType === "set_preference" ? [
		"type",
		"key",
		"value"
	] : step.commandType === "select_plan" ? [
		"type",
		"planId",
		"observedMonthlyPrice"
	] : ["type"], "Procedure step input");
	const expectedPolicy = {
		set_preference: "safe_preference",
		select_plan: "availability_checked",
		review_recipient_details: "recipient_specific",
		preview_renewal: "state_check",
		create_confirmation: "confirmation_required",
		submit_renewal: "confirmation_required"
	}[String(step.commandType)];
	if (step.policy !== expectedPolicy) throw new Error("Procedure step policy does not match its command");
	if (step.commandType === "set_preference" && ![
		"paperless",
		"communication",
		"renewalFrequency"
	].includes(String(input.key)) || step.commandType === "select_plan" && (typeof input.planId !== "string" || input.planId.length === 0 || input.planId.length > 64)) throw new Error("Procedure step input is invalid");
	if (step.commandType === "set_preference" && (input.key === "paperless" && typeof input.value !== "boolean" || input.key === "communication" && input.value !== "email" && input.value !== "mail" || input.key === "renewalFrequency" && input.value !== "monthly" && input.value !== "annual")) throw new Error("Procedure step preference value is invalid");
	if (step.commandType === "select_plan" && input.observedMonthlyPrice !== void 0 && (typeof input.observedMonthlyPrice !== "number" || !Number.isFinite(input.observedMonthlyPrice) || input.observedMonthlyPrice < 0)) throw new Error("Procedure step observed price is invalid");
}
function assertPublicToken(value) {
	if (!isPublicToken(value)) throw new Error("Invalid public token; expected 24 base64url characters");
}
function validateProcedure(value) {
	const record = assertRecord(value, "Procedure");
	assertExactKeys(record, [
		"id",
		"recordingId",
		"title",
		"createdAt",
		"sourceEventIds",
		"steps"
	], "Procedure");
	assertString(record.id, "Procedure id", 128);
	assertString(record.recordingId, "Recording id", 128);
	assertString(record.title, "Procedure title", MAX_TITLE);
	assertFiniteNumber(record.createdAt, "Procedure createdAt");
	if (!Array.isArray(record.sourceEventIds) || !Array.isArray(record.steps)) throw new Error("Procedure arrays are invalid");
	if (record.steps.length > 100 || record.sourceEventIds.length > 100) throw new Error("Procedure contains too many steps or source events");
	for (const step of record.steps) validateProcedureStep(step);
	assertSafeJson(record, "Procedure");
	return structuredClone(value);
}
function validateHandoff(value) {
	const record = assertRecord(value, "Handoff");
	assertExactKeys(record, [
		"id",
		"publicToken",
		"procedureId",
		"title",
		"createdAt",
		"updatedAt",
		"status",
		"procedure",
		"recipient",
		"note",
		"expiresAt",
		"policy"
	], "Handoff");
	assertString(record.id, "Handoff id", 128);
	assertString(record.procedureId, "Procedure id", 128);
	assertString(record.title, "Handoff title", MAX_TITLE);
	if (typeof record.publicToken !== "string") throw new Error("Handoff public token is required");
	assertPublicToken(record.publicToken);
	if (record.note !== void 0) assertString(record.note, "Handoff note", MAX_NOTE);
	if (record.recipient !== void 0 && record.recipient !== null) assertString(record.recipient, "Handoff recipient", MAX_RECIPIENT_NAME);
	if (record.procedure !== void 0) validateProcedure(record.procedure);
	if (record.policy !== void 0) {
		const policy = assertRecord(record.policy, "Handoff policy");
		assertExactKeys(policy, [
			"allowSafePreferences",
			"requireConfirmation",
			"allowHelperEscalation"
		], "Handoff policy");
		if (Object.values(policy).some((setting) => typeof setting !== "boolean")) throw new Error("Handoff policy is invalid");
	}
	assertFiniteNumber(record.createdAt, "Handoff createdAt");
	assertFiniteNumber(record.expiresAt, "Handoff expiresAt");
	if (record.expiresAt <= record.createdAt) throw new Error("Handoff expiry must follow creation");
	if (record.status !== "created") throw new Error("New handoff status must be created");
	assertSafeJson(record, "Handoff");
	return structuredClone(value);
}
function validateHelpRequest(value) {
	const record = assertRecord(value, "Helper request");
	assertExactKeys(record, [
		"id",
		"publicToken",
		"handoffId",
		"createdAt",
		"updatedAt",
		"expiresAt",
		"status",
		"detail",
		"options"
	], "Helper request");
	assertString(record.id, "Helper request id", 128);
	if (typeof record.publicToken !== "string") throw new Error("Helper request public token is required");
	assertPublicToken(record.publicToken);
	assertFiniteNumber(record.createdAt, "Helper request createdAt");
	assertFiniteNumber(record.expiresAt, "Helper request expiresAt");
	if (record.expiresAt <= record.createdAt) throw new Error("Helper request expiry must follow creation");
	if (record.status !== "open" && record.status !== "resolved" || record.detail !== "plan_unavailable" || !Array.isArray(record.options) || record.options.length === 0 || record.options.length > 3) throw new Error("Helper request DTO is invalid");
	if (!record.options.every((option) => [
		"silver",
		"platinum",
		"let_recipient_decide"
	].includes(String(option)))) throw new Error("Helper request option is invalid");
	assertSafeJson(record, "Helper request");
	return structuredClone(value);
}
function validateDecision(value) {
	const record = assertRecord(value, "Helper decision");
	assertExactKeys(record, [
		"id",
		"requestId",
		"outcome",
		"decidedAt",
		"recommendedPlanId"
	], "Helper decision");
	assertString(record.id, "Helper decision id", 128);
	assertFiniteNumber(record.decidedAt, "Helper decision decidedAt");
	if (record.outcome !== "recommend_plan" && record.outcome !== "let_recipient_decide") throw new Error("Helper decision outcome is invalid");
	if (record.outcome === "recommend_plan" && record.recommendedPlanId !== "silver" && record.recommendedPlanId !== "platinum") throw new Error("Helper decision recommendation is invalid");
	if (record.outcome === "let_recipient_decide" && record.recommendedPlanId !== void 0) throw new Error("Helper decision recommendation must be omitted");
	assertSafeJson(record, "Helper decision");
	return structuredClone(value);
}
function validateActivity(value) {
	const record = assertRecord(value, "Activity event");
	assertExactKeys(record, [
		"id",
		"kind",
		"timestamp",
		"source",
		"toolName",
		"commandType",
		"policy",
		"outcome"
	], "Activity event");
	assertString(record.id, "Activity id", 128);
	assertFiniteNumber(record.timestamp, "Activity timestamp");
	if (!["command", "webmcp_invocation"].includes(String(record.kind)) || ![
		"human",
		"webmcp",
		"system"
	].includes(String(record.source)) || record.commandType !== void 0 && ![
		"set_preference",
		"select_plan",
		"set_address",
		"add_dependent",
		"review_recipient_details",
		"preview_renewal",
		"create_confirmation",
		"submit_renewal",
		"record_decision"
	].includes(String(record.commandType)) || record.policy !== void 0 && ![
		"safe_preference",
		"availability_checked",
		"never_transfer",
		"recipient_specific",
		"state_check",
		"confirmation_required",
		"human_judgment"
	].includes(String(record.policy)) || record.outcome !== void 0 && ![
		"applied",
		"refused",
		"read",
		"aborted",
		"error"
	].includes(String(record.outcome)) || record.toolName !== void 0 && ![
		"showonce_get_handoff",
		"benefits_get_account_state",
		"benefits_get_current_plan",
		"benefits_get_available_plans",
		"showonce_compare_to_handoff",
		"benefits_apply_safe_preferences",
		"benefits_set_renewal_period",
		"benefits_set_paperless",
		"benefits_preview_renewal",
		"showonce_request_helper",
		"showonce_get_helper_decision",
		"benefits_submit_renewal"
	].includes(String(record.toolName))) throw new Error("Activity enum is invalid");
	if (record.kind === "webmcp_invocation" && (record.source !== "webmcp" || typeof record.toolName !== "string" || record.commandType !== void 0 || record.policy !== void 0) || record.kind === "command" && (typeof record.commandType !== "string" || typeof record.policy !== "string" || record.toolName !== void 0)) throw new Error("Activity discriminated schema is invalid");
	assertSafeJson(record, "Activity event");
	return structuredClone(value);
}
function validatePublicHandoff(value) {
	const record = assertRecord(value, "Public handoff");
	assertExactKeys(record, [
		"publicToken",
		"title",
		"createdAt",
		"expiresAt",
		"status",
		"procedure",
		"policy",
		"recipient"
	], "Public handoff");
	if (typeof record.publicToken !== "string") throw new Error("Public handoff token is missing");
	assertPublicToken(record.publicToken);
	assertString(record.title, "Handoff title", MAX_TITLE);
	if (record.recipient !== void 0 && record.recipient !== null) assertString(record.recipient, "Handoff recipient", MAX_RECIPIENT_NAME);
	assertFiniteNumber(record.createdAt, "Handoff createdAt");
	assertFiniteNumber(record.expiresAt, "Handoff expiresAt");
	if (![
		"created",
		"opened",
		"running",
		"needs_input",
		"waiting_confirmation",
		"completed",
		"expired"
	].includes(String(record.status))) throw new Error("Public handoff status is invalid");
	if (record.procedure === void 0 || record.policy === void 0) throw new Error("Public handoff procedure is missing");
	const procedure = assertRecord(record.procedure, "Public procedure");
	assertExactKeys(procedure, ["title", "steps"], "Public procedure");
	assertString(procedure.title, "Public procedure title", MAX_TITLE);
	if (!Array.isArray(procedure.steps) || procedure.steps.length > 100) throw new Error("Public procedure steps are invalid");
	for (const [index, stepValue] of procedure.steps.entries()) {
		const step = assertRecord(stepValue, "Public procedure step");
		assertExactKeys(step, [
			"commandType",
			"policy",
			"input"
		], "Public procedure step");
		validateProcedureStep({
			...step,
			id: `public-${index}`
		});
	}
	const policy = assertRecord(record.policy, "Public handoff policy");
	assertExactKeys(policy, [
		"allowSafePreferences",
		"requireConfirmation",
		"allowHelperEscalation"
	], "Public handoff policy");
	if (Object.values(policy).some((setting) => typeof setting !== "boolean")) throw new Error("Public handoff policy is invalid");
	assertSafeJson(record, "Public handoff");
	return structuredClone(record);
}
function validatePublicHelpRequest(value) {
	const record = assertRecord(value, "Public helper request");
	assertExactKeys(record, [
		"publicToken",
		"expiresAt",
		"status",
		"detail",
		"options"
	], "Public helper request");
	if (typeof record.publicToken !== "string") throw new Error("Public helper request token is missing");
	assertPublicToken(record.publicToken);
	assertFiniteNumber(record.expiresAt, "Helper request expiresAt");
	if (record.status !== "open" && record.status !== "resolved" || record.detail !== "plan_unavailable" || !Array.isArray(record.options) || record.options.length === 0 || record.options.length > 3) throw new Error("Public helper request DTO is invalid");
	if (!record.options.every((option) => [
		"silver",
		"platinum",
		"let_recipient_decide"
	].includes(String(option)))) throw new Error("Public helper request option is invalid");
	assertSafeJson(record, "Public helper request");
	return structuredClone(record);
}
//#endregion
export { validateActivity as a, validateHelpRequest as c, validatePublicHelpRequest as d, isExpired as i, validateProcedure as l, assertPublicToken as n, validateDecision as o, generatePublicToken as r, validateHandoff as s, assertHandoffTransition as t, validatePublicHandoff as u };
