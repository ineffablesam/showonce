import { a as setCookie$1, i as getCookie, n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as validateActivity, c as validateHelpRequest, l as validateProcedure, n as assertPublicToken, o as validateDecision, s as validateHandoff } from "./validation-DwDmZNjF.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sharedServerFns-DJY8V9g9.js
function selectSharedPersistence(environment, nodeEnv) {
	if (environment.SUPABASE_URL && environment.SUPABASE_ANON_KEY) return "supabase";
	throw new Error("Shared persistence is unavailable. Configure the server environment.");
}
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var OWNER_COOKIE_NAME = "__Host-showonce-owner";
var OWNER_COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: "lax",
	secure: true,
	path: "/"
};
function generateOwnerCapability() {
	const bytes = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(24));
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return `own_${btoa(binary).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "")}`;
}
function isOwnerCapability(value) {
	return /^own_[A-Za-z0-9_-]{32}$/u.test(value);
}
function resolveOwnerCapability(existing, generate = generateOwnerCapability) {
	if (existing && isOwnerCapability(existing)) return {
		token: existing,
		shouldSet: false
	};
	return {
		token: generate(),
		shouldSet: true
	};
}
function getOrCreateOwnerCapability() {
	const resolved = resolveOwnerCapability(getCookie(OWNER_COOKIE_NAME));
	if (resolved.shouldSet) setCookie$1(OWNER_COOKIE_NAME, resolved.token, OWNER_COOKIE_OPTIONS);
	return resolved.token;
}
var RECIPIENT_COOKIE_NAME = "__Host-showonce-recipient";
var RECIPIENT_COOKIE_OPTIONS = {
	httpOnly: true,
	sameSite: "lax",
	secure: true,
	path: "/"
};
function generateRecipientCapability() {
	const bytes = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(32));
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return `rcp_${btoa(binary).replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "")}`;
}
function isRecipientCapability(value) {
	return /^rcp_[A-Za-z0-9_-]{43}$/u.test(value);
}
function resolveRecipientCapability(existing, generate = generateRecipientCapability) {
	if (existing && isRecipientCapability(existing)) return {
		token: existing,
		shouldSet: false
	};
	return {
		token: generate(),
		shouldSet: true
	};
}
function getOrCreateRecipientCapability() {
	const resolved = resolveRecipientCapability(getCookie(RECIPIENT_COOKIE_NAME));
	if (resolved.shouldSet) setCookie$1(RECIPIENT_COOKIE_NAME, resolved.token, RECIPIENT_COOKIE_OPTIONS);
	return resolved.token;
}
function getRecipientCapability() {
	const value = getCookie(RECIPIENT_COOKIE_NAME);
	if (!value || !isRecipientCapability(value)) throw new Error("Recipient capability is unavailable");
	return value;
}
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
function rpcClient() {
	const url = process.env.SUPABASE_URL;
	const anonKey = process.env.SUPABASE_ANON_KEY;
	if (!url || !anonKey) throw new Error("Shared persistence is unavailable. Configure SUPABASE_URL and SUPABASE_ANON_KEY.");
	return createClient(url, anonKey, { auth: {
		persistSession: false,
		autoRefreshToken: false
	} });
}
async function unwrap(operation) {
	const { data, error } = await operation;
	if (error) throw new Error(`Supabase RPC failed: ${error.message}`);
	return data;
}
var getSharedPersistenceMode_createServerFn_handler = createServerRpc({
	id: "21cf2b05b808dcd06b27572709c8583211ac9f721fa0ea881094558922f16bd7",
	name: "getSharedPersistenceMode",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => getSharedPersistenceMode.__executeServer(opts));
var getSharedPersistenceMode = createServerFn({ method: "GET" }).handler(getSharedPersistenceMode_createServerFn_handler, () => {
	try {
		return selectSharedPersistence({
			SUPABASE_URL: process.env.SUPABASE_URL,
			SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
		}, "production");
	} catch {
		return "unavailable";
	}
});
var ensureOwnerWorkspaceServer_createServerFn_handler = createServerRpc({
	id: "d8efc133510de236b44f69dad93868a699d4310867ef57f7e81e98eead409d1c",
	name: "ensureOwnerWorkspaceServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => ensureOwnerWorkspaceServer.__executeServer(opts));
var ensureOwnerWorkspaceServer = createServerFn({ method: "POST" }).handler(ensureOwnerWorkspaceServer_createServerFn_handler, () => {
	getOrCreateOwnerCapability();
	return { ready: true };
});
var createProcedureServer_createServerFn_handler = createServerRpc({
	id: "4284bb7e7435387d2d303e9e23897e927d23d9165187a0a19356547f3fbaf72e",
	name: "createProcedureServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => createProcedureServer.__executeServer(opts));
var createProcedureServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["procedure"]);
	return { procedure: validateProcedure(record.procedure) };
}).handler(createProcedureServer_createServerFn_handler, async ({ data }) => {
	await unwrap(rpcClient().rpc("create_procedure", {
		p_owner_token: getOrCreateOwnerCapability(),
		p_payload: data.procedure
	}));
});
var listProceduresServer_createServerFn_handler = createServerRpc({
	id: "282ad29e81bc3c1767d22e6366ac7b50f77cf11a7c222109cf1fe549751d767a",
	name: "listProceduresServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => listProceduresServer.__executeServer(opts));
var listProceduresServer = createServerFn({ method: "GET" }).handler(listProceduresServer_createServerFn_handler, () => unwrap(rpcClient().rpc("list_owner_procedures", { p_owner_token: getOrCreateOwnerCapability() })));
var getProcedureServer_createServerFn_handler = createServerRpc({
	id: "ecbca5be2c9b9bc30343eb6f37394f68a00b77f9f4e1cbccca5a7ed29389dcca",
	name: "getProcedureServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => getProcedureServer.__executeServer(opts));
var getProcedureServer = createServerFn({ method: "POST" }).validator(optionalLookupInput).handler(getProcedureServer_createServerFn_handler, ({ data }) => unwrap(rpcClient().rpc("get_owner_procedure", {
	p_owner_token: getOrCreateOwnerCapability(),
	p_external_id: data.id ?? null,
	p_recording_id: data.recordingId ?? null
})));
var createHandoffServer_createServerFn_handler = createServerRpc({
	id: "f4d788d616acc5a12acd8049bc1974ada4afb76d332cdfec1911801720c6a4cb",
	name: "createHandoffServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => createHandoffServer.__executeServer(opts));
var createHandoffServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["handoff"]);
	return { handoff: validateHandoff(record.handoff) };
}).handler(createHandoffServer_createServerFn_handler, async ({ data }) => {
	await unwrap(rpcClient().rpc("create_handoff", {
		p_owner_token: getOrCreateOwnerCapability(),
		p_payload: data.handoff
	}));
});
var listHandoffsServer_createServerFn_handler = createServerRpc({
	id: "93813e780c21b5366408927d54db8c0edd3f430452b008c16f5fa13b2cca8deb",
	name: "listHandoffsServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => listHandoffsServer.__executeServer(opts));
var listHandoffsServer = createServerFn({ method: "GET" }).handler(listHandoffsServer_createServerFn_handler, () => unwrap(rpcClient().rpc("list_owner_handoffs", { p_owner_token: getOrCreateOwnerCapability() })));
var getHandoffServer_createServerFn_handler = createServerRpc({
	id: "f820500c274ecae9cfa5dcc92591e1edeae9fe92189059152bcd15efd5bd2ada",
	name: "getHandoffServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => getHandoffServer.__executeServer(opts));
var getHandoffServer = createServerFn({ method: "POST" }).validator(ownerIdInput).handler(getHandoffServer_createServerFn_handler, ({ data }) => unwrap(rpcClient().rpc("get_owner_handoff", {
	p_owner_token: getOrCreateOwnerCapability(),
	p_external_id: data.id
})));
var getPublicHandoffServer_createServerFn_handler = createServerRpc({
	id: "6b82772582e7da5407405d5d1576b3f6b89911e3a6d9afa389088e718e1aaf3c",
	name: "getPublicHandoffServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => getPublicHandoffServer.__executeServer(opts));
var getPublicHandoffServer = createServerFn({ method: "POST" }).validator(publicTokenInput).handler(getPublicHandoffServer_createServerFn_handler, ({ data }) => unwrap(rpcClient().rpc("get_public_handoff", { p_public_token: data.publicToken })));
var markHandoffOpenedServer_createServerFn_handler = createServerRpc({
	id: "4740a1b853d4ff4f20932af31830a0f47781366bab023f205519f58195c9716c",
	name: "markHandoffOpenedServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => markHandoffOpenedServer.__executeServer(opts));
var markHandoffOpenedServer = createServerFn({ method: "POST" }).validator(publicTokenInput).handler(markHandoffOpenedServer_createServerFn_handler, async ({ data }) => {
	const result = await unwrap(rpcClient().rpc("mark_handoff_opened", {
		p_public_token: data.publicToken,
		p_recipient_token: getOrCreateRecipientCapability()
	}));
	if (!result) throw new Error("Handoff is unavailable or expired");
	return result;
});
var transitionHandoffServer_createServerFn_handler = createServerRpc({
	id: "b93e0112b86c68543c128fb9002d1e7978a59f39285833d6ec950416309392e3",
	name: "transitionHandoffServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => transitionHandoffServer.__executeServer(opts));
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
}).handler(transitionHandoffServer_createServerFn_handler, async ({ data }) => {
	const result = await unwrap(rpcClient().rpc("transition_public_handoff", {
		p_public_token: data.publicToken,
		p_status: data.status
	}));
	if (!result) throw new Error("Handoff is unavailable or expired");
	return result;
});
var createRecipientConfirmationServer_createServerFn_handler = createServerRpc({
	id: "4bfb883378418a7dda24efe0f1012ed24e8aec31f0c055cd3ffa98fabde65d10",
	name: "createRecipientConfirmationServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => createRecipientConfirmationServer.__executeServer(opts));
var createRecipientConfirmationServer = createServerFn({ method: "POST" }).validator(publicTokenInput).handler(createRecipientConfirmationServer_createServerFn_handler, async ({ data }) => {
	const result = await unwrap(rpcClient().rpc("create_recipient_confirmation", {
		p_public_token: data.publicToken,
		p_recipient_token: getRecipientCapability()
	}));
	if (!result) throw new Error("Recipient confirmation could not be created");
	return result;
});
var completeRecipientHandoffServer_createServerFn_handler = createServerRpc({
	id: "1d97442975f534268555ea79e0d2c6c7e94ebdb0d443dbccb22141f9cebec645",
	name: "completeRecipientHandoffServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => completeRecipientHandoffServer.__executeServer(opts));
var completeRecipientHandoffServer = createServerFn({ method: "POST" }).validator(confirmationInput).handler(completeRecipientHandoffServer_createServerFn_handler, async ({ data }) => {
	const result = await unwrap(rpcClient().rpc("complete_recipient_handoff", {
		p_public_token: data.publicToken,
		p_recipient_token: getRecipientCapability(),
		p_confirmation_token: data.confirmationToken
	}));
	if (!result) throw new Error("Recipient handoff could not be completed");
	return result;
});
var saveHelpRequestServer_createServerFn_handler = createServerRpc({
	id: "ac875dac4f2a547aa1c6494f3f7130528ed623b1c5003eb7910c04c2195d77d1",
	name: "saveHelpRequestServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => saveHelpRequestServer.__executeServer(opts));
var saveHelpRequestServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["request"]);
	return { request: validateHelpRequest(record.request) };
}).handler(saveHelpRequestServer_createServerFn_handler, async ({ data }) => {
	await unwrap(rpcClient().rpc("save_owner_helper_request", {
		p_owner_token: getOrCreateOwnerCapability(),
		p_payload: data.request
	}));
});
var createHelpRequestServer_createServerFn_handler = createServerRpc({
	id: "71614442576c7c326aba25adc74e93b73faef427e5b6de77b2b306ab6540435e",
	name: "createHelpRequestServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => createHelpRequestServer.__executeServer(opts));
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
}).handler(createHelpRequestServer_createServerFn_handler, async ({ data }) => {
	await unwrap(rpcClient().rpc("create_helper_request", {
		p_handoff_token: data.handoffToken,
		p_payload: data.request
	}));
});
var listHelpRequestsServer_createServerFn_handler = createServerRpc({
	id: "62d33925a3e99ed85c25dbef3d351a4e2f910993a01d37f806e2bce3bc945508",
	name: "listHelpRequestsServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => listHelpRequestsServer.__executeServer(opts));
var listHelpRequestsServer = createServerFn({ method: "GET" }).handler(listHelpRequestsServer_createServerFn_handler, () => unwrap(rpcClient().rpc("list_owner_helper_requests", { p_owner_token: getOrCreateOwnerCapability() })));
var getHelpRequestServer_createServerFn_handler = createServerRpc({
	id: "60ca9a09a7efccda2144d5a975d02dfb6d1d6b75a927f1149d6f0fb898958d01",
	name: "getHelpRequestServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => getHelpRequestServer.__executeServer(opts));
var getHelpRequestServer = createServerFn({ method: "POST" }).validator(ownerIdInput).handler(getHelpRequestServer_createServerFn_handler, ({ data }) => unwrap(rpcClient().rpc("get_owner_helper_request", {
	p_owner_token: getOrCreateOwnerCapability(),
	p_external_id: data.id
})));
var getPublicHelpRequestServer_createServerFn_handler = createServerRpc({
	id: "d29f722a7c223d65372ce3469e3c5b352a0e4341910d3da251b7196e213d9c8e",
	name: "getPublicHelpRequestServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => getPublicHelpRequestServer.__executeServer(opts));
var getPublicHelpRequestServer = createServerFn({ method: "POST" }).validator(publicTokenInput).handler(getPublicHelpRequestServer_createServerFn_handler, ({ data }) => unwrap(rpcClient().rpc("get_public_helper_request", { p_public_token: data.publicToken })));
var saveDecisionServer_createServerFn_handler = createServerRpc({
	id: "00a29b1b39661d05a74a2b616790a50be12b720dcb3fcef83d287790d9dbf543",
	name: "saveDecisionServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => saveDecisionServer.__executeServer(opts));
var saveDecisionServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["decision"]);
	return { decision: validateDecision(record.decision) };
}).handler(saveDecisionServer_createServerFn_handler, async ({ data }) => {
	await unwrap(rpcClient().rpc("save_owner_decision", {
		p_owner_token: getOrCreateOwnerCapability(),
		p_payload: data.decision
	}));
});
var listDecisionsServer_createServerFn_handler = createServerRpc({
	id: "005eae4d6b0b924eb86424640d325c1cabebb8dd965698638c40d9337b4b7e7b",
	name: "listDecisionsServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => listDecisionsServer.__executeServer(opts));
var listDecisionsServer = createServerFn({ method: "GET" }).handler(listDecisionsServer_createServerFn_handler, () => unwrap(rpcClient().rpc("list_owner_decisions", { p_owner_token: getOrCreateOwnerCapability() })));
var getDecisionServer_createServerFn_handler = createServerRpc({
	id: "a642a76f31085b642ed294c212dc4e96cb1fccb2a3c41df4104b954ec78c94c7",
	name: "getDecisionServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => getDecisionServer.__executeServer(opts));
var getDecisionServer = createServerFn({ method: "POST" }).validator(ownerIdInput).handler(getDecisionServer_createServerFn_handler, ({ data }) => unwrap(rpcClient().rpc("get_owner_decision", {
	p_owner_token: getOrCreateOwnerCapability(),
	p_external_id: data.id
})));
var recordDecisionServer_createServerFn_handler = createServerRpc({
	id: "bd9848a6b67d2066f246875d69822fd61d628d44eb378d0c978245f298f50c3b",
	name: "recordDecisionServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => recordDecisionServer.__executeServer(opts));
var recordDecisionServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["requestToken", "decision"]);
	if (typeof record.requestToken !== "string") throw new Error("Invalid token");
	assertPublicToken(record.requestToken);
	return {
		requestToken: record.requestToken,
		decision: validateDecision(record.decision)
	};
}).handler(recordDecisionServer_createServerFn_handler, ({ data }) => unwrap(rpcClient().rpc("record_helper_decision", {
	p_request_token: data.requestToken,
	p_payload: data.decision
})));
var pollDecisionServer_createServerFn_handler = createServerRpc({
	id: "c17123c0e6e5524f159f316a380dcd86355eaece1462cfdd44ee2da8db86a40b",
	name: "pollDecisionServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => pollDecisionServer.__executeServer(opts));
var pollDecisionServer = createServerFn({ method: "POST" }).validator((value) => {
	const { publicToken } = publicTokenInput(value);
	return { requestToken: publicToken };
}).handler(pollDecisionServer_createServerFn_handler, ({ data }) => unwrap(rpcClient().rpc("poll_helper_decision", { p_request_token: data.requestToken })));
var appendActivityServer_createServerFn_handler = createServerRpc({
	id: "a6f0e4cb013a3455f762c4ea684a8abcda9f9ee5ed129b504225f6727d961a72",
	name: "appendActivityServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => appendActivityServer.__executeServer(opts));
var appendActivityServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["event"]);
	return { event: validateActivity(record.event) };
}).handler(appendActivityServer_createServerFn_handler, async ({ data }) => {
	await unwrap(rpcClient().rpc("append_owner_activity", {
		p_owner_token: getOrCreateOwnerCapability(),
		p_payload: data.event
	}));
});
var appendPublicActivityServer_createServerFn_handler = createServerRpc({
	id: "1e1ce3f365f88bfc2bcec110b925e341b2e3fb748067f39a729730d68346d696",
	name: "appendPublicActivityServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => appendPublicActivityServer.__executeServer(opts));
var appendPublicActivityServer = createServerFn({ method: "POST" }).validator((value) => {
	const record = inputRecord(value, ["handoffToken", "event"]);
	if (typeof record.handoffToken !== "string") throw new Error("Invalid token");
	assertPublicToken(record.handoffToken);
	return {
		handoffToken: record.handoffToken,
		event: validateActivity(record.event)
	};
}).handler(appendPublicActivityServer_createServerFn_handler, async ({ data }) => {
	await unwrap(rpcClient().rpc("append_public_activity", {
		p_handoff_token: data.handoffToken,
		p_payload: data.event
	}));
});
var listActivityServer_createServerFn_handler = createServerRpc({
	id: "9f9190fd084cd60a30d2195cd3d2153ef655c07b8ae2fa61bdda4b71528e923a",
	name: "listActivityServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => listActivityServer.__executeServer(opts));
var listActivityServer = createServerFn({ method: "GET" }).handler(listActivityServer_createServerFn_handler, () => unwrap(rpcClient().rpc("list_owner_activity", { p_owner_token: getOrCreateOwnerCapability() })));
var getActivityServer_createServerFn_handler = createServerRpc({
	id: "a905d194dc0315f981fa2ae98f8f42792c67e349639275358fac6630a299e956",
	name: "getActivityServer",
	filename: "src/server/sharedServerFns.ts"
}, (opts) => getActivityServer.__executeServer(opts));
var getActivityServer = createServerFn({ method: "POST" }).validator(ownerIdInput).handler(getActivityServer_createServerFn_handler, ({ data }) => unwrap(rpcClient().rpc("get_owner_activity", {
	p_owner_token: getOrCreateOwnerCapability(),
	p_external_id: data.id
})));
//#endregion
export { appendActivityServer_createServerFn_handler, appendPublicActivityServer_createServerFn_handler, completeRecipientHandoffServer_createServerFn_handler, createHandoffServer_createServerFn_handler, createHelpRequestServer_createServerFn_handler, createProcedureServer_createServerFn_handler, createRecipientConfirmationServer_createServerFn_handler, ensureOwnerWorkspaceServer_createServerFn_handler, getActivityServer_createServerFn_handler, getDecisionServer_createServerFn_handler, getHandoffServer_createServerFn_handler, getHelpRequestServer_createServerFn_handler, getProcedureServer_createServerFn_handler, getPublicHandoffServer_createServerFn_handler, getPublicHelpRequestServer_createServerFn_handler, getSharedPersistenceMode_createServerFn_handler, listActivityServer_createServerFn_handler, listDecisionsServer_createServerFn_handler, listHandoffsServer_createServerFn_handler, listHelpRequestsServer_createServerFn_handler, listProceduresServer_createServerFn_handler, markHandoffOpenedServer_createServerFn_handler, pollDecisionServer_createServerFn_handler, recordDecisionServer_createServerFn_handler, saveDecisionServer_createServerFn_handler, saveHelpRequestServer_createServerFn_handler, transitionHandoffServer_createServerFn_handler };
