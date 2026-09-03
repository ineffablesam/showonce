import { i as require_jsx_runtime } from "../_libs/@tanstack/react-form+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as validateActivity, c as validateHelpRequest, d as validatePublicHelpRequest, i as isExpired, l as validateProcedure, n as assertPublicToken, o as validateDecision, r as generatePublicToken, s as validateHandoff, t as assertHandoffTransition, u as validatePublicHandoff } from "./validation-DwDmZNjF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Card-NQF5GieP.js
var import_jsx_runtime = require_jsx_runtime();
var ACTION_POLICIES = {
	set_preference: "safe_preference",
	set_address: "recipient_specific",
	add_dependent: "recipient_specific",
	review_recipient_details: "recipient_specific",
	preview_renewal: "state_check",
	select_plan: "availability_checked",
	create_confirmation: "confirmation_required",
	submit_renewal: "confirmation_required",
	record_decision: "judgment_required"
};
function policyForCommand(command) {
	return ACTION_POLICIES[command.type];
}
function isPortablePolicy(policy) {
	return policy !== "judgment_required";
}
var SENSITIVE_KEY = /(password|credential|session|api.?key|token|selector|coordinate|screenshot|address|dependent)/i;
function sanitize(value, seen) {
	if (value === null || typeof value !== "object") return value;
	if (seen.has(value)) return;
	seen.add(value);
	if (Array.isArray(value)) return value.map((item) => sanitize(item, seen));
	const result = {};
	for (const [key, nestedValue] of Object.entries(value)) {
		if (SENSITIVE_KEY.test(key)) continue;
		const sanitizedValue = sanitize(nestedValue, seen);
		if (sanitizedValue !== void 0) result[key] = sanitizedValue;
	}
	return result;
}
function sanitizeSensitive(value) {
	return sanitize(value, /* @__PURE__ */ new WeakSet());
}
var CONFIRMATION_TTL_MS = 12e4;
var DECISION_OUTCOMES = /* @__PURE__ */ new Set([
	"choose_demonstrated",
	"choose_alternative",
	"recommend_plan",
	"let_recipient_decide",
	"cancel"
]);
function isValidPreference(command) {
	return command.key === "paperless" && typeof command.value === "boolean" || command.key === "communication" && (command.value === "email" || command.value === "mail") || command.key === "renewalFrequency" && (command.value === "annual" || command.value === "monthly");
}
function safeEventInput(command, authoritativePlanPrice) {
	switch (command.type) {
		case "set_preference": {
			const runtimeCommand = command;
			if (isValidPreference(runtimeCommand)) return {
				type: command.type,
				key: runtimeCommand.key,
				value: runtimeCommand.value
			};
			return { type: command.type };
		}
		case "select_plan": return {
			type: command.type,
			planId: command.planId,
			...authoritativePlanPrice === void 0 ? {} : { observedMonthlyPrice: authoritativePlanPrice }
		};
		case "record_decision": return {
			type: command.type,
			requestId: command.requestId,
			outcome: command.outcome,
			...command.recommendedPlanId ? { recommendedPlanId: command.recommendedPlanId } : {}
		};
		default: return { type: command.type };
	}
}
function eventFor(context, command, status, authoritativePlanPrice) {
	return {
		id: context.createId(),
		commandType: command.type,
		source: context.source,
		timestamp: context.now,
		policy: policyForCommand(command),
		status,
		input: sanitizeSensitive(safeEventInput(command, authoritativePlanPrice))
	};
}
function refused(context, command, reason) {
	return {
		ok: false,
		state: context.state,
		reason,
		event: eventFor(context, command, "refused")
	};
}
function withPreferences(state, command) {
	if (command.key === "paperless") return {
		...state,
		preferences: {
			...state.preferences,
			paperless: command.value
		}
	};
	if (command.key === "renewalFrequency") return {
		...state,
		preferences: {
			...state.preferences,
			renewalFrequency: command.value
		}
	};
	return {
		...state,
		preferences: {
			...state.preferences,
			communication: command.value
		}
	};
}
function executeCommand(context, command) {
	if (command.type === "create_confirmation") {
		if (context.source === "webmcp") return refused(context, command, "requires_user_confirmation");
		const confirmation = {
			token: (context.createToken ?? (() => globalThis.crypto.randomUUID()))(),
			createdAt: context.now,
			expiresAt: context.now + CONFIRMATION_TTL_MS
		};
		return {
			ok: true,
			state: context.state,
			confirmation,
			event: eventFor(context, command, "applied")
		};
	}
	if (command.type === "set_preference" && !isValidPreference(command)) return refused(context, command, "invalid_command");
	if (command.type === "select_plan") {
		if (context.source === "webmcp" && context.planSelectionGuard?.requiresJudgment && context.planAuthorization?.planId !== command.planId) return refused(context, command, "judgment_required");
		const plan = context.state.availablePlans.find(({ id }) => id === command.planId);
		if (!plan) return refused(context, command, "plan_unavailable");
		return {
			ok: true,
			state: {
				...context.state,
				selectedPlanId: command.planId
			},
			event: eventFor(context, command, "applied", plan.monthlyPrice)
		};
	}
	if (command.type === "submit_renewal") {
		if (context.state.submittedAt !== null) return refused(context, command, "already_submitted");
		if (context.state.selectedPlanId === null || !context.state.availablePlans.some(({ id }) => id === context.state.selectedPlanId)) return refused(context, command, "plan_required");
		if (!context.confirmation) return refused(context, command, "requires_user_confirmation");
		if (context.confirmation.token !== command.confirmationToken) return refused(context, command, "confirmation_invalid");
		if (context.now >= context.confirmation.expiresAt) return refused(context, command, "confirmation_expired");
		return {
			ok: true,
			state: {
				...context.state,
				submittedAt: context.now
			},
			event: eventFor(context, command, "applied")
		};
	}
	if (command.type === "record_decision") {
		const runtimeOutcome = command.outcome;
		if (command.requestId.trim() === "" || typeof runtimeOutcome !== "string" || !DECISION_OUTCOMES.has(runtimeOutcome) || command.outcome === "recommend_plan" && command.recommendedPlanId !== "silver" && command.recommendedPlanId !== "platinum") return refused(context, command, "invalid_command");
		const decision = {
			id: context.createId(),
			requestId: command.requestId,
			outcome: command.outcome,
			decidedAt: context.now,
			...command.recommendedPlanId ? { recommendedPlanId: command.recommendedPlanId } : {}
		};
		return {
			ok: true,
			state: context.state,
			decision,
			event: eventFor(context, command, "applied")
		};
	}
	let state;
	if (command.type === "set_preference") state = withPreferences(context.state, command);
	else if (command.type === "set_address") state = {
		...context.state,
		address: command.address
	};
	else if (command.type === "add_dependent") state = {
		...context.state,
		dependents: [...context.state.dependents, command.name]
	};
	else state = context.state;
	return {
		ok: true,
		state,
		event: eventFor(context, command, "applied")
	};
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function inputRecord(value, keys, requiredKeys = keys) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid server function input");
	const record = value;
	if (Object.keys(record).some((key) => !keys.includes(key)) || requiredKeys.some((key) => !(key in record))) throw new Error("Invalid server function input shape");
	return record;
}
function optionalLookupInput(value) {
	const record = inputRecord(value, ["id", "recordingId"], []);
	const id = typeof record.id === "string" ? record.id : void 0;
	const recordingId = typeof record.recordingId === "string" ? record.recordingId : void 0;
	if (!id && !recordingId || id && recordingId) throw new Error("Exactly one procedure lookup key is required");
	return {
		id,
		recordingId
	};
}
function ownerIdInput(value) {
	const record = inputRecord(value, ["id"]);
	if (typeof record.id !== "string" || record.id.length === 0 || record.id.length > 128) throw new Error("Invalid owner record lookup");
	return { id: record.id };
}
function publicTokenInput(value) {
	const record = inputRecord(value, ["publicToken"]);
	if (typeof record.publicToken !== "string") throw new Error("Invalid public token");
	assertPublicToken(record.publicToken);
	return { publicToken: record.publicToken };
}
function confirmationInput(value) {
	const record = inputRecord(value, ["publicToken", "confirmationToken"]);
	if (typeof record.publicToken !== "string" || typeof record.confirmationToken !== "string") throw new Error("Invalid confirmation input");
	assertPublicToken(record.publicToken);
	if (!/^[A-Za-z0-9_-]{43}$/u.test(record.confirmationToken)) throw new Error("Invalid confirmation token");
	return {
		publicToken: record.publicToken,
		confirmationToken: record.confirmationToken
	};
}
var getSharedPersistenceMode = createServerFn({ method: "GET" }).handler(createSsrRpc("21cf2b05b808dcd06b27572709c8583211ac9f721fa0ea881094558922f16bd7"));
var ensureOwnerWorkspaceServer = createServerFn({ method: "POST" }).handler(createSsrRpc("d8efc133510de236b44f69dad93868a699d4310867ef57f7e81e98eead409d1c"));
var createProcedureServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["procedure"]);
	return { procedure: validateProcedure(record.procedure) };
}).handler(createSsrRpc("4284bb7e7435387d2d303e9e23897e927d23d9165187a0a19356547f3fbaf72e"));
var listProceduresServer = createServerFn({ method: "GET" }).handler(createSsrRpc("282ad29e81bc3c1767d22e6366ac7b50f77cf11a7c222109cf1fe549751d767a"));
var getProcedureServer = createServerFn({ method: "POST" }).validator(optionalLookupInput).handler(createSsrRpc("ecbca5be2c9b9bc30343eb6f37394f68a00b77f9f4e1cbccca5a7ed29389dcca"));
var createHandoffServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["handoff"]);
	return { handoff: validateHandoff(record.handoff) };
}).handler(createSsrRpc("f4d788d616acc5a12acd8049bc1974ada4afb76d332cdfec1911801720c6a4cb"));
var listHandoffsServer = createServerFn({ method: "GET" }).handler(createSsrRpc("93813e780c21b5366408927d54db8c0edd3f430452b008c16f5fa13b2cca8deb"));
var getHandoffServer = createServerFn({ method: "POST" }).validator(ownerIdInput).handler(createSsrRpc("f820500c274ecae9cfa5dcc92591e1edeae9fe92189059152bcd15efd5bd2ada"));
var getPublicHandoffServer = createServerFn({ method: "POST" }).validator(publicTokenInput).handler(createSsrRpc("6b82772582e7da5407405d5d1576b3f6b89911e3a6d9afa389088e718e1aaf3c"));
var markHandoffOpenedServer = createServerFn({ method: "POST" }).validator(publicTokenInput).handler(createSsrRpc("4740a1b853d4ff4f20932af31830a0f47781366bab023f205519f58195c9716c"));
var transitionHandoffServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["publicToken", "status"]);
	if (typeof record.publicToken !== "string") throw new Error("Invalid token");
	assertPublicToken(record.publicToken);
	if (![
		"running",
		"needs_input",
		"waiting_confirmation"
	].includes(record.status)) throw new Error("Invalid handoff transition status");
	return {
		publicToken: record.publicToken,
		status: record.status
	};
}).handler(createSsrRpc("b93e0112b86c68543c128fb9002d1e7978a59f39285833d6ec950416309392e3"));
var createRecipientConfirmationServer = createServerFn({ method: "POST" }).validator(publicTokenInput).handler(createSsrRpc("4bfb883378418a7dda24efe0f1012ed24e8aec31f0c055cd3ffa98fabde65d10"));
var completeRecipientHandoffServer = createServerFn({ method: "POST" }).validator(confirmationInput).handler(createSsrRpc("1d97442975f534268555ea79e0d2c6c7e94ebdb0d443dbccb22141f9cebec645"));
var saveHelpRequestServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["request"]);
	return { request: validateHelpRequest(record.request) };
}).handler(createSsrRpc("ac875dac4f2a547aa1c6494f3f7130528ed623b1c5003eb7910c04c2195d77d1"));
var createHelpRequestServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["handoffToken", "request"]);
	if (typeof record.handoffToken !== "string") throw new Error("Invalid token");
	assertPublicToken(record.handoffToken);
	const request = validateHelpRequest(record.request);
	if (request.status !== "open") throw new Error("New helper request status must be open");
	return {
		handoffToken: record.handoffToken,
		request
	};
}).handler(createSsrRpc("71614442576c7c326aba25adc74e93b73faef427e5b6de77b2b306ab6540435e"));
var listHelpRequestsServer = createServerFn({ method: "GET" }).handler(createSsrRpc("62d33925a3e99ed85c25dbef3d351a4e2f910993a01d37f806e2bce3bc945508"));
var getHelpRequestServer = createServerFn({ method: "POST" }).validator(ownerIdInput).handler(createSsrRpc("60ca9a09a7efccda2144d5a975d02dfb6d1d6b75a927f1149d6f0fb898958d01"));
var getPublicHelpRequestServer = createServerFn({ method: "POST" }).validator(publicTokenInput).handler(createSsrRpc("d29f722a7c223d65372ce3469e3c5b352a0e4341910d3da251b7196e213d9c8e"));
var saveDecisionServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["decision"]);
	return { decision: validateDecision(record.decision) };
}).handler(createSsrRpc("00a29b1b39661d05a74a2b616790a50be12b720dcb3fcef83d287790d9dbf543"));
var listDecisionsServer = createServerFn({ method: "GET" }).handler(createSsrRpc("005eae4d6b0b924eb86424640d325c1cabebb8dd965698638c40d9337b4b7e7b"));
var getDecisionServer = createServerFn({ method: "POST" }).validator(ownerIdInput).handler(createSsrRpc("a642a76f31085b642ed294c212dc4e96cb1fccb2a3c41df4104b954ec78c94c7"));
var recordDecisionServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["requestToken", "decision"]);
	if (typeof record.requestToken !== "string") throw new Error("Invalid token");
	assertPublicToken(record.requestToken);
	return {
		requestToken: record.requestToken,
		decision: validateDecision(record.decision)
	};
}).handler(createSsrRpc("bd9848a6b67d2066f246875d69822fd61d628d44eb378d0c978245f298f50c3b"));
var pollDecisionServer = createServerFn({ method: "POST" }).validator((value) => {
	const { publicToken } = publicTokenInput(value);
	return { requestToken: publicToken };
}).handler(createSsrRpc("c17123c0e6e5524f159f316a380dcd86355eaece1462cfdd44ee2da8db86a40b"));
var appendActivityServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["event"]);
	return { event: validateActivity(record.event) };
}).handler(createSsrRpc("a6f0e4cb013a3455f762c4ea684a8abcda9f9ee5ed129b504225f6727d961a72"));
var appendPublicActivityServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["handoffToken", "event"]);
	if (typeof record.handoffToken !== "string") throw new Error("Invalid token");
	assertPublicToken(record.handoffToken);
	return {
		handoffToken: record.handoffToken,
		event: validateActivity(record.event)
	};
}).handler(createSsrRpc("1e1ce3f365f88bfc2bcec110b925e341b2e3fb748067f39a729730d68346d696"));
var listActivityServer = createServerFn({ method: "GET" }).handler(createSsrRpc("9f9190fd084cd60a30d2195cd3d2153ef655c07b8ae2fa61bdda4b71528e923a"));
var getActivityServer = createServerFn({ method: "POST" }).validator(ownerIdInput).handler(createSsrRpc("a905d194dc0315f981fa2ae98f8f42792c67e349639275358fac6630a299e956"));
var SEEDED_PROCEDURE = {
	id: "procedure-benefits-renewal",
	recordingId: "recording-benefits-renewal",
	title: "Renew annual benefits",
	createdAt: 1788384e6,
	sourceEventIds: [
		"seed-annual",
		"seed-paperless",
		"seed-gold"
	],
	steps: [
		{
			id: "step-seed-annual",
			commandType: "set_preference",
			policy: "safe_preference",
			input: {
				type: "set_preference",
				key: "renewalFrequency",
				value: "annual"
			}
		},
		{
			id: "step-seed-paperless",
			commandType: "set_preference",
			policy: "safe_preference",
			input: {
				type: "set_preference",
				key: "paperless",
				value: true
			}
		},
		{
			id: "step-seed-gold",
			commandType: "select_plan",
			policy: "availability_checked",
			input: {
				type: "select_plan",
				planId: "gold",
				observedMonthlyPrice: 88
			}
		}
	]
};
var DEMO_SEED = {
	recordings: [{
		id: "recording-benefits-renewal",
		title: "Renew annual benefits",
		createdAt: 1788384e6,
		status: "finished",
		events: []
	}],
	procedures: [SEEDED_PROCEDURE],
	handoffs: [{
		id: "handoff-benefits-renewal",
		publicToken: "seedHandoffToken_1234567",
		procedureId: "procedure-benefits-renewal",
		title: "Annual benefits renewal",
		createdAt: 178838406e4,
		updatedAt: 178838406e4,
		status: "created",
		procedure: SEEDED_PROCEDURE
	}],
	activity: [{
		id: "activity-demo-procedure",
		kind: "command",
		timestamp: 1788384e6,
		source: "human",
		outcome: "applied"
	}],
	decisions: [],
	accounts: [
		{
			id: "samuel",
			availablePlans: [
				{
					id: "silver",
					name: "Silver",
					monthlyPrice: 62
				},
				{
					id: "gold",
					name: "Gold",
					monthlyPrice: 88
				},
				{
					id: "platinum",
					name: "Platinum",
					monthlyPrice: 126
				}
			],
			selectedPlanId: null,
			preferences: {
				paperless: false,
				communication: "mail",
				renewalFrequency: "monthly"
			},
			address: "41 Market Street",
			dependents: ["Jordan"],
			submittedAt: null
		},
		{
			id: "mom-normal",
			availablePlans: [{
				id: "silver",
				name: "Silver",
				monthlyPrice: 96
			}, {
				id: "gold",
				name: "Gold",
				monthlyPrice: 142
			}],
			selectedPlanId: null,
			preferences: {
				paperless: false,
				communication: "mail",
				renewalFrequency: "monthly"
			},
			address: "Mom recipient address",
			dependents: ["Avery", "Casey"],
			submittedAt: null
		},
		{
			id: "mom-unavailable",
			availablePlans: [{
				id: "silver",
				name: "Silver",
				monthlyPrice: 96
			}, {
				id: "platinum",
				name: "Platinum",
				monthlyPrice: 180
			}],
			selectedPlanId: null,
			preferences: {
				paperless: false,
				communication: "mail",
				renewalFrequency: "monthly"
			},
			address: "Mom recipient address",
			dependents: ["Avery", "Casey"],
			submittedAt: null
		}
	],
	helpRequests: [],
	runs: []
};
async function resetDemo(repositories) {
	await Promise.all([
		repositories.recordings.replaceAll(DEMO_SEED.recordings ?? []),
		repositories.procedures.replaceAll(DEMO_SEED.procedures),
		repositories.handoffs.replaceAll(DEMO_SEED.handoffs),
		repositories.activity.replaceAll(DEMO_SEED.activity),
		repositories.decisions.replaceAll(DEMO_SEED.decisions),
		repositories.accounts.replaceAll(DEMO_SEED.accounts ?? []),
		repositories.helpRequests.replaceAll(DEMO_SEED.helpRequests ?? []),
		repositories.runs.replaceAll(DEMO_SEED.runs ?? [])
	]);
}
var STORAGE_PREFIX = "showonce:v1";
var MemoryStorage = class {
	values = /* @__PURE__ */ new Map();
	get length() {
		return this.values.size;
	}
	clear() {
		this.values.clear();
	}
	getItem(key) {
		return this.values.get(key) ?? null;
	}
	key(index) {
		return [...this.values.keys()][index] ?? null;
	}
	removeItem(key) {
		this.values.delete(key);
	}
	setItem(key, value) {
		this.values.set(key, value);
	}
};
function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
var BrowserRepository = class {
	storage;
	key;
	constructor(storage, key, initialValues) {
		this.storage = storage;
		this.key = key;
		if (this.storage.getItem(this.key) === null) this.write(initialValues);
	}
	async list() {
		return clone(this.read());
	}
	async get(id) {
		return clone(this.read().find((value) => value.id === id) ?? null);
	}
	async save(value) {
		const values = this.read();
		const index = values.findIndex(({ id }) => id === value.id);
		if (index === -1) values.push(clone(value));
		else values[index] = clone(value);
		this.write(values);
	}
	async remove(id) {
		this.write(this.read().filter((value) => value.id !== id));
	}
	async replaceAll(values) {
		this.write(values);
	}
	read() {
		try {
			const raw = this.storage.getItem(this.key);
			const parsed = raw === null ? [] : JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}
	write(values) {
		try {
			this.storage.setItem(this.key, JSON.stringify(values));
		} catch {}
	}
};
var BrowserHandoffRepository = class extends BrowserRepository {
	async getByPublicToken(publicToken, now = Date.now()) {
		const handoff = this.read().find((value) => value.publicToken === publicToken);
		if (!handoff || isExpired(handoff, now)) return null;
		return this.toPublic(handoff);
	}
	async markOpened(publicToken, now = Date.now()) {
		const handoff = this.read().find((value) => value.publicToken === publicToken);
		if (!handoff || isExpired(handoff, now)) throw new Error("Handoff is unavailable or expired");
		const status = handoff.status ?? "created";
		if (status === "opened" || status !== "created") return this.toPublic(handoff);
		const next = {
			...handoff,
			status: "opened",
			updatedAt: now
		};
		await this.save(next);
		return this.toPublic(next);
	}
	async transitionByPublicToken(publicToken, status, now = Date.now()) {
		if (status === "completed") throw new Error("Completed requires recipient confirmation");
		const handoff = this.read().find((value) => value.publicToken === publicToken);
		if (!handoff || isExpired(handoff, now)) throw new Error("Handoff is unavailable or expired");
		if (handoff.status === status) return this.toPublic(handoff);
		assertHandoffTransition(handoff.status ?? "created", status);
		const next = {
			...handoff,
			status,
			updatedAt: now
		};
		await this.save(next);
		return this.toPublic(next);
	}
	confirmations = /* @__PURE__ */ new Map();
	async createConfirmation(publicToken, now = Date.now()) {
		const handoff = this.read().find((value) => value.publicToken === publicToken);
		if (!handoff || isExpired(handoff, now)) throw new Error("Handoff is unavailable or expired");
		const confirmation = {
			token: generatePublicToken(),
			createdAt: now,
			expiresAt: now + 12e4
		};
		this.confirmations.set(publicToken, confirmation);
		return clone(confirmation);
	}
	async complete(publicToken, confirmationToken, now = Date.now()) {
		const handoff = this.read().find((value) => value.publicToken === publicToken);
		const confirmation = this.confirmations.get(publicToken);
		if (!handoff || isExpired(handoff, now)) throw new Error("Handoff is unavailable or expired");
		if (!confirmation || confirmation.token !== confirmationToken) throw new Error("Recipient confirmation is invalid");
		if (confirmation.consumedAt !== void 0) throw new Error("Recipient confirmation was already consumed");
		if (confirmation.expiresAt <= now) throw new Error("Recipient confirmation is expired");
		confirmation.consumedAt = now;
		const next = {
			...handoff,
			status: "completed",
			updatedAt: now
		};
		await this.save(next);
		return this.toPublic(next);
	}
	toPublic(handoff) {
		if (!handoff.publicToken) throw new Error("Handoff public token is missing");
		return clone({
			publicToken: handoff.publicToken,
			title: handoff.title,
			createdAt: handoff.createdAt,
			expiresAt: handoff.expiresAt,
			status: handoff.status,
			procedure: {
				title: handoff.procedure?.title ?? handoff.title,
				steps: (handoff.procedure?.steps ?? []).map(({ id: _id, ...step }) => step)
			},
			policy: handoff.policy ?? {
				allowSafePreferences: false,
				requireConfirmation: true,
				allowHelperEscalation: false
			}
		});
	}
};
var BrowserProcedureRepository = class extends BrowserRepository {
	async getByRecordingId(recordingId) {
		return clone(this.read().find((value) => value.recordingId === recordingId) ?? null);
	}
};
var BrowserHelpRequestRepository = class extends BrowserRepository {
	async getByPublicToken(publicToken, now = Date.now()) {
		const request = this.read().find((value) => value.publicToken === publicToken);
		if (!request?.publicToken || request.expiresAt === void 0 || isExpired(request, now)) return null;
		return {
			publicToken: request.publicToken,
			expiresAt: request.expiresAt,
			status: request.status,
			detail: request.detail,
			options: request.options
		};
	}
	async createForHandoffToken(_handoffToken, request) {
		await this.save(request);
	}
};
var BrowserDecisionRepository = class extends BrowserRepository {
	channel;
	listeners = /* @__PURE__ */ new Set();
	constructor(storage, key, initialValues, channel) {
		super(storage, key, initialValues);
		this.channel = channel;
		if (this.channel) this.channel.onmessage = (event) => {
			super.save(event.data);
			this.notify(event.data);
		};
	}
	async save(value) {
		await super.save(value);
		this.notify(value);
		this.channel?.postMessage(clone(value));
	}
	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}
	async pollByRequestToken(publicToken) {
		return [...this.read()].reverse().find(({ requestId }) => requestId === publicToken) ?? null;
	}
	async saveForRequestToken(_publicToken, decision) {
		await this.save(decision);
	}
	notify(decision) {
		for (const listener of this.listeners) listener(clone(decision));
	}
};
var BrowserActivityRepository = class extends BrowserRepository {
	async appendForHandoffToken(_handoffToken, event) {
		await this.save(event);
	}
};
function browserStorage() {
	if (typeof window !== "undefined") try {
		return window.localStorage;
	} catch {
		return new MemoryStorage();
	}
	return new MemoryStorage();
}
function browserChannel() {
	if (typeof window === "undefined" || typeof window.BroadcastChannel === "undefined") return;
	return new window.BroadcastChannel("showonce:decisions");
}
function createBrowserRepositories(options = {}) {
	const storage = options.storage ?? browserStorage();
	const seed = options.seed ?? DEMO_SEED;
	const channel = options.channelFactory === void 0 ? browserChannel() : options.channelFactory();
	return {
		recordings: new BrowserRepository(storage, `${STORAGE_PREFIX}:recordings`, seed.recordings ?? []),
		procedures: new BrowserProcedureRepository(storage, `${STORAGE_PREFIX}:procedures`, seed.procedures),
		handoffs: new BrowserHandoffRepository(storage, `${STORAGE_PREFIX}:handoffs`, seed.handoffs),
		activity: new BrowserActivityRepository(storage, `${STORAGE_PREFIX}:activity`, seed.activity),
		decisions: new BrowserDecisionRepository(storage, `${STORAGE_PREFIX}:decisions`, seed.decisions, channel),
		accounts: new BrowserRepository(storage, `${STORAGE_PREFIX}:accounts`, seed.accounts ?? []),
		helpRequests: new BrowserHelpRequestRepository(storage, `${STORAGE_PREFIX}:help-requests`, seed.helpRequests ?? []),
		runs: new BrowserRepository(storage, `${STORAGE_PREFIX}:runs`, seed.runs ?? []),
		dispose: () => {
			if (channel) {
				channel.onmessage = null;
				channel.close();
			}
		}
	};
}
function createLocalDemoRepositories(options = {}) {
	const storage = options.storage ?? browserStorage();
	const seed = options.seed ?? DEMO_SEED;
	return {
		recordings: new BrowserRepository(storage, `${STORAGE_PREFIX}:recordings`, seed.recordings ?? []),
		accounts: new BrowserRepository(storage, `${STORAGE_PREFIX}:accounts`, seed.accounts ?? []),
		runs: new BrowserRepository(storage, `${STORAGE_PREFIX}:runs`, seed.runs ?? []),
		dispose: () => void 0
	};
}
createBrowserRepositories();
var OwnerRepository = class {
	transport;
	constructor(transport) {
		this.transport = transport;
	}
	async remove(_id) {
		throw new Error("Shared record deletion is not supported");
	}
	async replaceAll(_values) {
		throw new Error("Shared bulk replacement is not supported");
	}
};
var SupabaseProcedureRepository = class extends OwnerRepository {
	async list() {
		return this.transport.listProcedures();
	}
	async get(id) {
		return this.transport.getProcedure({ id });
	}
	async save(value) {
		await this.transport.createProcedure({ procedure: validateProcedure(value) });
	}
	async getByRecordingId(recordingId) {
		return this.transport.getProcedure({ recordingId });
	}
};
var SupabaseHandoffRepository = class extends OwnerRepository {
	async list() {
		return this.transport.listHandoffs();
	}
	async get(id) {
		return this.transport.getHandoff({ id });
	}
	async save(value) {
		await this.transport.createHandoff({ handoff: validateHandoff({
			...value,
			policy: value.policy ?? {
				allowSafePreferences: false,
				requireConfirmation: true,
				allowHelperEscalation: false
			}
		}) });
	}
	async getByPublicToken(publicToken, now = Date.now()) {
		assertPublicToken(publicToken);
		const value = await this.transport.getPublicHandoff({
			publicToken,
			now
		});
		return value === null ? null : validatePublicHandoff(value);
	}
	async markOpened(publicToken, now = Date.now()) {
		assertPublicToken(publicToken);
		return validatePublicHandoff(await this.transport.markHandoffOpened({
			publicToken,
			now
		}));
	}
	async transitionByPublicToken(publicToken, status, now = Date.now()) {
		assertPublicToken(publicToken);
		if (status === "completed") throw new Error("Completed requires recipient confirmation");
		return validatePublicHandoff(await this.transport.transitionHandoff({
			publicToken,
			status,
			now
		}));
	}
	async createConfirmation(publicToken, now = Date.now()) {
		assertPublicToken(publicToken);
		return this.transport.createConfirmation({
			publicToken,
			now
		});
	}
	async complete(publicToken, confirmationToken, now = Date.now()) {
		assertPublicToken(publicToken);
		return validatePublicHandoff(await this.transport.completeHandoff({
			publicToken,
			confirmationToken,
			now
		}));
	}
};
var SupabaseHelpRequestRepository = class extends OwnerRepository {
	async list() {
		return this.transport.listHelpRequests();
	}
	async get(id) {
		return this.transport.getHelpRequest({ id });
	}
	async save(value) {
		await this.transport.saveHelpRequest({ request: validateHelpRequest(value) });
	}
	async createForHandoffToken(handoffToken, request, now = Date.now()) {
		assertPublicToken(handoffToken);
		if (request.status !== "open") throw new Error("New helper request status must be open");
		await this.transport.createHelpRequest({
			handoffToken,
			request: validateHelpRequest(request),
			now
		});
	}
	async getByPublicToken(publicToken, now = Date.now()) {
		assertPublicToken(publicToken);
		const value = await this.transport.getPublicHelpRequest({
			publicToken,
			now
		});
		return value === null ? null : validatePublicHelpRequest(value);
	}
};
var SupabaseDecisionRepository = class extends OwnerRepository {
	listeners = /* @__PURE__ */ new Set();
	async list() {
		return this.transport.listDecisions();
	}
	async get(id) {
		return this.transport.getDecision({ id });
	}
	async save(value) {
		await this.transport.saveDecision({ decision: validateDecision(value) });
	}
	async saveForRequestToken(publicToken, decision, now = Date.now()) {
		assertPublicToken(publicToken);
		const saved = await this.transport.recordDecision({
			requestToken: publicToken,
			decision: validateDecision(decision),
			now
		});
		for (const listener of this.listeners) listener(saved);
	}
	async pollByRequestToken(publicToken, now = Date.now()) {
		assertPublicToken(publicToken);
		return this.transport.pollDecision({
			requestToken: publicToken,
			now
		});
	}
	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}
};
var SupabaseActivityRepository = class extends OwnerRepository {
	async list() {
		return this.transport.listActivity();
	}
	async get(id) {
		return this.transport.getActivity({ id });
	}
	async save(value) {
		await this.transport.appendActivity({ event: validateActivity(value) });
	}
	async appendForHandoffToken(handoffToken, event) {
		assertPublicToken(handoffToken);
		await this.transport.appendPublicActivity({
			handoffToken,
			event: validateActivity(event)
		});
	}
};
var transport = {
	createProcedure: (input) => createProcedureServer({ data: input }),
	listProcedures: () => listProceduresServer(),
	getProcedure: (input) => getProcedureServer({ data: input }),
	createHandoff: (input) => createHandoffServer({ data: input }),
	listHandoffs: () => listHandoffsServer(),
	getHandoff: (input) => getHandoffServer({ data: input }),
	getPublicHandoff: ({ publicToken }) => getPublicHandoffServer({ data: { publicToken } }),
	markHandoffOpened: ({ publicToken }) => markHandoffOpenedServer({ data: { publicToken } }),
	transitionHandoff: ({ publicToken, status }) => transitionHandoffServer({ data: {
		publicToken,
		status
	} }),
	createConfirmation: ({ publicToken }) => createRecipientConfirmationServer({ data: { publicToken } }),
	completeHandoff: ({ publicToken, confirmationToken }) => completeRecipientHandoffServer({ data: {
		publicToken,
		confirmationToken
	} }),
	saveHelpRequest: (input) => saveHelpRequestServer({ data: input }),
	createHelpRequest: ({ handoffToken, request }) => createHelpRequestServer({ data: {
		handoffToken,
		request
	} }),
	listHelpRequests: () => listHelpRequestsServer(),
	getHelpRequest: (input) => getHelpRequestServer({ data: input }),
	getPublicHelpRequest: ({ publicToken }) => getPublicHelpRequestServer({ data: { publicToken } }),
	saveDecision: (input) => saveDecisionServer({ data: input }),
	listDecisions: () => listDecisionsServer(),
	getDecision: (input) => getDecisionServer({ data: input }),
	recordDecision: ({ requestToken, decision }) => recordDecisionServer({ data: {
		requestToken,
		decision
	} }),
	pollDecision: ({ requestToken }) => pollDecisionServer({ data: { publicToken: requestToken } }),
	appendActivity: (input) => appendActivityServer({ data: input }),
	appendPublicActivity: ({ handoffToken, event }) => appendPublicActivityServer({ data: {
		handoffToken,
		event
	} }),
	listActivity: () => listActivityServer(),
	getActivity: (input) => getActivityServer({ data: input })
};
var supabase = {
	procedures: new SupabaseProcedureRepository(transport),
	handoffs: new SupabaseHandoffRepository(transport),
	helpRequests: new SupabaseHelpRequestRepository(transport),
	decisions: new SupabaseDecisionRepository(transport),
	activity: new SupabaseActivityRepository(transport),
	mode: "supabase"
};
var selected = void 0;
async function shared() {
	if (selected) return selected;
	const resolveShared = getSharedPersistenceMode().then(async (mode) => {
		if (mode === "supabase") {
			await ensureOwnerWorkspaceServer();
			return supabase;
		}
		throw new Error("Shared persistence is unavailable. Configure the server environment.");
	});
	if (typeof window !== "undefined") selected = resolveShared;
	return resolveShared;
}
var procedures = {
	list: async () => (await shared()).procedures.list(),
	get: async (id) => (await shared()).procedures.get(id),
	save: async (value) => (await shared()).procedures.save(value),
	remove: async (id) => (await shared()).procedures.remove(id),
	replaceAll: async (values) => (await shared()).procedures.replaceAll(values),
	getByRecordingId: async (recordingId) => (await shared()).procedures.getByRecordingId(recordingId)
};
var handoffs = {
	list: async () => (await shared()).handoffs.list(),
	get: async (id) => (await shared()).handoffs.get(id),
	save: async (value) => (await shared()).handoffs.save(value),
	remove: async (id) => (await shared()).handoffs.remove(id),
	replaceAll: async (values) => (await shared()).handoffs.replaceAll(values),
	getByPublicToken: async (publicToken, now) => (await shared()).handoffs.getByPublicToken(publicToken, now),
	markOpened: async (publicToken, now) => (await shared()).handoffs.markOpened(publicToken, now),
	transitionByPublicToken: async (publicToken, status, now) => (await shared()).handoffs.transitionByPublicToken(publicToken, status, now),
	createConfirmation: async (publicToken, now) => (await shared()).handoffs.createConfirmation(publicToken, now),
	complete: async (publicToken, confirmationToken, now) => (await shared()).handoffs.complete(publicToken, confirmationToken, now)
};
var helpRequests = {
	list: async () => (await shared()).helpRequests.list(),
	get: async (id) => (await shared()).helpRequests.get(id),
	save: async (value) => (await shared()).helpRequests.save(value),
	remove: async (id) => (await shared()).helpRequests.remove(id),
	replaceAll: async (values) => (await shared()).helpRequests.replaceAll(values),
	getByPublicToken: async (publicToken, now) => (await shared()).helpRequests.getByPublicToken(publicToken, now),
	createForHandoffToken: async (handoffToken, request, now) => (await shared()).helpRequests.createForHandoffToken(handoffToken, request, now)
};
var decisions = {
	list: async () => (await shared()).decisions.list(),
	get: async (id) => (await shared()).decisions.get(id),
	save: async (value) => (await shared()).decisions.save(value),
	remove: async (id) => (await shared()).decisions.remove(id),
	replaceAll: async (values) => (await shared()).decisions.replaceAll(values),
	subscribe: (listener) => {
		let unsubscribe = () => void 0;
		shared().then((repositories) => {
			unsubscribe = repositories.decisions.subscribe(listener);
		});
		return () => unsubscribe();
	},
	pollByRequestToken: async (publicToken, now) => (await shared()).decisions.pollByRequestToken(publicToken, now),
	saveForRequestToken: async (publicToken, decision, now) => (await shared()).decisions.saveForRequestToken(publicToken, decision, now)
};
var activity = {
	list: async () => (await shared()).activity.list(),
	get: async (id) => (await shared()).activity.get(id),
	save: async (value) => (await shared()).activity.save(value),
	remove: async (id) => (await shared()).activity.remove(id),
	replaceAll: async (values) => (await shared()).activity.replaceAll(values),
	appendForHandoffToken: async (handoffToken, event) => (await shared()).activity.appendForHandoffToken(handoffToken, event)
};
var localDemo = createLocalDemoRepositories();
var repositories = {
	recordings: localDemo.recordings,
	accounts: localDemo.accounts,
	runs: localDemo.runs,
	procedures,
	handoffs,
	helpRequests,
	decisions,
	activity,
	dispose: localDemo.dispose
};
function assertHandoffPolicyAllows(policy, action) {
	if (action === "apply_safe_preferences" && !policy.allowSafePreferences) throw new Error("Safe preference application is disabled by this handoff");
	if (action === "request_helper" && !policy.allowHelperEscalation) throw new Error("Helper escalation is disabled by this handoff");
	if (action === "submit_without_confirmation") {
		if (policy.requireConfirmation) throw new Error("Human confirmation is required by this handoff");
		throw new Error("Platform safety requires human confirmation");
	}
}
function stepFromEvent(event) {
	if (event.status !== "applied" || !isPortablePolicy(event.policy)) return null;
	const input = sanitizeSensitive(event.input);
	if (event.commandType === "set_preference" && input.key === "paperless" && typeof input.value === "boolean") return {
		id: `step-${event.id}`,
		commandType: "set_preference",
		policy: "safe_preference",
		input: {
			type: "set_preference",
			key: "paperless",
			value: input.value
		}
	};
	if (event.commandType === "set_preference" && input.key === "communication" && (input.value === "email" || input.value === "mail")) return {
		id: `step-${event.id}`,
		commandType: "set_preference",
		policy: "safe_preference",
		input: {
			type: "set_preference",
			key: "communication",
			value: input.value
		}
	};
	if (event.commandType === "set_preference" && input.key === "renewalFrequency" && (input.value === "annual" || input.value === "monthly")) return {
		id: `step-${event.id}`,
		commandType: "set_preference",
		policy: "safe_preference",
		input: {
			type: "set_preference",
			key: "renewalFrequency",
			value: input.value
		}
	};
	if (event.commandType === "select_plan" && typeof input.planId === "string") return {
		id: `step-${event.id}`,
		commandType: "select_plan",
		policy: "availability_checked",
		input: {
			type: "select_plan",
			planId: input.planId,
			...typeof input.observedMonthlyPrice === "number" ? { observedMonthlyPrice: input.observedMonthlyPrice } : {}
		}
	};
	if (event.commandType === "review_recipient_details" && event.policy === "recipient_specific") return {
		id: `step-${event.id}`,
		commandType: "review_recipient_details",
		policy: "recipient_specific",
		input: { type: "review_recipient_details" }
	};
	if (event.commandType === "preview_renewal" && event.policy === "state_check") return {
		id: `step-${event.id}`,
		commandType: "preview_renewal",
		policy: "state_check",
		input: { type: "preview_renewal" }
	};
	if (event.commandType === "create_confirmation" && event.policy === "confirmation_required") return {
		id: `step-${event.id}`,
		commandType: "create_confirmation",
		policy: "confirmation_required",
		input: { type: "create_confirmation" }
	};
	if (event.commandType === "submit_renewal" && event.policy === "confirmation_required") return {
		id: `step-${event.id}`,
		commandType: "submit_renewal",
		policy: "confirmation_required",
		input: { type: "submit_renewal" }
	};
	return null;
}
function compileProcedure(recording, events) {
	const portable = events.map((event) => ({
		event,
		step: stepFromEvent(event)
	})).filter((item) => item.step !== null);
	return {
		id: `procedure-${recording.id}`,
		recordingId: recording.id,
		title: recording.title,
		createdAt: recording.createdAt,
		sourceEventIds: portable.map(({ event }) => event.id),
		steps: portable.map(({ step }) => step)
	};
}
var now = () => Date.now();
var createId = () => globalThis.crypto.randomUUID();
function createDemoAccount() {
	return {
		id: "samuel",
		availablePlans: [
			{
				id: "silver",
				name: "Silver",
				monthlyPrice: 62
			},
			{
				id: "gold",
				name: "Gold",
				monthlyPrice: 88
			},
			{
				id: "platinum",
				name: "Platinum",
				monthlyPrice: 126
			}
		],
		selectedPlanId: null,
		preferences: {
			paperless: false,
			communication: "mail",
			renewalFrequency: "monthly"
		},
		address: "41 Market Street",
		dependents: ["Jordan"],
		submittedAt: null
	};
}
function createRecipientAccount(scenario) {
	return {
		id: scenario === "normal" ? "mom-normal" : "mom-unavailable",
		availablePlans: scenario === "normal" ? [{
			id: "silver",
			name: "Silver",
			monthlyPrice: 96
		}, {
			id: "gold",
			name: "Gold",
			monthlyPrice: 142
		}] : [{
			id: "silver",
			name: "Silver",
			monthlyPrice: 96
		}, {
			id: "platinum",
			name: "Platinum",
			monthlyPrice: 180
		}],
		selectedPlanId: null,
		preferences: {
			paperless: false,
			communication: "mail",
			renewalFrequency: "monthly"
		},
		address: "Mom recipient address",
		dependents: ["Avery", "Casey"],
		submittedAt: null
	};
}
async function startRecording(repositories, title, runtime = {}) {
	const timestamp = (runtime.now ?? now)();
	const recording = {
		id: (runtime.createId ?? createId)(),
		title: title.trim(),
		createdAt: timestamp,
		status: "capturing",
		events: [],
		...runtime.description ? { description: runtime.description.trim() } : {},
		...runtime.targetApp ? { targetApp: runtime.targetApp } : {}
	};
	await repositories.recordings.save(recording);
	return recording;
}
async function applyRecordedCommand(repositories, recordingId, account, command, runtime = {}) {
	const recording = await repositories.recordings.get(recordingId);
	if (!recording || recording.status !== "capturing") throw new Error("Recording is not capturing");
	const timestamp = (runtime.now ?? now)();
	const result = executeCommand({
		state: account,
		source: "human",
		now: timestamp,
		createId: runtime.createId ?? createId,
		confirmation: runtime.confirmation,
		createToken: runtime.createToken
	}, command);
	await Promise.all([
		repositories.recordings.save({
			...recording,
			events: [...recording.events, result.event]
		}),
		repositories.accounts.save(result.state),
		repositories.activity.save({
			id: `activity-${result.event.id}`,
			kind: "command",
			timestamp,
			source: "human",
			outcome: result.ok ? "applied" : "refused",
			commandType: result.event.commandType,
			policy: result.event.policy
		})
	]);
	return result;
}
async function applyRecipientCommand(repositories, account, command, options) {
	if (command.type === "set_preference" && options.policy) assertHandoffPolicyAllows(options.policy, "apply_safe_preferences");
	const timestamp = (options.now ?? now)();
	const result = executeCommand({
		state: account,
		source: options.source ?? "human",
		now: timestamp,
		createId: options.createId ?? createId,
		createToken: options.createToken,
		confirmation: options.confirmation
	}, command);
	await Promise.all([repositories.accounts.save(result.state), repositories.activity.appendForHandoffToken(options.handoffToken, {
		id: `activity-${result.event.id}`,
		kind: "command",
		timestamp,
		source: options.source ?? "human",
		outcome: result.ok ? "applied" : "refused",
		commandType: result.event.commandType,
		policy: result.event.policy
	})]);
	return result;
}
async function finishRecording(repositories, recordingId) {
	const recording = await repositories.recordings.get(recordingId);
	if (!recording) throw new Error("Recording not found");
	const procedure = compileProcedure(recording, recording.events);
	await Promise.all([repositories.recordings.save({
		...recording,
		status: "finished"
	}), repositories.procedures.save(procedure)]);
	return procedure;
}
async function createHandoff(repositories, procedure, title, details = {}, runtime = {}) {
	const handoff = {
		id: (runtime.createId ?? createId)(),
		publicToken: (runtime.createToken ?? generatePublicToken)(),
		procedureId: procedure.id,
		title: title.trim(),
		createdAt: (runtime.now ?? now)(),
		updatedAt: (runtime.now ?? now)(),
		status: "created",
		procedure,
		...details
	};
	handoff.expiresAt ??= handoff.createdAt + 6048e5;
	await repositories.handoffs.save(handoff);
	return handoff;
}
async function createHelpRequest(repositories, handoffId, runtime = {}) {
	const request = {
		id: (runtime.createId ?? createId)(),
		publicToken: (runtime.createToken ?? generatePublicToken)(),
		handoffId,
		createdAt: (runtime.now ?? now)(),
		updatedAt: (runtime.now ?? now)(),
		expiresAt: (runtime.now ?? now)() + 6048e5,
		status: "open",
		detail: "plan_unavailable",
		options: [
			"silver",
			"platinum",
			"let_recipient_decide"
		]
	};
	await repositories.helpRequests.createForHandoffToken(handoffId, request);
	return request;
}
async function createRecipientWorkflow(repositories, handoffId, scenario, accountId, runtime = {}) {
	const existing = (await repositories.runs.list()).find((run) => run.handoffId === handoffId && run.scenario === scenario);
	if (existing) return existing;
	const timestamp = (runtime.now ?? now)();
	const run = {
		id: (runtime.createId ?? createId)(),
		handoffId,
		scenario,
		accountId,
		phase: "explain",
		createdAt: timestamp,
		updatedAt: timestamp
	};
	await repositories.runs.save(run);
	return run;
}
async function updateRecipientWorkflow(repositories, run, update, runtime = {}) {
	const next = {
		...run,
		...update,
		updatedAt: (runtime.now ?? now)()
	};
	await repositories.runs.save(next);
	return next;
}
async function completeRecipientSubmission(repositories, account, run, confirmation, options) {
	const timestamp = (options.now ?? now)();
	const command = executeCommand({
		state: account,
		source: options.source ?? "webmcp",
		now: timestamp,
		createId: options.createId ?? createId,
		confirmation
	}, {
		type: "submit_renewal",
		confirmationToken: confirmation.token
	});
	if (!command.ok) return {
		ok: false,
		reason: command.reason === "confirmation_expired" ? "confirmation_expired" : "submission_refused",
		account,
		run: {
			...run,
			phase: "confirmation"
		},
		command
	};
	try {
		await repositories.handoffs.complete(options.handoffToken, confirmation.token, timestamp);
	} catch (error) {
		return {
			ok: false,
			reason: error instanceof Error && /confirmation.*(?:invalid|expired|consumed)/iu.test(error.message) ? "confirmation_expired" : "completion_failed",
			account,
			run: {
				...run,
				phase: "confirmation"
			},
			command
		};
	}
	const nextRun = {
		...run,
		phase: "complete",
		lastOutcome: "submitted",
		updatedAt: timestamp
	};
	await Promise.all([repositories.accounts.save(command.state), repositories.runs.save(nextRun)]);
	return {
		ok: true,
		account: command.state,
		run: nextRun,
		command
	};
}
function Card({ children, className = "", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: `card ${className}`.trim(),
		...props,
		children
	});
}
function EmptyState({ title, detail }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "empty-state",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "empty-state__mark",
				children: "○"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: title }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: detail })
		]
	});
}
//#endregion
export { updateRecipientWorkflow as _, assertHandoffPolicyAllows as a, createHandoff as c, createRecipientWorkflow as d, executeCommand as f, startRecording as g, resetDemo as h, applyRecordedCommand as i, createHelpRequest as l, repositories as m, EmptyState as n, completeRecipientSubmission as o, finishRecording as p, applyRecipientCommand as r, createDemoAccount as s, Card as t, createRecipientAccount as u };
