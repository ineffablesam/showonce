import { i as __toESM } from "../../_runtime.mjs";
import { n as require_react } from "../react+solar-icons__react.mjs";
import { t as useSelector } from "../tanstack__react-store.mjs";
//#region node_modules/@tanstack/react-table/dist/FlexRender.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function isReactComponent(component) {
	return isClassComponent(component) || typeof component === "function" || isExoticComponent(component);
}
function isClassComponent(component) {
	return typeof component === "function" && (() => {
		const proto = Object.getPrototypeOf(component);
		return proto.prototype && proto.prototype.isReactComponent;
	})();
}
function isExoticComponent(component) {
	return typeof component === "object" && typeof component.$$typeof === "symbol" && ["react.memo", "react.forward_ref"].includes(component.$$typeof.description);
}
/**
* If rendering headers, cells, or footers with custom markup, use flexRender instead of `cell.getValue()` or `cell.renderValue()`.
* @example flexRender(cell.column.columnDef.cell, cell.getContext())
*/
function flexRender(Comp, props) {
	if (Comp === null || Comp === void 0) return null;
	return isReactComponent(Comp) ? /* @__PURE__ */ import_react.createElement(Comp, props) : Comp;
}
/**
* Simplified component wrapper of `flexRender`. Use this utility component to render headers, cells, or footers with custom markup.
* Only one prop (`cell`, `header`, or `footer`) may be passed.
* @example
* ```tsx
* <FlexRender cell={cell} />
* <FlexRender header={header} />
* <FlexRender footer={footer} />
* ```
*
* This replaces calling `flexRender` directly like this:
* ```tsx
* flexRender(cell.column.columnDef.cell, cell.getContext())
* flexRender(header.column.columnDef.header, header.getContext())
* flexRender(footer.column.columnDef.footer, footer.getContext())
* ```
*/
function FlexRender(props) {
	if ("cell" in props && props.cell) {
		const cell = props.cell;
		const def = cell.column.columnDef;
		const groupingCell = cell;
		const groupingDef = def;
		if (groupingCell.getIsAggregated?.()) return flexRender(groupingDef.aggregatedCell ?? def.cell, cell.getContext());
		if (groupingCell.getIsPlaceholder?.()) return null;
		return flexRender(def.cell, cell.getContext());
	}
	if ("header" in props && props.header) return flexRender(props.header.column.columnDef.header, props.header.getContext());
	if ("footer" in props && props.footer) return flexRender(props.footer.column.columnDef.footer, props.footer.getContext());
	return null;
}
//#endregion
//#region node_modules/@tanstack/react-table/node_modules/@tanstack/store/dist/alien.js
/* @__NO_SIDE_EFFECTS__ */
function createReactiveSystem({ update, notify, unwatched }) {
	return {
		link,
		unlink,
		propagate,
		checkDirty,
		shallowPropagate
	};
	function link(dep, sub, version) {
		const prevDep = sub.depsTail;
		if (prevDep !== void 0 && prevDep.dep === dep) return;
		const nextDep = prevDep !== void 0 ? prevDep.nextDep : sub.deps;
		if (nextDep !== void 0 && nextDep.dep === dep) {
			nextDep.version = version;
			sub.depsTail = nextDep;
			return;
		}
		const prevSub = dep.subsTail;
		if (prevSub !== void 0 && prevSub.version === version && prevSub.sub === sub) return;
		const newLink = sub.depsTail = dep.subsTail = {
			version,
			dep,
			sub,
			prevDep,
			nextDep,
			prevSub,
			nextSub: void 0
		};
		if (nextDep !== void 0) nextDep.prevDep = newLink;
		if (prevDep !== void 0) prevDep.nextDep = newLink;
		else sub.deps = newLink;
		if (prevSub !== void 0) prevSub.nextSub = newLink;
		else dep.subs = newLink;
	}
	function unlink(link, sub = link.sub) {
		const dep = link.dep;
		const prevDep = link.prevDep;
		const nextDep = link.nextDep;
		const nextSub = link.nextSub;
		const prevSub = link.prevSub;
		if (nextDep !== void 0) nextDep.prevDep = prevDep;
		else sub.depsTail = prevDep;
		if (prevDep !== void 0) prevDep.nextDep = nextDep;
		else sub.deps = nextDep;
		if (nextSub !== void 0) nextSub.prevSub = prevSub;
		else dep.subsTail = prevSub;
		if (prevSub !== void 0) prevSub.nextSub = nextSub;
		else if ((dep.subs = nextSub) === void 0) unwatched(dep);
		return nextDep;
	}
	function propagate(link) {
		let next = link.nextSub;
		let stack;
		top: do {
			const sub = link.sub;
			let flags = sub.flags;
			if (!(flags & 60)) sub.flags = flags | 32;
			else if (!(flags & 12)) flags = 0;
			else if (!(flags & 4)) sub.flags = flags & -9 | 32;
			else if (!(flags & 48) && isValidLink(link, sub)) {
				sub.flags = flags | 40;
				flags &= 1;
			} else flags = 0;
			if (flags & 2) notify(sub);
			if (flags & 1) {
				const subSubs = sub.subs;
				if (subSubs !== void 0) {
					const nextSub = (link = subSubs).nextSub;
					if (nextSub !== void 0) {
						stack = {
							value: next,
							prev: stack
						};
						next = nextSub;
					}
					continue;
				}
			}
			if ((link = next) !== void 0) {
				next = link.nextSub;
				continue;
			}
			while (stack !== void 0) {
				link = stack.value;
				stack = stack.prev;
				if (link !== void 0) {
					next = link.nextSub;
					continue top;
				}
			}
			break;
		} while (true);
	}
	function checkDirty(link, sub) {
		let stack;
		let checkDepth = 0;
		let dirty = false;
		top: do {
			const dep = link.dep;
			const flags = dep.flags;
			if (sub.flags & 16) dirty = true;
			else if ((flags & 17) === 17) {
				if (update(dep)) {
					const subs = dep.subs;
					if (subs.nextSub !== void 0) shallowPropagate(subs);
					dirty = true;
				}
			} else if ((flags & 33) === 33) {
				if (link.nextSub !== void 0 || link.prevSub !== void 0) stack = {
					value: link,
					prev: stack
				};
				link = dep.deps;
				sub = dep;
				++checkDepth;
				continue;
			}
			if (!dirty) {
				const nextDep = link.nextDep;
				if (nextDep !== void 0) {
					link = nextDep;
					continue;
				}
			}
			while (checkDepth--) {
				const firstSub = sub.subs;
				const hasMultipleSubs = firstSub.nextSub !== void 0;
				if (hasMultipleSubs) {
					link = stack.value;
					stack = stack.prev;
				} else link = firstSub;
				if (dirty) {
					if (update(sub)) {
						if (hasMultipleSubs) shallowPropagate(firstSub);
						sub = link.sub;
						continue;
					}
					dirty = false;
				} else sub.flags &= -33;
				sub = link.sub;
				const nextDep = link.nextDep;
				if (nextDep !== void 0) {
					link = nextDep;
					continue top;
				}
			}
			return dirty;
		} while (true);
	}
	function shallowPropagate(link) {
		do {
			const sub = link.sub;
			const flags = sub.flags;
			if ((flags & 48) === 32) {
				sub.flags = flags | 16;
				if ((flags & 6) === 2) notify(sub);
			}
		} while ((link = link.nextSub) !== void 0);
	}
	function isValidLink(checkLink, sub) {
		let link = sub.depsTail;
		while (link !== void 0) {
			if (link === checkLink) return true;
			link = link.prevDep;
		}
		return false;
	}
}
//#endregion
//#region node_modules/@tanstack/react-table/node_modules/@tanstack/store/dist/atom.js
function toObserver(nextHandler, errorHandler, completionHandler) {
	const isObserver = typeof nextHandler === "object";
	const self = isObserver ? nextHandler : void 0;
	return {
		next: (isObserver ? nextHandler.next : nextHandler)?.bind(self),
		error: (isObserver ? nextHandler.error : errorHandler)?.bind(self),
		complete: (isObserver ? nextHandler.complete : completionHandler)?.bind(self)
	};
}
var queuedEffects = [];
var cycle = 0;
var { link, unlink, propagate, checkDirty, shallowPropagate } = /* @__PURE__ */ createReactiveSystem({
	update(atom) {
		return atom._update();
	},
	notify(effect) {
		queuedEffects[queuedEffectsLength++] = effect;
		effect.flags &= -3;
	},
	unwatched(atom) {
		if (atom.depsTail !== void 0) {
			atom.depsTail = void 0;
			atom.flags = 17;
			purgeDeps(atom);
		}
	}
});
var notifyIndex = 0;
var queuedEffectsLength = 0;
var activeSub;
var batchDepth = 0;
function batch(fn) {
	try {
		++batchDepth;
		fn();
	} finally {
		if (!--batchDepth) flush();
	}
}
function purgeDeps(sub) {
	const depsTail = sub.depsTail;
	let dep = depsTail !== void 0 ? depsTail.nextDep : sub.deps;
	while (dep !== void 0) dep = unlink(dep, sub);
}
function flush() {
	if (batchDepth > 0) return;
	while (notifyIndex < queuedEffectsLength) {
		const effect = queuedEffects[notifyIndex];
		queuedEffects[notifyIndex++] = void 0;
		effect.notify();
	}
	notifyIndex = 0;
	queuedEffectsLength = 0;
}
function createAtom(valueOrFn, options) {
	const isComputed = typeof valueOrFn === "function";
	const getter = valueOrFn;
	const atom = {
		_snapshot: isComputed ? void 0 : valueOrFn,
		subs: void 0,
		subsTail: void 0,
		deps: void 0,
		depsTail: void 0,
		flags: isComputed ? 0 : 1,
		get() {
			if (activeSub !== void 0) link(atom, activeSub, cycle);
			return atom._snapshot;
		},
		subscribe(observerOrFn) {
			const obs = toObserver(observerOrFn);
			const observed = { current: false };
			const e = effect(() => {
				atom.get();
				if (!observed.current) observed.current = true;
				else obs.next?.(atom._snapshot);
			});
			return { unsubscribe: () => {
				e.stop();
			} };
		},
		_update(getValue) {
			const prevSub = activeSub;
			const compare = options?.compare ?? Object.is;
			if (isComputed) {
				activeSub = atom;
				++cycle;
				atom.depsTail = void 0;
			} else if (getValue === void 0) return false;
			if (isComputed) atom.flags = 5;
			try {
				const oldValue = atom._snapshot;
				const newValue = typeof getValue === "function" ? getValue(oldValue) : getValue === void 0 && isComputed ? getter(oldValue) : getValue;
				if (oldValue === void 0 || !compare(oldValue, newValue)) {
					atom._snapshot = newValue;
					return true;
				}
				return false;
			} finally {
				activeSub = prevSub;
				if (isComputed) atom.flags &= -5;
				purgeDeps(atom);
			}
		}
	};
	if (isComputed) {
		atom.flags = 17;
		atom.get = function() {
			const flags = atom.flags;
			if (flags & 16 || flags & 32 && checkDirty(atom.deps, atom)) {
				if (atom._update()) {
					const subs = atom.subs;
					if (subs !== void 0) shallowPropagate(subs);
				}
			} else if (flags & 32) atom.flags = flags & -33;
			if (activeSub !== void 0) link(atom, activeSub, cycle);
			return atom._snapshot;
		};
	} else atom.set = function(valueOrFn) {
		if (atom._update(valueOrFn)) {
			const subs = atom.subs;
			if (subs !== void 0) {
				propagate(subs);
				shallowPropagate(subs);
				flush();
			}
		}
	};
	return atom;
}
function effect(fn) {
	const run = () => {
		const prevSub = activeSub;
		activeSub = effectObj;
		++cycle;
		effectObj.depsTail = void 0;
		effectObj.flags = 6;
		try {
			return fn();
		} finally {
			activeSub = prevSub;
			effectObj.flags &= -5;
			purgeDeps(effectObj);
		}
	};
	const effectObj = {
		deps: void 0,
		depsTail: void 0,
		subs: void 0,
		subsTail: void 0,
		flags: 6,
		notify() {
			const flags = this.flags;
			if (flags & 16 || flags & 32 && checkDirty(this.deps, this)) run();
			else this.flags = 2;
		},
		stop() {
			this.flags = 0;
			this.depsTail = void 0;
			purgeDeps(this);
		}
	};
	run();
	return effectObj;
}
//#endregion
//#region node_modules/@tanstack/react-table/node_modules/@tanstack/store/dist/shallow.js
function shallow$1(objA, objB) {
	if (Object.is(objA, objB)) return true;
	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;
	if (objA instanceof Map && objB instanceof Map) {
		if (objA.size !== objB.size) return false;
		for (const [k, v] of objA) if (!objB.has(k) || !Object.is(v, objB.get(k))) return false;
		return true;
	}
	if (objA instanceof Set && objB instanceof Set) {
		if (objA.size !== objB.size) return false;
		for (const v of objA) if (!objB.has(v)) return false;
		return true;
	}
	if (objA instanceof Date && objB instanceof Date) {
		if (objA.getTime() !== objB.getTime()) return false;
		return true;
	}
	const keysA = getOwnKeys$1(objA);
	if (keysA.length !== getOwnKeys$1(objB).length) return false;
	for (let i = 0; i < keysA.length; i++) if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;
	return true;
}
function getOwnKeys$1(obj) {
	return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj));
}
//#endregion
//#region node_modules/@tanstack/react-table/dist/Subscribe.js
function Subscribe(props) {
	const selected = useSelector(props.source, props.selector, { compare: shallow$1 });
	return typeof props.children === "function" ? props.children(selected) : props.children;
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/reactivity/coreReactivityFeature.utils.js
/**
* Bridges atom instances to the `Store`/`ReadonlyStore` API by exposing
* a `state` getter backed by `atom.get()`, and wiring `setState` for
* writable atoms.
*
* @example
* ```ts
* const store = atomToStore(atom)
* ```
*/
function atomToStore(atom) {
	const store = atom;
	Object.defineProperty(atom, "state", { get() {
		return atom.get();
	} });
	if ("set" in atom) store.setState = atom.set.bind(atom);
	return store;
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/reactivity/renderPhaseReactivity.js
/**
* Creates reactivity bindings for render-phase adapters (React, Preact, Lit):
* frameworks with plain, non-reactive options that are re-synchronized during
* component render, where store notifications must not fire until the host
* commits.
*
* Readonly atoms are exposed as live facades. `get()` re-evaluates the
* resolver against the options of the render in progress — a normal computed
* cannot know that plain `options.state` changed — and caches the result
* through the configured comparator so external-store consumers (e.g. React's
* `useSyncExternalStore`) see referentially stable snapshots. `subscribe()`
* goes through a hidden computed that tracks the resolver's real atom
* dependencies plus a commit version, so subscribers are invalidated by
* actual reactive writes and by the adapter's post-commit publication.
*
* @example
* ```ts
* import { batch, createAtom } from '@tanstack/react-store'
*
* export const reactReactivity = () =>
*   renderPhaseReactivity({ createAtom, batch })
* ```
*/
function renderPhaseReactivity(primitives) {
	const { createAtom, batch } = primitives;
	const commitAtom = createAtom(0);
	return {
		createOptionsStore: false,
		wrapExternalAtoms: false,
		addSubscription: () => {
			throw new Error("Feature not supported in current reactivity implementation");
		},
		unmount: () => {
			throw new Error("Feature not supported in current reactivity implementation");
		},
		schedule: primitives.schedule ?? ((fn) => queueMicrotask(fn)),
		batch,
		untrack: (fn) => fn(),
		createReadonlyAtom: (fn, atomOptions) => {
			const compare = atomOptions?.compare ?? Object.is;
			let hasSnapshot = false;
			let snapshot;
			const getSnapshot = () => {
				const nextSnapshot = fn();
				if (!hasSnapshot || !compare(snapshot, nextSnapshot)) {
					snapshot = nextSnapshot;
					hasSnapshot = true;
				}
				return snapshot;
			};
			const reactiveAtom = createAtom(() => {
				commitAtom.get();
				return getSnapshot();
			}, { compare });
			return {
				get: getSnapshot,
				subscribe: reactiveAtom.subscribe.bind(reactiveAtom)
			};
		},
		createWritableAtom: (value, atomOptions) => {
			return createAtom(value, { compare: atomOptions?.compare });
		},
		commit: () => {
			commitAtom.set((version) => version + 1);
		}
	};
}
/**
* Creates a render-phase source with an explicit commit baseline.
*
* Render-phase adapters publish controlled state after the host framework
* commits so isolated subscribers update, but the component that owns the
* table already rendered that exact snapshot — forwarding the notification to
* its root subscription would produce a redundant render. Unlike a last-read
* filter, speculative reads do not change notification behavior: only
* `markCommitted()` advances the baseline.
*/
function createRenderPhaseSource(source, compare = Object.is) {
	let hasCommittedSnapshot = false;
	let committedSnapshot;
	return {
		get: source.get,
		markCommitted: (snapshot) => {
			committedSnapshot = snapshot;
			hasCommittedSnapshot = true;
		},
		subscribe: (listener) => source.subscribe((value) => {
			if (!hasCommittedSnapshot || !compare(committedSnapshot, value)) listener(value);
		})
	};
}
//#endregion
//#region node_modules/@tanstack/react-table/dist/reactivity.js
/**
* Creates the table-core reactivity bindings used by the React adapter.
*
* React stores table state in TanStack Store atoms and leaves options as plain
* resolved data because `useTable` synchronizes options during render. The
* render-phase preset supplies the live readonly-atom facades and the `commit`
* hook; the store primitives are passed in from `@tanstack/react-store` so all
* atoms share one store instance with user-provided external atoms.
*/
function reactReactivity() {
	return renderPhaseReactivity({
		createAtom,
		batch
	});
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/utils.js
/**
* Applies a TanStack updater to a value.
*
* If the updater is a function it is called with the previous value; otherwise the updater value is returned directly.
*/
function functionalUpdate(updater, input) {
	return typeof updater === "function" ? updater(input) : updater;
}
/**
* Clones table state values while preserving non-plain objects.
*
* Plain objects and arrays are copied recursively so state updates can avoid mutating existing references.
*/
function cloneState(value) {
	if (Array.isArray(value)) return value.map(cloneState);
	if (value && typeof value === "object") {
		const proto = Object.getPrototypeOf(value);
		if (proto !== Object.prototype && proto !== null) return value;
		const copy = proto === null ? makeObjectMap() : {};
		const keys = Object.keys(value);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			Object.defineProperty(copy, key, {
				configurable: true,
				enumerable: true,
				value: cloneState(value[key]),
				writable: true
			});
		}
		return copy;
	}
	return value;
}
/**
* Creates an object intended only for string-keyed dictionary lookups.
*
* The null prototype keeps user-controlled ids such as `__proto__` and
* `hasOwnProperty` as plain data keys.
*/
function makeObjectMap() {
	return Object.create(null);
}
/**
* Checks whether an object owns a key, including null-prototype dictionaries.
*/
function hasOwn(obj, key) {
	return Object.prototype.hasOwnProperty.call(obj, key);
}
/**
* Creates a table state updater for a single state slice.
*
* The updater writes through the table base atom for the slice and supports both value and functional updater forms.
*/
function makeStateUpdater(key, instance) {
	return (updater) => {
		(instance.options.atoms?.[key] ?? instance.baseAtoms[key]).set((old) => functionalUpdate(updater, old));
	};
}
/**
* Checks whether a value is an array or a plain (or null-prototype) object.
* Class instances, dates, and other exotic values compare by reference only,
* mirroring the `cloneState` plain-object policy.
*/
function isPlainContainer(value) {
	if (typeof value !== "object" || value === null) return false;
	if (Array.isArray(value)) return true;
	const proto = Object.getPrototypeOf(value);
	return proto === Object.prototype || proto === null;
}
/**
* Returns every enumerable own key, including symbols and non-index array
* properties. Keeping key presence explicit distinguishes sparse array holes
* from entries whose value is `undefined`.
*/
function getEnumerableOwnKeys(value) {
	return Reflect.ownKeys(value).filter((key) => Object.prototype.propertyIsEnumerable.call(value, key));
}
var MAX_STATE_COMPARE_DEPTH = 3;
/**
* Structurally compares two state slice values as deeply as stock feature
* state can nest and no deeper.
*
* Three container levels cover flat maps and arrays, arrays of state objects,
* array-valued filter values, and `columnResizing.columnSizingStart` tuples.
* Deeper containers and non-plain values compare by reference. A `false`
* result is always safe: the state update simply proceeds.
*/
function stateSlicesEqual(a, b) {
	return stateSlicesEqualAtDepth(a, b, MAX_STATE_COMPARE_DEPTH);
}
function stateSlicesEqualAtDepth(a, b, depth) {
	if (Object.is(a, b)) return true;
	if (depth <= 0 || !isPlainContainer(a) || !isPlainContainer(b)) return false;
	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
	}
	const keysA = getEnumerableOwnKeys(a);
	const keysB = getEnumerableOwnKeys(b);
	if (keysA.length !== keysB.length) return false;
	const recordA = a;
	const recordB = b;
	for (let i = 0; i < keysA.length; i++) {
		const key = keysA[i];
		if (!Object.prototype.propertyIsEnumerable.call(b, key)) return false;
		if (!stateSlicesEqualAtDepth(recordA[key], recordB[key], depth - 1)) return false;
	}
	return true;
}
/**
* Routes a state slice update through the slice's `on<State>Change` handler,
* preserving the owner's current reference for structural no-ops.
*
* Equality is evaluated inside the updater received by the state owner, never
* against the table's potentially stale controlled snapshot. This keeps
* same-tick updates composable in queued host containers such as React state,
* evaluates the original updater only when the owner applies it, and lets atom
* owners suppress notifications by returning their existing reference.
*
* A user-provided change handler is still invoked for a no-op because only that
* handler's state container can know its latest queued value. The guarded
* updater returns that container's previous reference, preventing a state write
* or render in state containers with identity bailout semantics.
*
* Hot-path slices that skip guarding entirely (selection maps that scale with
* row count, pointer-frequency resize state) call their change handler
* directly instead of routing through this util. Custom feature slices with a
* cheaper or semantic-aware comparison can pass `isEqual` to override the
* structural default.
*/
function setStateSlice(instance, key, updater, isEqual = stateSlicesEqual) {
	const onChangeKey = `on${key.charAt(0).toUpperCase()}${key.slice(1)}Change`;
	const onChange = instance.options[onChangeKey];
	if (!onChange) return;
	onChange((current) => {
		const next = functionalUpdate(updater, current);
		return isEqual(current, next) ? current : next;
	});
}
/**
* Flattens a tree of nodes by recursively reading child nodes.
*
* The original nodes are preserved in depth-first order.
*/
function flattenBy(arr, getChildren) {
	const flat = [];
	const recurse = (subArr) => {
		subArr.forEach((item) => {
			flat.push(item);
			const children = getChildren(item);
			if (children.length) recurse(children);
		});
	};
	recurse(arr);
	return flat;
}
/**
* Creates a dependency-tracked memoized function for table internals.
*
* The memo recomputes only when its dependency tuple changes and can emit debug timing information.
*/
var memo = ({ fn, memoDeps, onAfterCompare, onAfterUpdate, onBeforeCompare, onBeforeUpdate }) => {
	let deps = [];
	let result;
	const memoizedFn = (depArgs) => {
		onBeforeCompare?.();
		const newDeps = memoDeps?.(depArgs);
		let depsChanged = !newDeps || newDeps.length !== deps?.length;
		if (!depsChanged && newDeps) {
			for (let i = 0; i < newDeps.length; i++) if (newDeps[i] !== deps[i]) {
				depsChanged = true;
				break;
			}
		}
		onAfterCompare?.(depsChanged);
		if (!depsChanged) return result;
		deps = newDeps;
		onBeforeUpdate?.();
		result = fn(...newDeps ?? []);
		onAfterUpdate?.(result);
		return result;
	};
	return memoizedFn;
};
/**
* Wraps a callback so that its first invocation is skipped.
*
* Row-model `onAfterUpdate` hooks schedule auto-resets when their inputs
* change. The initial computation of a row model is not a change, so state
* resets must not fire for it — otherwise merely reading a row model on mount
* would wipe initial or controlled state.
*/
function skipFirstRun(fn) {
	let hasRun = false;
	return () => {
		if (!hasRun) {
			hasRun = true;
			return;
		}
		fn();
	};
}
/**
* Creates a table-aware memoized function.
*
* This wraps `memo` with table debug options and feature metadata so row models and derived APIs can share consistent diagnostics.
*/
function tableMemo({ feature, fnName, objectId, onAfterUpdate, table, ...memoOptions }) {
	const onAfterUpdateHandler = () => {
		if (!onAfterUpdate) return;
		const { schedule, untrack } = table._reactivity;
		schedule(() => untrack(() => onAfterUpdate()));
	};
	const debugOptions = { onAfterUpdate: () => {
		onAfterUpdateHandler();
	} };
	return memo({
		...memoOptions,
		...debugOptions
	});
}
/**
* Assumes that a function name is in the format of `parentName_fnKey` and returns the `fnKey` and `fnName` in the format of `parentName.fnKey`.
*/
function getFunctionNameInfo(staticFnName, splitBy = "_") {
	const [parentName, fnKey] = staticFnName.split(splitBy);
	return {
		fnKey,
		fnName: `${parentName}.${fnKey}`,
		parentName
	};
}
/**
* Assigns Table API methods directly to the table instance.
* Unlike row/cell/column/header, the table is a singleton so methods are assigned directly.
*/
function assignTableAPIs(feature, table, apis) {
	for (const [staticFnName, { fn, memoDeps }] of Object.entries(apis)) {
		const { fnKey, fnName } = getFunctionNameInfo(staticFnName);
		table[fnKey] = memoDeps ? tableMemo({
			memoDeps,
			fn,
			fnName,
			table,
			feature
		}) : fn;
	}
}
/**
* Assigns API methods to a prototype object for memory-efficient method sharing.
* All instances created with this prototype will share the same method references.
*
* For memoized methods, the memo state is lazily created and stored on each instance.
* This provides the best of both worlds: shared method code + per-instance caching.
*/
function assignPrototypeAPIs(feature, prototype, table, apis) {
	for (const [staticFnName, { fn, memoDeps }] of Object.entries(apis)) {
		const { fnKey, fnName } = getFunctionNameInfo(staticFnName);
		if (memoDeps) {
			const memoKey = `_memo_${fnKey}`;
			prototype[fnKey] = function(...args) {
				if (!this[memoKey]) {
					const self = this;
					this[memoKey] = tableMemo({
						memoDeps: (depArgs) => memoDeps(self, depArgs),
						fn: (...deps) => fn(self, ...deps),
						fnName,
						objectId: self.id,
						table,
						feature
					});
				}
				return this[memoKey](...args);
			};
		} else prototype[fnKey] = function(...args) {
			return fn(this, ...args);
		};
	}
}
/**
* Looks to run the memoized function with the builder pattern on the object if it exists, otherwise fall back to the static method passed in.
*/
function callMemoOrStaticFn(obj, fnKey, staticFn, ...args) {
	return obj[fnKey]?.(...args) ?? staticFn(obj, ...args);
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/cells/coreCellsFeature.utils.js
/**
* Reads this cell's accessor value from its owning row and column.
*
* This is the standalone implementation behind `cell.getValue()`, useful when
* importing static APIs instead of calling methods from the cell prototype.
*
* @example
* ```ts
* const value = cell_getValue(cell)
* ```
*/
function cell_getValue(cell) {
	return cell.row.getValue(cell.column.id);
}
/**
* Reads the value that should be rendered for this cell.
*
* Nullish accessor values are replaced with `table.options.renderFallbackValue`,
* matching the behavior of `cell.renderValue()`.
*
* @example
* ```ts
* const rendered = cell_renderValue(cell)
* ```
*/
function cell_renderValue(cell) {
	return cell.getValue() ?? cell.table.options.renderFallbackValue;
}
/**
* Builds the render context passed to a column's `cell` template.
*
* The returned object includes stable references to the table, row, column, and
* cell, plus bound `getValue` and `renderValue` helpers for render functions.
*
* @example
* ```ts
* const context = cell_getContext(cell)
* ```
*/
function cell_getContext(cell) {
	return {
		table: cell.table,
		column: cell.column,
		row: cell.row,
		cell,
		getValue: () => cell.getValue(),
		renderValue: () => cell.renderValue()
	};
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/cells/coreCellsFeature.js
/**
* Core feature that adds cell value, render, and context APIs.
*/
var coreCellsFeature = { assignCellPrototype: (prototype, table) => {
	assignPrototypeAPIs("coreCellsFeature", prototype, table, {
		cell_getValue: { fn: (cell) => cell_getValue(cell) },
		cell_renderValue: { fn: (cell) => cell_renderValue(cell) },
		cell_getContext: {
			fn: (cell) => cell_getContext(cell),
			memoDeps: (cell) => [cell]
		}
	});
} };
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/headers/constructHeader.js
/**
* Creates or retrieves the header prototype for a table.
* The prototype is cached on the table and shared by all header instances.
*/
function getHeaderPrototype(table) {
	if (!table._headerPrototype) {
		table._headerPrototype = { table };
		const features = Object.values(table._features);
		for (let i = 0; i < features.length; i++) features[i].assignHeaderPrototype?.(table._headerPrototype, table);
	}
	return table._headerPrototype;
}
/**
* Constructs a header instance from normalized table internals.
*
* This wires core properties, feature prototype APIs, and instance data used by table rendering and row-model operations.
*/
function constructHeader(table, column, options) {
	const headerPrototype = getHeaderPrototype(table);
	const header = Object.create(headerPrototype);
	header.colSpan = 0;
	header.column = column;
	header.depth = options.depth;
	header.headerGroup = null;
	header.id = options.id ?? column.id;
	header.index = options.index;
	header.isPlaceholder = !!options.isPlaceholder;
	header.placeholderId = options.placeholderId;
	header.rowSpan = 0;
	header.subHeaders = [];
	const initFns = table._headerInstanceInitFns;
	for (let i = 0; i < initFns.length; i++) initFns[i](header);
	return header;
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/features/column-pinning/columnPinningFeature.utils.js
/**
* Creates the default column pinning state.
*
* Both pinning regions start empty. Reset APIs use this value when
* `defaultState` is `true`.
*
* @example
* ```ts
* const pinning = getDefaultColumnPinningState()
* ```
*/
function getDefaultColumnPinningState() {
	return {
		start: [],
		end: []
	};
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/features/column-visibility/columnVisibilityFeature.utils.js
/**
* Creates the default column visibility state.
*
* The feature default is an empty object, where missing column ids are treated
* as visible. Reset APIs use this value when `defaultState` is `true`.
*
* @example
* ```ts
* const visibility = getDefaultColumnVisibilityState()
* ```
*/
function getDefaultColumnVisibilityState() {
	return makeObjectMap();
}
/**
* Updates this column's visibility when hiding is allowed.
*
* Passing `visible` stores that value. Omitting it flips the column's current
* visibility state. Group columns update their hideable leaf columns because
* visibility state is keyed by leaf column ids. Columns that cannot hide stay
* unchanged.
*
* @example
* ```ts
* column_toggleVisibility(column)
* ```
*/
function column_toggleVisibility(column, visible) {
	if (column_getCanHide(column)) table_setColumnVisibility(column.table, (old) => {
		const next = Object.assign(makeObjectMap(), old);
		const nextVisible = visible ?? !callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible);
		const leafColumns = column.getLeafColumns();
		for (let i = 0; i < leafColumns.length; i++) {
			const leafColumn = leafColumns[i];
			if (column_getCanHide(leafColumn)) next[leafColumn.id] = nextVisible;
		}
		return next;
	});
}
/**
* Checks whether this column is visible.
*
* Leaf columns read `state.columnVisibility[column.id]`, where missing entries
* default to visible. Parent columns are visible when at least one child column
* is visible.
*
* @example
* ```ts
* const visible = column_getIsVisible(column)
* ```
*/
function column_getIsVisible(column) {
	const columnVisibility = column.table.atoms.columnVisibility?.get();
	if (!columnVisibility) return true;
	const childColumns = column.columns;
	if (childColumns.length) return childColumns.some((childColumn) => callMemoOrStaticFn(childColumn, "getIsVisible", column_getIsVisible));
	return (hasOwn(columnVisibility, column.id) ? columnVisibility[column.id] : void 0) ?? true;
}
/**
* Checks whether this column is allowed to be hidden.
*
* Both `columnDef.enableHiding` and table `enableHiding` default to `true`.
*
* @example
* ```ts
* const canHide = column_getCanHide(column)
* ```
*/
function column_getCanHide(column) {
	return (column.columnDef.enableHiding ?? true) && (column.table.options.enableHiding ?? true);
}
/**
* Creates a checkbox-style handler that writes this column's visibility.
*
* The handler reads `event.target.checked`, so it is intended for visibility
* controls whose checked state means "visible".
*
* @example
* ```ts
* const onChange = column_getToggleVisibilityHandler(column)
* ```
*/
function column_getToggleVisibilityHandler(column) {
	return (e) => {
		column_toggleVisibility(column, e.target.checked);
	};
}
/**
* Collects the cells from this row whose columns are visible.
*
* When column pinning is active, the result is ordered as start-pinned cells,
* center cells, then end-pinned cells.
*
* @example
* ```ts
* const visibleCells = row_getVisibleCells(row)
* ```
*/
function row_getVisibleCells(row) {
	const allCells = row.getAllCells();
	const visibleCells = [];
	for (let i = 0; i < allCells.length; i++) {
		const cell = allCells[i];
		if (callMemoOrStaticFn(cell.column, "getIsVisible", column_getIsVisible)) visibleCells.push(cell);
	}
	const { start, end } = row.table.atoms.columnPinning?.get() ?? getDefaultColumnPinningState();
	if (!start.length && !end.length) return visibleCells;
	const visibleCellsByColumnId = callMemoOrStaticFn(row, "getVisibleCellsByColumnId", row_getVisibleCellsByColumnId);
	const startCells = [];
	for (let i = 0; i < start.length; i++) {
		const cell = visibleCellsByColumnId[start[i]];
		if (cell) startCells.push(cell);
	}
	const endCells = [];
	for (let i = 0; i < end.length; i++) {
		const cell = visibleCellsByColumnId[end[i]];
		if (cell) endCells.push(cell);
	}
	const centerCells = [];
	for (let i = 0; i < visibleCells.length; i++) {
		const cell = visibleCells[i];
		const id = cell.column.id;
		if (!start.includes(id) && !end.includes(id)) centerCells.push(cell);
	}
	return [
		...startCells,
		...centerCells,
		...endCells
	];
}
/**
* Builds a lookup map of this row's visible cells keyed by column id.
*
* Hidden columns are omitted from the map.
*
* @example
* ```ts
* const visibleCellsById = row_getVisibleCellsByColumnId(row)
* ```
*/
function row_getVisibleCellsByColumnId(row) {
	const result = makeObjectMap();
	const allCells = row.getAllCells();
	for (let i = 0; i < allCells.length; i++) {
		const cell = allCells[i];
		if (callMemoOrStaticFn(cell.column, "getIsVisible", column_getIsVisible)) result[cell.column.id] = cell;
	}
	return result;
}
/**
* Filters the flat column list down to visible columns.
*
* Parent/group columns are included when `column_getIsVisible` considers them
* visible.
*
* @example
* ```ts
* const columns = table_getVisibleFlatColumns(table)
* ```
*/
function table_getVisibleFlatColumns(table) {
	return table.getAllFlatColumns().filter((column) => callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible));
}
/**
* Filters leaf columns down to those currently visible.
*
* This is the column list most row rendering code uses before pinning-specific
* partitioning.
*
* @example
* ```ts
* const columns = table_getVisibleLeafColumns(table)
* ```
*/
function table_getVisibleLeafColumns(table) {
	return table.getAllLeafColumns().filter((column) => callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible));
}
/**
* Routes a column visibility updater through the table's visibility change handler.
*
* The updater may be a next visibility map or a function of the previous map,
* matching the instance `table.setColumnVisibility` behavior.
*
* @example
* ```ts
* table_setColumnVisibility(table, (old) => ({ ...old, age: false }))
* ```
*/
function table_setColumnVisibility(table, updater) {
	setStateSlice(table, "columnVisibility", updater);
}
/**
* Resets `columnVisibility` to the configured initial state or feature default.
*
* With no argument, the reset clones `table.initialState.columnVisibility` when
* it exists. Passing `true` ignores initial state and resets to `{}`.
*
* @example
* ```ts
* table_resetColumnVisibility(table)
* table_resetColumnVisibility(table, true)
* ```
*/
function table_resetColumnVisibility(table, defaultState) {
	table_setColumnVisibility(table, defaultState ? makeObjectMap() : Object.assign(makeObjectMap(), cloneState(table.initialState.columnVisibility ?? {})));
}
/**
* Shows or hides every hideable leaf column.
*
* Columns that cannot hide stay visible when toggling all columns off.
*
* @example
* ```ts
* table_toggleAllColumnsVisible(table)
* ```
*/
function table_toggleAllColumnsVisible(table, value) {
	value = value ?? !table_getIsAllColumnsVisible(table);
	const visibility = makeObjectMap();
	const leafColumns = table.getAllLeafColumns();
	for (let i = 0; i < leafColumns.length; i++) {
		const column = leafColumns[i];
		visibility[column.id] = !value ? !column_getCanHide(column) : value;
	}
	table_setColumnVisibility(table, visibility);
}
/**
* Checks whether every leaf column is currently visible.
*
* Non-hideable columns are naturally visible because missing visibility entries
* default to `true`.
*
* @example
* ```ts
* const allVisible = table_getIsAllColumnsVisible(table)
* ```
*/
function table_getIsAllColumnsVisible(table) {
	return !table.getAllLeafColumns().some((column) => !callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible));
}
/**
* Checks whether at least one leaf column is currently visible.
*
* This is useful for tri-state "show all columns" controls.
*
* @example
* ```ts
* const someVisible = table_getIsSomeColumnsVisible(table)
* ```
*/
function table_getIsSomeColumnsVisible(table) {
	return table.getAllLeafColumns().some((column) => callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible));
}
/**
* Creates a checkbox-style handler that shows or hides all columns.
*
* The handler reads `event.target.checked`, so it is intended for controls whose
* checked state means "all columns visible".
*
* @example
* ```ts
* const onChange = table_getToggleAllColumnsVisibilityHandler(table)
* ```
*/
function table_getToggleAllColumnsVisibilityHandler(table) {
	return (e) => {
		table_toggleAllColumnsVisible(table, e.target.checked);
	};
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/headers/buildHeaderGroups.js
function getMaxHeaderDepth(columns, depth = 1) {
	let maxDepth = depth;
	for (let i = 0; i < columns.length; i++) {
		const column = columns[i];
		if (callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible) && column.columns.length) maxDepth = Math.max(maxDepth, getMaxHeaderDepth(column.columns, depth + 1));
	}
	return maxDepth;
}
function formatHeaderGroupId(headerFamily, depth) {
	return headerFamily ? `${headerFamily}_${depth}` : String(depth);
}
function formatHeaderId(headerFamily, depth, columnId, childHeaderId) {
	let id = headerFamily ?? "";
	if (depth) id = id ? `${id}_${depth}` : String(depth);
	if (columnId) id = id ? `${id}_${columnId}` : columnId;
	if (childHeaderId) id = id ? `${id}_${childHeaderId}` : childHeaderId;
	return id;
}
function countPendingHeadersForColumn(headers, column) {
	let count = 0;
	for (let i = 0; i < headers.length; i++) if (headers[i].column === column) count++;
	return count;
}
function constructHeaderGroup(headersToGroup, depth, table, headerFamily, headerGroups, headerGroupInitFns) {
	const headerGroup = {
		depth,
		id: formatHeaderGroupId(headerFamily, depth),
		headers: []
	};
	const pendingParentHeaders = [];
	for (let i = 0; i < headersToGroup.length; i++) {
		if (!(i in headersToGroup)) continue;
		const headerToGroup = headersToGroup[i];
		const latestPendingParentHeader = pendingParentHeaders[pendingParentHeaders.length - 1];
		const isLeafHeader = headerToGroup.column.depth === headerGroup.depth;
		let column;
		let isPlaceholder = false;
		if (isLeafHeader && headerToGroup.column.parent) column = headerToGroup.column.parent;
		else {
			column = headerToGroup.column;
			isPlaceholder = true;
		}
		if (latestPendingParentHeader && latestPendingParentHeader.column === column) latestPendingParentHeader.subHeaders.push(headerToGroup);
		else {
			const header = constructHeader(table, column, {
				id: formatHeaderId(headerFamily, depth, column.id, headerToGroup.id),
				isPlaceholder,
				placeholderId: isPlaceholder ? String(countPendingHeadersForColumn(pendingParentHeaders, column)) : void 0,
				depth,
				index: pendingParentHeaders.length
			});
			header.subHeaders.push(headerToGroup);
			pendingParentHeaders.push(header);
		}
		headerGroup.headers.push(headerToGroup);
		headerToGroup.headerGroup = headerGroup;
	}
	for (let i = 0; i < headerGroupInitFns.length; i++) headerGroupInitFns[i](headerGroup);
	headerGroups.push(headerGroup);
	if (depth > 0) constructHeaderGroup(pendingParentHeaders, depth - 1, table, headerFamily, headerGroups, headerGroupInitFns);
}
function updateHeaderSpans(headers) {
	for (let i = 0; i < headers.length; i++) {
		const header = headers[i];
		if (!callMemoOrStaticFn(header.column, "getIsVisible", column_getIsVisible)) continue;
		let colSpan = 0;
		if (header.subHeaders.length) {
			updateHeaderSpans(header.subHeaders);
			for (let j = 0; j < header.subHeaders.length; j++) {
				const child = header.subHeaders[j];
				if (!callMemoOrStaticFn(child.column, "getIsVisible", column_getIsVisible)) continue;
				colSpan += child.colSpan;
			}
		} else colSpan = 1;
		header.colSpan = colSpan;
		if (header.isPlaceholder && header.subHeaders.length === 1 && header.subHeaders[0].column === header.column) {
			let rowSpan = 1;
			let chainChild = header.subHeaders[0];
			while (chainChild) {
				chainChild.rowSpan = 0;
				rowSpan++;
				chainChild = chainChild.subHeaders.length === 1 && chainChild.subHeaders[0].column === header.column ? chainChild.subHeaders[0] : void 0;
			}
			header.rowSpan = rowSpan;
		} else header.rowSpan = 1;
	}
}
/**
* Builds the nested header group structure for a table.
*
* The result accounts for visible leaf columns, pinned column groups, and placeholder headers needed to render multi-level headers.
*/
function buildHeaderGroups(allColumns, columnsToGroup, table, headerFamily) {
	const maxDepth = getMaxHeaderDepth(allColumns);
	const headerGroups = [];
	const headerGroupInitFns = table._headerGroupInstanceInitFns;
	const bottomHeaders = new Array(columnsToGroup.length);
	for (let i = 0; i < columnsToGroup.length; i++) {
		if (!(i in columnsToGroup)) continue;
		bottomHeaders[i] = constructHeader(table, columnsToGroup[i], {
			depth: maxDepth,
			index: i
		});
	}
	constructHeaderGroup(bottomHeaders, maxDepth - 1, table, headerFamily, headerGroups, headerGroupInitFns);
	headerGroups.reverse();
	updateHeaderSpans(headerGroups[0]?.headers ?? []);
	return headerGroups;
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/columns/constructColumn.js
/**
* Creates or retrieves the column prototype for a table.
* The prototype is cached on the table and shared by all column instances.
*/
function getColumnPrototype(table) {
	if (!table._columnPrototype) {
		table._columnPrototype = { table };
		const features = Object.values(table._features);
		for (let i = 0; i < features.length; i++) features[i].assignColumnPrototype?.(table._columnPrototype, table);
	}
	return table._columnPrototype;
}
/**
* Constructs a column instance from normalized table internals.
*
* This wires core properties, feature prototype APIs, and instance data used by table rendering and row-model operations.
*/
function constructColumn(table, columnDef, depth, parent) {
	const resolvedColumnDef = {
		...table.getDefaultColumnDef(),
		...columnDef
	};
	const accessorKey = resolvedColumnDef.accessorKey;
	const accessorKeyString = accessorKey === void 0 ? void 0 : String(accessorKey);
	const id = resolvedColumnDef.id ?? accessorKeyString?.replaceAll(".", "_") ?? (typeof resolvedColumnDef.header === "string" ? resolvedColumnDef.header : void 0);
	let accessorFn;
	if (resolvedColumnDef.accessorFn) accessorFn = resolvedColumnDef.accessorFn;
	else if (accessorKey !== void 0) if (typeof accessorKey === "string" && accessorKey.includes(".")) {
		const keys = accessorKey.split(".");
		accessorFn = (originalRow) => {
			let result = originalRow;
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				result = result?.[key];
			}
			return result;
		};
	} else accessorFn = (originalRow) => originalRow[resolvedColumnDef.accessorKey];
	if (!id) throw new Error();
	const columnPrototype = getColumnPrototype(table);
	const column = Object.create(columnPrototype);
	column.accessorFn = accessorFn;
	column.columnDef = resolvedColumnDef;
	column.columns = [];
	column.depth = depth;
	column.id = `${String(id)}`;
	column.parent = parent;
	const initFns = table._columnInstanceInitFns;
	for (let i = 0; i < initFns.length; i++) initFns[i](column);
	return column;
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/features/column-ordering/columnOrderingFeature.utils.js
/**
* Creates the ordering function used to arrange leaf columns.
*
* The returned function applies `state.columnOrder`, preserves unspecified
* columns in their original order, then delegates to grouping rules.
*
* @example
* ```ts
* const orderColumnsForTable = table_getOrderColumnsFn(table)
* ```
*/
function table_getOrderColumnsFn(table) {
	const columnOrder = table.atoms.columnOrder?.get();
	return (columns) => {
		let orderedColumns = [];
		if (!columnOrder?.length) orderedColumns = columns;
		else {
			const remaining = /* @__PURE__ */ new Map();
			for (let i = 0; i < columns.length; i++) {
				const column = columns[i];
				remaining.set(column.id, column);
			}
			for (let i = 0; i < columnOrder.length; i++) {
				const id = columnOrder[i];
				const column = remaining.get(id);
				if (column) {
					orderedColumns.push(column);
					remaining.delete(id);
				}
			}
			for (let i = 0; i < columns.length; i++) {
				const column = columns[i];
				if (remaining.has(column.id)) orderedColumns.push(column);
			}
		}
		return orderColumns(table, orderedColumns);
	};
}
/**
* Applies grouped-column placement rules to an already ordered leaf-column list.
*
* `groupedColumnMode: 'remove'` drops grouped columns from the list.
* `groupedColumnMode: 'reorder'` moves grouped columns to the front in grouping
* state order.
*
* @example
* ```ts
* const orderedColumns = orderColumns(table, leafColumns)
* ```
*/
function orderColumns(table, leafColumns) {
	const grouping = table.atoms.grouping?.get() ?? [];
	const { groupedColumnMode } = table.options;
	if (!grouping.length || !groupedColumnMode) return leafColumns;
	const nonGroupingColumns = leafColumns.filter((col) => !grouping.includes(col.id));
	if (groupedColumnMode === "remove") return nonGroupingColumns;
	const leafColumnsById = /* @__PURE__ */ new Map();
	for (let i = 0; i < leafColumns.length; i++) {
		const col = leafColumns[i];
		leafColumnsById.set(col.id, col);
	}
	const groupingColumns = [];
	for (let i = 0; i < grouping.length; i++) {
		const col = leafColumnsById.get(grouping[i]);
		if (col) groupingColumns.push(col);
	}
	return [...groupingColumns, ...nonGroupingColumns];
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/columns/coreColumnsFeature.utils.js
/**
* Flattens this column and every descendant column into a single array.
*
* Group columns appear before their child columns, which matches the normalized
* column hierarchy produced during table construction.
*
* @example
* ```ts
* const flatColumns = column_getFlatColumns(column)
* ```
*/
function column_getFlatColumns(column) {
	return [column, ...column.columns.flatMap((col) => col.getFlatColumns())];
}
/**
* Collects the terminal leaf columns below this column.
*
* Group columns return their ordered descendants. Non-group columns return an
* array containing only the column itself.
*
* @example
* ```ts
* const leafColumns = column_getLeafColumns(column)
* ```
*/
function column_getLeafColumns(column) {
	if (column.columns.length) {
		const leafColumns = column.columns.flatMap((col) => col.getLeafColumns());
		return callMemoOrStaticFn(column.table, "getOrderColumns", table_getOrderColumnsFn)(leafColumns);
	}
	return [column];
}
/**
* Merges built-in, feature, and user default column definitions.
*
* Built-in defaults provide a header and fallback cell renderer, feature
* defaults can add feature-specific column options, and
* `options.defaultColumn` wins last.
*
* @example
* ```ts
* const defaultColumn = table_getDefaultColumnDef(table)
* ```
*/
function table_getDefaultColumnDef(table) {
	return {
		header: (props) => {
			const resolvedColumnDef = props.header.column.columnDef;
			if (resolvedColumnDef.accessorKey) return resolvedColumnDef.accessorKey;
			if (resolvedColumnDef.accessorFn) return resolvedColumnDef.id;
			return null;
		},
		cell: (props) => props.renderValue()?.toString?.() ?? null,
		...Object.values(table._features).reduce((obj, feature) => {
			return Object.assign(obj, feature.getDefaultColumnDef?.());
		}, {}),
		...table.options.defaultColumn
	};
}
function constructColumns(table, columnDefs, parent, depth = 0) {
	const columns = new Array(columnDefs.length);
	for (let i = 0; i < columnDefs.length; i++) {
		if (!(i in columnDefs)) continue;
		const columnDef = columnDefs[i];
		const column = constructColumn(table, columnDef, depth, parent);
		const groupingColumnDef = columnDef;
		column.columns = groupingColumnDef.columns ? constructColumns(table, groupingColumnDef.columns, column, depth + 1) : [];
		columns[i] = column;
	}
	return columns;
}
/**
* Normalizes `options.columns` into the table's nested column tree.
*
* Each column definition is constructed with its parent and depth, and group
* column children are recursively constructed.
*
* @example
* ```ts
* const columns = table_getAllColumns(table)
* ```
*/
function table_getAllColumns(table) {
	return constructColumns(table, table.options.columns);
}
/**
* Flattens every table column, including group columns and leaf columns.
*
* Use this when parent/group columns must be included in addition to data leaf
* columns.
*
* @example
* ```ts
* const flatColumns = table_getAllFlatColumns(table)
* ```
*/
function table_getAllFlatColumns(table) {
	return table.getAllColumns().flatMap((column) => column.getFlatColumns());
}
/**
* Builds an id lookup for every flat column in the table.
*
* Group columns and leaf columns are included. Later columns with the same id
* replace earlier entries.
*
* @example
* ```ts
* const columnsById = table_getAllFlatColumnsById(table)
* ```
*/
function table_getAllFlatColumnsById(table) {
	const result = makeObjectMap();
	const flatColumns = table.getAllFlatColumns();
	for (let i = 0; i < flatColumns.length; i++) {
		const column = flatColumns[i];
		result[column.id] = column;
	}
	return result;
}
/**
* Collects all terminal leaf columns in their current table order.
*
* Column ordering features can reorder the collected leaves before the result
* is returned.
*
* @example
* ```ts
* const leafColumns = table_getAllLeafColumns(table)
* ```
*/
function table_getAllLeafColumns(table) {
	const leafColumns = table.getAllColumns().flatMap((c) => c.getLeafColumns());
	return callMemoOrStaticFn(table, "getOrderColumns", table_getOrderColumnsFn)(leafColumns);
}
/**
* Builds an id lookup for terminal leaf columns only.
*
* Parent/group columns are excluded, making this lookup appropriate for row
* cells and feature state keyed by data columns.
*
* @example
* ```ts
* const leavesById = table_getAllLeafColumnsById(table)
* ```
*/
function table_getAllLeafColumnsById(table) {
	const result = makeObjectMap();
	const leafColumns = table.getAllLeafColumns();
	for (let i = 0; i < leafColumns.length; i++) {
		const column = leafColumns[i];
		result[column.id] = column;
	}
	return result;
}
/**
* Looks up a column by id from the flat column map.
*
* The lookup can return group columns or leaf columns. In development, a
* missing id logs a warning to help catch stale column references.
*
* @example
* ```ts
* const column = table_getColumn(table, 'firstName')
* ```
*/
function table_getColumn(table, columnId) {
	return table.getAllFlatColumnsById()[columnId];
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/columns/coreColumnsFeature.js
/**
* Core feature that builds the column tree and exposes table/column APIs.
*/
var coreColumnsFeature = {
	assignColumnPrototype: (prototype, table) => {
		assignPrototypeAPIs("coreColumnsFeature", prototype, table, {
			column_getFlatColumns: {
				fn: (column) => column_getFlatColumns(column),
				memoDeps: (column) => [column.table.options.columns]
			},
			column_getLeafColumns: {
				fn: (column) => column_getLeafColumns(column),
				memoDeps: (column) => [
					column.table.atoms.columnOrder?.get(),
					column.table.atoms.grouping?.get(),
					column.table.options.columns,
					column.table.options.groupedColumnMode
				]
			}
		});
	},
	constructTableAPIs: (table) => {
		assignTableAPIs("coreColumnsFeature", table, {
			table_getDefaultColumnDef: {
				fn: () => table_getDefaultColumnDef(table),
				memoDeps: () => [table.options.defaultColumn]
			},
			table_getAllColumns: {
				fn: () => table_getAllColumns(table),
				memoDeps: () => [table.options.columns]
			},
			table_getAllFlatColumns: {
				fn: () => table_getAllFlatColumns(table),
				memoDeps: () => [table.options.columns]
			},
			table_getAllFlatColumnsById: {
				fn: () => table_getAllFlatColumnsById(table),
				memoDeps: () => [table.options.columns]
			},
			table_getAllLeafColumns: {
				fn: () => table_getAllLeafColumns(table),
				memoDeps: () => [
					table.atoms.columnOrder?.get(),
					table.atoms.grouping?.get(),
					table.options.columns,
					table.options.groupedColumnMode
				]
			},
			table_getAllLeafColumnsById: {
				fn: () => table_getAllLeafColumnsById(table),
				memoDeps: () => [table.getAllLeafColumns()]
			},
			table_getColumn: { fn: (columnId) => table_getColumn(table, columnId) }
		});
	}
};
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/headers/coreHeadersFeature.utils.js
function collectLeafHeaders(header, leafHeaders) {
	for (let i = 0; i < header.subHeaders.length; i++) collectLeafHeaders(header.subHeaders[i], leafHeaders);
	leafHeaders.push(header);
}
/**
* Walks a header tree and collects all descendant leaf headers.
*
* The header itself is included after its descendants, matching the recursive
* shape used by nested header groups.
*
* @example
* ```ts
* const leafHeaders = header_getLeafHeaders(header)
* ```
*/
function header_getLeafHeaders(header) {
	const leafHeaders = [];
	collectLeafHeaders(header, leafHeaders);
	return leafHeaders;
}
/**
* Builds the render context passed to a column's `header` or `footer` template.
*
* The context contains the header, its column, and the owning table instance.
*
* @example
* ```ts
* const context = header_getContext(header)
* ```
*/
function header_getContext(header) {
	return {
		column: header.column,
		header,
		table: header.column.table
	};
}
/**
* Builds visible header groups for the current column tree.
*
* Column visibility and pinning are applied before groups are built. When no
* columns are pinned, the fast path skips pin partitioning.
*
* @example
* ```ts
* const headerGroups = table_getHeaderGroups(table)
* ```
*/
function table_getHeaderGroups(table) {
	const { start, end } = table.atoms.columnPinning?.get() ?? getDefaultColumnPinningState();
	const allColumns = table.getAllColumns();
	const leafColumns = callMemoOrStaticFn(table, "getVisibleLeafColumns", table_getVisibleLeafColumns);
	if (!start.length && !end.length) return buildHeaderGroups(allColumns, leafColumns, table);
	const leafColumnsById = table.getAllLeafColumnsById();
	const leftColumns = [];
	for (let i = 0; i < start.length; i++) {
		const column = leafColumnsById[start[i]];
		if (column && callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible)) leftColumns.push(column);
	}
	const rightColumns = [];
	for (let i = 0; i < end.length; i++) {
		const column = leafColumnsById[end[i]];
		if (column && callMemoOrStaticFn(column, "getIsVisible", column_getIsVisible)) rightColumns.push(column);
	}
	const centerColumns = leafColumns.filter((column) => !start.includes(column.id) && !end.includes(column.id));
	return buildHeaderGroups(allColumns, [
		...leftColumns,
		...centerColumns,
		...rightColumns
	], table);
}
/**
* Builds footer groups by reversing the current header groups.
*
* Footer rendering uses the same header objects and grouping structure, but
* renders them from leaf level back toward the root.
*
* @example
* ```ts
* const footerGroups = table_getFooterGroups(table)
* ```
*/
function table_getFooterGroups(table) {
	return [...table.getHeaderGroups()].reverse();
}
/**
* Flattens every header from every header group into one array.
*
* The result includes parent headers and placeholder headers, in header-group
* order from top to bottom.
*
* @example
* ```ts
* const flatHeaders = table_getFlatHeaders(table)
* ```
*/
function table_getFlatHeaders(table) {
	const headerGroups = table.getHeaderGroups();
	const result = [];
	for (let i = 0; i < headerGroups.length; i++) {
		const headers = headerGroups[i].headers;
		for (let j = 0; j < headers.length; j++) result.push(headers[j]);
	}
	return result;
}
/**
* Collects only the leaf headers from the current header tree.
*
* Parent/group headers are skipped, making the result suitable for rendering
* one header per visible leaf column.
*
* @example
* ```ts
* const leafHeaders = table_getLeafHeaders(table)
* ```
*/
function table_getLeafHeaders(table) {
	const topHeaders = table.getHeaderGroups()[0]?.headers ?? [];
	const result = [];
	for (let i = 0; i < topHeaders.length; i++) {
		const leafHeaders = topHeaders[i].getLeafHeaders();
		for (let j = 0; j < leafHeaders.length; j++) result.push(leafHeaders[j]);
	}
	return result;
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/headers/coreHeadersFeature.js
/**
* Core feature that builds header groups and exposes header context APIs.
*/
var coreHeadersFeature = {
	assignHeaderPrototype: (prototype, table) => {
		assignPrototypeAPIs("coreHeadersFeature", prototype, table, {
			header_getLeafHeaders: {
				fn: (header) => header_getLeafHeaders(header),
				memoDeps: (header) => [header.column.table.options.columns]
			},
			header_getContext: {
				fn: (header) => header_getContext(header),
				memoDeps: (header) => [header.column.table.options.columns]
			}
		});
	},
	constructTableAPIs: (table) => {
		assignTableAPIs("coreHeadersFeature", table, {
			table_getHeaderGroups: {
				fn: () => table_getHeaderGroups(table),
				memoDeps: () => [
					table.options.columns,
					table.atoms.columnOrder?.get(),
					table.atoms.grouping?.get(),
					table.atoms.columnPinning?.get(),
					table.atoms.columnVisibility?.get(),
					table.options.groupedColumnMode
				]
			},
			table_getFooterGroups: {
				fn: () => table_getFooterGroups(table),
				memoDeps: () => [table.getHeaderGroups()]
			},
			table_getFlatHeaders: {
				fn: () => table_getFlatHeaders(table),
				memoDeps: () => [table.getHeaderGroups()]
			},
			table_getLeafHeaders: {
				fn: () => table_getLeafHeaders(table),
				memoDeps: () => [table.getHeaderGroups()]
			}
		});
	}
};
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/rows/constructRow.js
/**
* Creates or retrieves the row prototype for a table.
* The prototype is cached on the table and shared by all row instances.
*/
function getRowPrototype(table) {
	if (!table._rowPrototype) {
		table._rowPrototype = { table };
		const features = Object.values(table._features);
		for (let i = 0; i < features.length; i++) features[i].assignRowPrototype?.(table._rowPrototype, table);
	}
	return table._rowPrototype;
}
/**
* Constructs a row instance from normalized table internals.
*
* This wires core properties, feature prototype APIs, and instance data used by table rendering and row-model operations.
*/
var constructRow = (table, id, original, rowIndex, depth, subRows, parentId) => {
	const rowPrototype = getRowPrototype(table);
	const row = Object.create(rowPrototype);
	row._displayIndexCache = -1;
	row._uniqueValuesCache = makeObjectMap();
	row._valuesCache = makeObjectMap();
	row.depth = depth;
	row.id = id;
	row.index = rowIndex;
	row.original = original;
	row.parentId = parentId;
	row.subRows = subRows ?? [];
	const initFns = table._rowInstanceInitFns;
	for (let i = 0; i < initFns.length; i++) initFns[i](row);
	return row;
};
//#endregion
//#region node_modules/@tanstack/table-core/dist/features/cell-selection/cellSelectionFeature.utils.js
/**
* Creates the default cell selection state.
*
* The feature default is an empty selection. Reset APIs use this value when
* `defaultState` is `true`.
*
* @example
* ```ts
* const selection = getDefaultCellSelectionState()
* ```
*/
function getDefaultCellSelectionState() {
	return [];
}
/**
* Resets `cellSelection` to the configured initial state or feature default.
*
* With no argument, the reset clones `table.initialState.cellSelection` when it
* exists. Passing `true` ignores initial state and resets to an empty selection.
*
* @example
* ```ts
* table_resetCellSelection(table, true)
* ```
*/
function table_resetCellSelection(table, defaultState) {
	setStateSlice(table, "cellSelection", defaultState ? getDefaultCellSelectionState() : cloneState(table.initialState.cellSelection) ?? getDefaultCellSelectionState());
}
/**
* Schedules a cell selection reset after `data` changes.
*
* Ranges are stored as row and column ids, so without this a data swap would
* leave a selection pointing at rows that no longer exist, or silently
* re-select cells whenever new data reuses ids. The reset runs when
* `autoResetAll` or `autoResetCellSelection` allows it, defaulting to on.
*
* Resetting to `initialState.cellSelection` rather than to empty means the
* first row-model computation is a no-op, matching `table_autoResetExpanded`.
*
* @example
* ```ts
* table_autoResetCellSelection(table)
* ```
*/
function table_autoResetCellSelection(table) {
	if (!table.atoms.cellSelection) return;
	if (table.options.autoResetAll ?? table.options.autoResetCellSelection ?? true) table._reactivity.schedule(() => table_resetCellSelection(table));
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/features/row-expanding/rowExpandingFeature.utils.js
/**
* Schedules an expanded-state reset after row-structure changes.
*
* The reset runs when `autoResetAll`, `autoResetExpanded`, or the default
* client-side expanding behavior allows it. Manual expanding opts out unless
* the reset options explicitly opt back in.
*
* @example
* ```ts
* table_autoResetExpanded(table)
* ```
*/
function table_autoResetExpanded(table) {
	if (!table.atoms.expanded) return;
	if (table.options.autoResetAll ?? table.options.autoResetExpanded ?? !table.options.manualExpanding) table._reactivity.schedule(() => table_resetExpanded(table));
}
/**
* Resets `expanded` to the configured initial state or feature default.
*
* With no argument, the reset clones `table.initialState.expanded` when it
* exists. Passing `true` ignores initial state and resets to `{}`.
*
* @example
* ```ts
* table_resetExpanded(table)
* table_resetExpanded(table, true)
* ```
*/
function table_resetExpanded(table, defaultState) {
	const initialExpanded = table.initialState.expanded;
	setStateSlice(table, "expanded", defaultState ? makeObjectMap() : initialExpanded === true ? true : Object.assign(makeObjectMap(), cloneState(initialExpanded ?? {})));
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/features/row-pagination/rowPaginationFeature.utils.js
var defaultPageIndex = 0;
/**
* Resets the page index when a page-altering change should return to page 0.
*
* The reset runs when `autoResetAll`, `autoResetPageIndex`, or the default
* client-side pagination behavior allows it. Manual pagination opts out unless
* the reset options explicitly opt back in.
*
* @example
* ```ts
* table_autoResetPageIndex(table)
* ```
*/
function table_autoResetPageIndex(table) {
	if (table.options.autoResetAll ?? table.options.autoResetPageIndex ?? !table.options.manualPagination) {
		if ((table.atoms.pagination?.get()?.pageIndex ?? defaultPageIndex) === defaultPageIndex) return;
		table_resetPageIndex(table, true);
	}
}
/**
* Routes a pagination updater through the table's pagination change handler.
*
* The updater may be a next state object or a function of the previous
* `PaginationState`; controlled state and external atoms observe the same
* updater path as the instance API.
*
* @example
* ```ts
* table_setPagination(table, (old) => old)
* ```
*/
function table_setPagination(table, updater) {
	setStateSlice(table, "pagination", updater);
}
/**
* Updates `pagination.pageIndex` and clamps it to the known page range.
*
* Unknown page counts (`undefined` or `-1`) allow any non-negative page index.
* Known page counts clamp the index between `0` and `pageCount - 1`.
*
* @example
* ```ts
* table_setPageIndex(table, (old) => old)
* ```
*/
function table_setPageIndex(table, updater) {
	table_setPagination(table, (old) => {
		let pageIndex = functionalUpdate(updater, old.pageIndex);
		const maxPageIndex = typeof table.options.pageCount === "undefined" || table.options.pageCount === -1 ? Number.MAX_SAFE_INTEGER : table.options.pageCount - 1;
		pageIndex = Math.max(0, Math.min(pageIndex, maxPageIndex));
		return {
			...old,
			pageIndex
		};
	});
}
/**
* Resets only `pagination.pageIndex`.
*
* With no argument, the reset uses `table.initialState.pagination?.pageIndex`
* or `0`. Passing `true` always resets the page index to `0`.
*
* @example
* ```ts
* table_resetPageIndex(table)
* table_resetPageIndex(table, true)
* ```
*/
function table_resetPageIndex(table, defaultState) {
	table_setPageIndex(table, defaultState ? defaultPageIndex : table.initialState.pagination?.pageIndex ?? defaultPageIndex);
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/features/row-sorting/rowSortingFeature.utils.js
/**
* Routes a sorting updater through the table's sorting change handler.
*
* The updater may be a next `SortingState` array or a function of the previous
* sorting state, matching the instance `table.setSorting` behavior. State
* owners receive an equality-guarded updater so structurally equal sorting
* values preserve the owner's existing reference.
*
* @example
* ```ts
* table_setSorting(table, (old) => [...old, { id: 'age', desc: true }])
* ```
*/
function table_setSorting(table, updater) {
	setStateSlice(table, "sorting", updater);
}
/**
* Resets `sorting` to the configured initial state or feature default.
*
* With no argument, the reset clones `table.initialState.sorting` when it
* exists. Passing `true` ignores initial state and resets to `[]`.
*
* @example
* ```ts
* table_resetSorting(table)
* table_resetSorting(table, true)
* ```
*/
function table_resetSorting(table, defaultState) {
	table_setSorting(table, defaultState ? [] : cloneState(table.initialState.sorting ?? []));
}
/**
* Resets sorting after the table data changes when explicitly enabled.
*
* Unlike other auto-reset behaviors, sorting is preserved by default. An
* explicit `autoResetAll` value takes precedence over `autoResetSorting`.
*
* @example
* ```ts
* table_autoResetSorting(table)
* ```
*/
function table_autoResetSorting(table) {
	if (!table.atoms.sorting) return;
	if (table.options.autoResetAll ?? table.options.autoResetSorting ?? false) table_resetSorting(table);
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/row-models/createCoreRowModel.js
/**
* Creates a memoized core row model factory.
*
* The factory reads the relevant table state atoms and options, then returns a row model function used by the table row-model pipeline.
*/
function createCoreRowModel() {
	return (table) => {
		return tableMemo({
			feature: "coreRowModelsFeature",
			table,
			fnName: "table.getCoreRowModel",
			memoDeps: () => [table.options.data],
			fn: () => _createCoreRowModel(table, table.options.data),
			onAfterUpdate: skipFirstRun(() => {
				table_autoResetExpanded(table);
				table_autoResetPageIndex(table);
				table_autoResetSorting(table);
				table_autoResetCellSelection(table);
			})
		});
	};
}
function accessRows(table, rowModel, originalRows, depth = 0, parentRow) {
	const rows = [];
	for (let i = 0; i < originalRows.length; i++) {
		const originalRow = originalRows[i];
		const row = constructRow(table, table.getRowId(originalRow, i, parentRow), originalRow, i, depth, void 0, parentRow?.id);
		rowModel.flatRows.push(row);
		rowModel.rowsById[row.id] = row;
		rows.push(row);
		if (table.options.getSubRows) {
			row.originalSubRows = table.options.getSubRows(originalRow, i);
			if (row.originalSubRows?.length) row.subRows = accessRows(table, rowModel, row.originalSubRows, depth + 1, row);
		}
	}
	return rows;
}
function _createCoreRowModel(table, data) {
	const rowModel = {
		rows: [],
		flatRows: [],
		rowsById: makeObjectMap()
	};
	rowModel.rows = accessRows(table, rowModel, data);
	return rowModel;
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/row-models/coreRowModelsFeature.utils.js
/**
* Resolves the table's unmodified core row model.
*
* The factory is created once per table, either from the `coreRowModel` slot on the `features` option
* or the built-in `createCoreRowModel()`, then reused for later calls.
*
* @example
* ```ts
* const coreRows = table_getCoreRowModel(table)
* ```
*/
function table_getCoreRowModel(table) {
	if (!table._rowModels.coreRowModel) table._rowModels.coreRowModel = table.options.features.coreRowModel?.(table) ?? createCoreRowModel()(table);
	return table._rowModels.coreRowModel();
}
/**
* Reads the row model immediately before column/global filtering.
*
* Filtering is the first derived row-model stage, so this currently aliases
* `table.getCoreRowModel()`.
*
* @example
* ```ts
* const rowsBeforeFiltering = table_getPreFilteredRowModel(table)
* ```
*/
function table_getPreFilteredRowModel(table) {
	return table.getCoreRowModel();
}
/**
* Resolves the row model after column and global filtering.
*
* When `manualFiltering` is enabled, or no filtered row-model factory was
* registered, this returns the pre-filtered row model because filtering is
* expected to happen outside the table.
*
* @example
* ```ts
* const filteredRows = table_getFilteredRowModel(table)
* ```
*/
function table_getFilteredRowModel(table) {
	if (!table._rowModels.filteredRowModel) table._rowModels.filteredRowModel = table.options.features.filteredRowModel?.(table);
	if (table.options.manualFiltering || !table._rowModels.filteredRowModel) return table.getPreFilteredRowModel();
	return table._rowModels.filteredRowModel();
}
/**
* Reads the row model immediately before grouping.
*
* Grouping runs after filtering, so this aliases `table.getFilteredRowModel()`.
*
* @example
* ```ts
* const rowsBeforeGrouping = table_getPreGroupedRowModel(table)
* ```
*/
function table_getPreGroupedRowModel(table) {
	return table.getFilteredRowModel();
}
/**
* Resolves the row model after grouping has produced grouped rows.
*
* When `manualGrouping` is enabled, or no grouped row-model factory was
* registered, this returns the pre-grouped row model unchanged.
*
* @example
* ```ts
* const groupedRows = table_getGroupedRowModel(table)
* ```
*/
function table_getGroupedRowModel(table) {
	if (!table._rowModels.groupedRowModel) table._rowModels.groupedRowModel = table.options.features.groupedRowModel?.(table);
	if (table.options.manualGrouping || !table._rowModels.groupedRowModel) return table.getPreGroupedRowModel();
	return table._rowModels.groupedRowModel();
}
/**
* Reads the row model immediately before sorting.
*
* Sorting runs after grouping, so this aliases `table.getGroupedRowModel()`.
*
* @example
* ```ts
* const rowsBeforeSorting = table_getPreSortedRowModel(table)
* ```
*/
function table_getPreSortedRowModel(table) {
	return table.getGroupedRowModel();
}
/**
* Resolves the row model after sorting has been applied.
*
* When `manualSorting` is enabled, or no sorted row-model factory was
* registered, this returns the pre-sorted row model because sorted data is
* expected to be supplied by the caller.
*
* @example
* ```ts
* const sortedRows = table_getSortedRowModel(table)
* ```
*/
function table_getSortedRowModel(table) {
	if (!table._rowModels.sortedRowModel) table._rowModels.sortedRowModel = table.options.features.sortedRowModel?.(table);
	if (table.options.manualSorting || !table._rowModels.sortedRowModel) return table.getPreSortedRowModel();
	return table._rowModels.sortedRowModel();
}
/**
* Reads the row model immediately before row expansion.
*
* Expansion runs after sorting, so this aliases `table.getSortedRowModel()`.
*
* @example
* ```ts
* const rowsBeforeExpansion = table_getPreExpandedRowModel(table)
* ```
*/
function table_getPreExpandedRowModel(table) {
	return table.getSortedRowModel();
}
/**
* Resolves the row model after expanded rows have been flattened into view.
*
* When `manualExpanding` is enabled, or no expanded row-model factory was
* registered, this returns the pre-expanded row model unchanged.
*
* @example
* ```ts
* const expandedRows = table_getExpandedRowModel(table)
* ```
*/
function table_getExpandedRowModel(table) {
	if (!table._rowModels.expandedRowModel) table._rowModels.expandedRowModel = table.options.features.expandedRowModel?.(table);
	if (table.options.manualExpanding || !table._rowModels.expandedRowModel) return table.getPreExpandedRowModel();
	return table._rowModels.expandedRowModel();
}
/**
* Reads the row model immediately before pagination.
*
* Pagination is the final built-in row-model stage, so this aliases
* `table.getExpandedRowModel()`.
*
* @example
* ```ts
* const rowsBeforePagination = table_getPrePaginatedRowModel(table)
* ```
*/
function table_getPrePaginatedRowModel(table) {
	return table.getExpandedRowModel();
}
/**
* Resolves the row model after pagination has sliced rows for the current page.
*
* When `manualPagination` is enabled, or no paginated row-model factory was
* registered, this returns the pre-paginated row model because pagination is
* expected to happen before data reaches the table.
*
* @example
* ```ts
* const pageRows = table_getPaginatedRowModel(table)
* ```
*/
function table_getPaginatedRowModel(table) {
	if (!table._rowModels.paginatedRowModel) table._rowModels.paginatedRowModel = table.options.features.paginatedRowModel?.(table);
	if (table.options.manualPagination || !table._rowModels.paginatedRowModel) return table.getPrePaginatedRowModel();
	return table._rowModels.paginatedRowModel();
}
/**
* Resolves the final row model consumed by renderers.
*
* This is the end of the built-in row-model pipeline: core -> filtering ->
* grouping -> sorting -> expanding -> pagination.
*
* @example
* ```ts
* const visibleRows = table_getRowModel(table)
* ```
*/
function table_getRowModel(table) {
	return table.getPaginatedRowModel();
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/row-models/coreRowModelsFeature.js
/**
* Core feature that wires table row-model accessors and row-model caches.
*/
var coreRowModelsFeature = { constructTableAPIs: (table) => {
	assignTableAPIs("coreRowModelsFeature", table, {
		table_getCoreRowModel: { fn: () => table_getCoreRowModel(table) },
		table_getPreFilteredRowModel: { fn: () => table_getPreFilteredRowModel(table) },
		table_getFilteredRowModel: { fn: () => table_getFilteredRowModel(table) },
		table_getPreGroupedRowModel: { fn: () => table_getPreGroupedRowModel(table) },
		table_getGroupedRowModel: { fn: () => table_getGroupedRowModel(table) },
		table_getPreSortedRowModel: { fn: () => table_getPreSortedRowModel(table) },
		table_getSortedRowModel: { fn: () => table_getSortedRowModel(table) },
		table_getPreExpandedRowModel: { fn: () => table_getPreExpandedRowModel(table) },
		table_getExpandedRowModel: { fn: () => table_getExpandedRowModel(table) },
		table_getPrePaginatedRowModel: { fn: () => table_getPrePaginatedRowModel(table) },
		table_getPaginatedRowModel: { fn: () => table_getPaginatedRowModel(table) },
		table_getRowModel: { fn: () => table_getRowModel(table) }
	});
} };
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/cells/constructCell.js
/**
* Creates or retrieves the cell prototype for a table.
* The prototype is cached on the table and shared by all cell instances.
*/
function getCellPrototype(table) {
	if (!table._cellPrototype) {
		table._cellPrototype = { table };
		const features = Object.values(table._features);
		for (let i = 0; i < features.length; i++) features[i].assignCellPrototype?.(table._cellPrototype, table);
	}
	return table._cellPrototype;
}
/**
* Constructs a cell instance from normalized table internals.
*
* This wires core properties, feature prototype APIs, and instance data used by table rendering and row-model operations.
*/
function constructCell(column, row, table) {
	const cellPrototype = getCellPrototype(table);
	const cell = Object.create(cellPrototype);
	cell.column = column;
	cell.id = `${row.id}_${column.id}`;
	cell.row = row;
	const initFns = table._cellInstanceInitFns;
	for (let i = 0; i < initFns.length; i++) initFns[i](cell);
	return cell;
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/rows/coreRowsFeature.utils.js
/**
* Returns this row's zero-based position in the current pre-pagination row
* model. Rows outside that model return `-1`.
*/
function row_getDisplayIndex(row) {
	const rows = row.table.getRowsInDisplayOrder();
	const displayIndex = row._displayIndexCache;
	return rows[displayIndex] === row ? displayIndex : -1;
}
/**
* Returns the rows in the current display order after assigning their
* zero-based display indexes.
*
* When expanded rows bypass pagination, expanded descendants are inserted into
* the returned order even though they are absent from the pre-pagination row
* model.
*/
function table_getRowsInDisplayOrder(table) {
	const rows = table.getPrePaginatedRowModel().rows;
	if (table.options.paginateExpandedRows === false) {
		const displayRows = [];
		const handleRow = (row) => {
			row._displayIndexCache = displayRows.length;
			displayRows.push(row);
			if (row.subRows.length && row.getIsExpanded?.()) row.subRows.forEach(handleRow);
		};
		rows.forEach(handleRow);
		return displayRows;
	}
	for (let i = 0; i < rows.length; i++) rows[i]._displayIndexCache = i;
	return rows;
}
/**
* Reads and caches this row's value for a column.
*
* The value is produced by the column accessor. Missing columns or display
* columns without an accessor return `undefined`.
*
* @example
* ```ts
* const firstName = row_getValue(row, 'firstName')
* ```
*/
function row_getValue(row, columnId) {
	if (hasOwn(row._valuesCache, columnId)) return row._valuesCache[columnId];
	const column = row.table.getColumn(columnId);
	if (!column?.accessorFn) return;
	row._valuesCache[columnId] = column.accessorFn(row.original, row.index);
	return row._valuesCache[columnId];
}
/**
* Reads and caches the values used by faceting/grouping for a column.
*
* If the column defines `getUniqueValues`, that result is used. Otherwise the
* row's accessor value is wrapped in a single-item array.
*
* @example
* ```ts
* const values = row_getUniqueValues(row, 'tags')
* ```
*/
function row_getUniqueValues(row, columnId) {
	if (hasOwn(row._uniqueValuesCache, columnId)) return row._uniqueValuesCache[columnId];
	const column = row.table.getColumn(columnId);
	if (!column?.accessorFn) return;
	if (!column.columnDef.getUniqueValues) {
		row._uniqueValuesCache[columnId] = [row.getValue(columnId)];
		return row._uniqueValuesCache[columnId];
	}
	row._uniqueValuesCache[columnId] = column.columnDef.getUniqueValues(row.original, row.index);
	return row._uniqueValuesCache[columnId];
}
/**
* Returns a renderable row value for a column.
*
* If the accessor value is nullish, the table's `renderFallbackValue` is used
* instead.
*
* @example
* ```ts
* const value = row_renderValue(row, 'firstName')
* ```
*/
function row_renderValue(row, columnId) {
	return row.getValue(columnId) ?? row.table.options.renderFallbackValue;
}
/**
* Flattens this row's descendant tree into leaf rows.
*
* The row itself is not included; only nested `subRows` are walked.
*
* @example
* ```ts
* const descendants = row_getLeafRows(row)
* ```
*/
function row_getLeafRows(row) {
	return flattenBy(row.subRows, (d) => d.subRows);
}
/**
* Returns the deepest structural row depth in the core row model.
* Root rows are depth `0`, their direct sub-rows are depth `1`, and so on.
*/
function table_getMaxSubRowDepth(table) {
	const rows = table.getCoreRowModel().flatRows;
	let maxDepth = 0;
	for (let i = 0; i < rows.length; i++) maxDepth = Math.max(maxDepth, rows[i].depth);
	return maxDepth;
}
/**
* Looks up this row's direct parent, if it has one.
*
* Parent lookup prefers the core row model for structural parents, then falls
* back to the pre-pagination row model for generated parent rows.
*
* @example
* ```ts
* const parent = row_getParentRow(row)
* ```
*/
function row_getParentRow(row) {
	if (!row.parentId) return;
	return row.table.getCoreRowModel().rowsById[row.parentId] ?? row.table.getRow(row.parentId, true);
}
/**
* Collects this row's ancestor chain from root to direct parent.
*
* The current row is not included. Rows without a parent return an empty array.
*
* @example
* ```ts
* const ancestors = row_getParentRows(row)
* ```
*/
function row_getParentRows(row) {
	const parentRows = [];
	let currentRow = row;
	while (true) {
		const parentRow = currentRow.getParentRow();
		if (!parentRow) break;
		parentRows.push(parentRow);
		currentRow = parentRow;
	}
	return parentRows.reverse();
}
/**
* Constructs one cell for each leaf column in this row.
*
* The result follows `table.getAllLeafColumns()` order and includes hidden
* columns; visibility-specific APIs filter this list later.
*
* @example
* ```ts
* const cells = row_getAllCells(row)
* ```
*/
function row_getAllCells(row) {
	const columns = row.table.getAllLeafColumns();
	let cache = row._cellsCache;
	if (!cache) cache = row._cellsCache = /* @__PURE__ */ new WeakMap();
	const cells = new Array(columns.length);
	for (let i = 0; i < columns.length; i++) {
		const column = columns[i];
		let cell = cache.get(column);
		if (!cell) {
			cell = constructCell(column, row, row.table);
			cache.set(column, cell);
		}
		cells[i] = cell;
	}
	return cells;
}
/**
* Builds a lookup map of this row's cells keyed by column id.
*
* This is the static implementation behind `row.getAllCellsByColumnId()`.
*
* @example
* ```ts
* const cellsById = row_getAllCellsByColumnId(row)
* ```
*/
function row_getAllCellsByColumnId(row) {
	const result = makeObjectMap();
	const cells = row.getAllCells();
	for (let i = 0; i < cells.length; i++) {
		const cell = cells[i];
		result[cell.column.id] = cell;
	}
	return result;
}
/**
* Resolves the stable id for a row.
*
* `options.getRowId` wins when provided. Otherwise root rows use their index
* and child rows append their index to the parent id, such as `0.2`.
*
* @example
* ```ts
* const id = table_getRowId(originalRow, table, index, parentRow)
* ```
*/
function table_getRowId(originalRow, table, index, parent) {
	return table.options.getRowId?.(originalRow, index, parent) ?? (parent ? `${parent.id}.${index}` : String(index));
}
/**
* Looks up a row by id from the current or full row model.
*
* By default this searches `table.getRowModel()`. Passing `searchAll` searches
* the pre-pagination model first, then falls back to the core model.
*
* @example
* ```ts
* const row = table_getRow(table, rowId, true)
* ```
*/
function table_getRow(table, rowId, searchAll) {
	let row = (searchAll ? table.getPrePaginatedRowModel() : table.getRowModel()).rowsById[rowId];
	if (!row) {
		row = table.getCoreRowModel().rowsById[rowId];
		if (!row) throw new Error();
	}
	return row;
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/rows/coreRowsFeature.js
/**
* Core feature that creates row APIs for values, cells, and tree traversal.
*/
var coreRowsFeature = {
	assignRowPrototype: (prototype, table) => {
		assignPrototypeAPIs("coreRowsFeature", prototype, table, {
			row_getDisplayIndex: { fn: (row) => row_getDisplayIndex(row) },
			row_getAllCellsByColumnId: {
				fn: (row) => row_getAllCellsByColumnId(row),
				memoDeps: (row) => [row.getAllCells()]
			},
			row_getAllCells: {
				fn: (row) => row_getAllCells(row),
				memoDeps: (row) => [row.table.getAllLeafColumns()]
			},
			row_getLeafRows: {
				fn: (row) => row_getLeafRows(row),
				memoDeps: (row) => [row.subRows]
			},
			row_getParentRow: { fn: (row) => row_getParentRow(row) },
			row_getParentRows: { fn: (row) => row_getParentRows(row) },
			row_getUniqueValues: { fn: (row, columnId) => row_getUniqueValues(row, columnId) },
			row_getValue: { fn: (row, columnId) => row_getValue(row, columnId) },
			row_renderValue: { fn: (row, columnId) => row_renderValue(row, columnId) }
		});
	},
	constructTableAPIs: (table) => {
		assignTableAPIs("coreRowsFeature", table, {
			table_getRowsInDisplayOrder: {
				fn: () => table_getRowsInDisplayOrder(table),
				memoDeps: () => [
					table.getPrePaginatedRowModel().rows,
					table.options.paginateExpandedRows,
					table.options.paginateExpandedRows === false ? table.atoms.expanded?.get() : void 0
				]
			},
			table_getRowId: { fn: (originalRow, index, parent) => table_getRowId(originalRow, table, index, parent) },
			table_getRow: { fn: (id, searchAll) => table_getRow(table, id, searchAll) },
			table_getMaxSubRowDepth: {
				fn: () => table_getMaxSubRowDepth(table),
				memoDeps: () => [table.getCoreRowModel()]
			}
		});
	}
};
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/table/coreTablesFeature.utils.js
/**
* Synchronizes externally controlled state slices into the table's base atoms.
*
* This keeps `options.state` values mirrored in the atom graph so derived
* atoms, stores, and table APIs read a consistent snapshot.
*
* Adapters that update options during their host's render phase pass the
* state snapshot captured by the committed render as `capturedState` — the
* shared options object may already hold values from a newer render that
* never commits. Pass `null` to publish nothing (a captured "no controlled
* state"); omitting the argument reads the current `table.options.state`
* instead. An optional `compare` suppresses semantically unchanged slice
* writes; the default remains reference equality.
*
* @example
* ```ts
* table_syncExternalStateToBaseAtoms(table)
* table_syncExternalStateToBaseAtoms(table, capturedState ?? null, shallow)
* ```
*/
function table_syncExternalStateToBaseAtoms(table, capturedState, compare = (currentState, externalState) => currentState === externalState) {
	const state = capturedState === void 0 ? table.options.state : capturedState;
	table._reactivity.batch(() => {
		if (state) for (const key in state) {
			const baseAtom = table.baseAtoms[key];
			if (!baseAtom) continue;
			const rawExternalState = state[key];
			const externalState = rawExternalState === void 0 ? table.initialState[key] : rawExternalState;
			if (!compare(table._reactivity.untrack(() => baseAtom.get()), externalState)) baseAtom.set(() => externalState);
		}
	});
}
/**
* Publishes captured controlled state after a host framework commits.
*
* Render-phase adapters stage options without synchronizing base atoms, then
* pass the state captured by the committed render here. The commit signal also
* invalidates ownership changes when no base atom was written.
*/
function table_publishExternalState(table, state, compare = (currentState, externalState) => currentState === externalState) {
	table._reactivity.batch(() => {
		table_syncExternalStateToBaseAtoms(table, state, compare);
		table._reactivity.commit?.();
	});
}
/**
* Resets all internal table base atoms to `table.initialState`, then clears
* transient instance data through registered feature reset hooks.
*
* This resets internally owned state slices in a single reactivity batch. Use
* feature-specific reset APIs when a slice may be externally owned.
*
* @example
* ```ts
* table_reset(table)
* ```
*/
function table_reset(table) {
	const snap = cloneState(table.initialState);
	table._reactivity.batch(() => {
		const keys = Object.keys(snap);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			table.baseAtoms[key].set(snap[key]);
		}
	});
	const features = Object.values(table._features);
	for (let i = 0; i < features.length; i++) features[i].resetTableInstanceData?.(table);
}
/**
* Merges new table options with the current resolved options.
*
* If `options.mergeOptions` is provided, it owns the merge behavior; otherwise
* options are shallow-merged. Static options that should never change after
* initialization are restored on a fresh object so framework merge helpers may
* return readonly getter/proxy objects.
*
* @example
* ```ts
* const options = table_mergeOptions(table, nextOptions)
* ```
*/
function table_mergeOptions(table, newOptions) {
	const { features, atoms, initialState } = table.options;
	if (!table.options.mergeOptions) return {
		...table.options,
		...newOptions,
		features,
		atoms,
		initialState
	};
	const mergedOptions = table.options.mergeOptions(table.options, newOptions);
	const descriptors = { ...Object.getOwnPropertyDescriptors(mergedOptions) };
	return Object.defineProperties(Object.create(Object.getPrototypeOf(mergedOptions)), {
		...descriptors,
		features: {
			value: features,
			enumerable: true,
			configurable: true,
			writable: true
		},
		atoms: {
			value: atoms,
			enumerable: true,
			configurable: true,
			writable: true
		},
		initialState: {
			value: initialState,
			enumerable: true,
			configurable: true,
			writable: true
		}
	});
}
/**
* Updates the table options object.
*
* The updater receives the current resolved options and the merged result is
* immediately assigned to the table instance.
*
* @example
* ```ts
* table_setOptions(table, (old) => old)
* table_setOptions(table, (old) => old, { syncExternalState: false })
* ```
*/
function table_setOptions(table, updater, options) {
	const mergedOptions = table_mergeOptions(table, functionalUpdate(updater, table.options));
	if (table.optionsStore) table.optionsStore.set(() => mergedOptions);
	else table.options = mergedOptions;
	if (options?.syncExternalState !== false) table_publishExternalState(table, mergedOptions.state ?? null);
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/coreFeatures.js
/**
* The built-in core feature set required by every table.
*
* These features provide table, column, row, header, cell, and core row-model behavior before optional feature plugins are added.
*/
var coreFeatures = {
	coreCellsFeature,
	coreColumnsFeature,
	coreHeadersFeature,
	coreRowModelsFeature,
	coreRowsFeature,
	coreTablesFeature: { constructTableAPIs: (table) => {
		assignTableAPIs("coreTablesFeature", table, {
			table_reset: { fn: () => table_reset(table) },
			table_setOptions: { fn: (updater) => table_setOptions(table, updater) }
		});
	} }
};
//#endregion
//#region node_modules/@tanstack/table-core/node_modules/@tanstack/store/dist/shallow.js
function shallow(objA, objB) {
	if (Object.is(objA, objB)) return true;
	if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) return false;
	if (objA instanceof Map && objB instanceof Map) {
		if (objA.size !== objB.size) return false;
		for (const [k, v] of objA) if (!objB.has(k) || !Object.is(v, objB.get(k))) return false;
		return true;
	}
	if (objA instanceof Set && objB instanceof Set) {
		if (objA.size !== objB.size) return false;
		for (const v of objA) if (!objB.has(v)) return false;
		return true;
	}
	if (objA instanceof Date && objB instanceof Date) {
		if (objA.getTime() !== objB.getTime()) return false;
		return true;
	}
	const keysA = getOwnKeys(objA);
	if (keysA.length !== getOwnKeys(objB).length) return false;
	for (let i = 0; i < keysA.length; i++) if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) return false;
	return true;
}
function getOwnKeys(obj) {
	return Object.keys(obj).concat(Object.getOwnPropertySymbols(obj));
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/core/table/constructTable.js
/**
* Builds the initial table state from registered features and user initial state.
*
* Each feature contributes its default state before user-provided `initialState` values are merged in.
*/
function getInitialTableState(features, initialState = {}) {
	Object.values(features).forEach((feature) => {
		initialState = feature.getInitialState?.(initialState) ?? initialState;
	});
	return cloneState(initialState);
}
/**
* Constructs a table instance from normalized table internals.
*
* This wires core properties, feature prototype APIs, and instance data used by table rendering and row-model operations.
*/
function constructTable(tableOptions) {
	const _reactivity = tableOptions.features.coreReactivityFeature;
	const { aggregationFns, columnMeta: _columnMeta, coreRowModel, expandedRowModel, facetedMinMaxValues, facetedRowModel, facetedUniqueValues, filterFns, filterMeta: _filterMeta, filteredRowModel, groupedRowModel, paginatedRowModel, sortFns, sortedRowModel, tableMeta: _tableMeta, ...features } = tableOptions.features;
	const table = {
		_cellInstanceInitFns: [],
		_columnInstanceInitFns: [],
		_features: {
			...coreFeatures,
			...features
		},
		_headerGroupInstanceInitFns: [],
		_headerInstanceInitFns: [],
		_reactivity,
		_rowInstanceInitFns: [],
		_rowModelFns: {
			aggregationFns,
			filterFns,
			sortFns
		},
		_rowModels: {},
		atoms: {},
		baseAtoms: {}
	};
	const featuresList = Object.values(table._features);
	const mergedOptions = {
		...featuresList.reduce((obj, feature) => {
			return Object.assign(obj, feature.getDefaultTableOptions?.(table));
		}, {}),
		...tableOptions
	};
	if (_reactivity.wrapExternalAtoms && mergedOptions.atoms) for (const [atomKey, _atom] of Object.entries(mergedOptions.atoms)) {
		const atom = _atom;
		const wrappedAtom = _reactivity.createWritableAtom(atom.get(), { debugName: `externalAtom/${atomKey}` });
		mergedOptions.atoms[atomKey] = wrappedAtom;
		let syncExternal = false;
		const syncAtomToWrappedSub = atom.subscribe((value) => {
			if (syncExternal) return;
			wrappedAtom.set(value);
		});
		const syncWrappedToAtomSub = wrappedAtom.subscribe((value) => {
			syncExternal = true;
			atom.set(value);
			syncExternal = false;
		});
		_reactivity.addSubscription(syncAtomToWrappedSub);
		_reactivity.addSubscription(syncWrappedToAtomSub);
	}
	if (_reactivity.createOptionsStore) {
		table.optionsStore = _reactivity.createWritableAtom(mergedOptions, { debugName: "table/optionsStore" });
		Object.defineProperty(table, "options", {
			configurable: true,
			enumerable: true,
			get() {
				return table.optionsStore.get();
			},
			set(value) {
				table.optionsStore.set(() => value);
			}
		});
	} else table.options = mergedOptions;
	table.initialState = getInitialTableState(table._features, table.options.initialState);
	const stateKeys = Object.keys(table.initialState);
	for (let i = 0; i < stateKeys.length; i++) {
		const key = stateKeys[i];
		table.baseAtoms[key] = _reactivity.createWritableAtom(table.initialState[key], { debugName: `table/baseAtoms/${key}` });
		table.atoms[key] = _reactivity.createReadonlyAtom(() => {
			const options = table.options;
			const externalAtom = options.atoms?.[key];
			const reactiveState = externalAtom ? externalAtom.get() : table.baseAtoms[key].get();
			if (externalAtom) return reactiveState;
			const controlledState = options.state;
			if (controlledState && hasOwn(controlledState, key)) {
				const controlledValue = controlledState[key];
				return controlledValue === void 0 ? table.initialState[key] : controlledValue;
			}
			return reactiveState;
		}, { debugName: `table/atoms/${key}` });
	}
	table_syncExternalStateToBaseAtoms(table);
	table.store = atomToStore(_reactivity.createReadonlyAtom(() => {
		const snapshot = {};
		for (let i = 0; i < stateKeys.length; i++) {
			const key = stateKeys[i];
			snapshot[key] = table.atoms[key].get();
		}
		return snapshot;
	}, {
		compare: shallow,
		debugName: "table/store"
	}));
	for (let i = 0; i < featuresList.length; i++) {
		const feature = featuresList[i];
		feature.initTableInstanceData?.(table);
		if (feature.initCellInstanceData) table._cellInstanceInitFns.push(feature.initCellInstanceData.bind(feature));
		if (feature.initColumnInstanceData) table._columnInstanceInitFns.push(feature.initColumnInstanceData.bind(feature));
		if (feature.initHeaderGroupInstanceData) table._headerGroupInstanceInitFns.push(feature.initHeaderGroupInstanceData.bind(feature));
		if (feature.initHeaderInstanceData) table._headerInstanceInitFns.push(feature.initHeaderInstanceData.bind(feature));
		if (feature.initRowInstanceData) table._rowInstanceInitFns.push(feature.initRowInstanceData.bind(feature));
		feature.constructTableAPIs?.(table);
	}
	return table;
}
//#endregion
//#region node_modules/@tanstack/react-table/dist/useTable.js
var useIsomorphicLayoutEffect = typeof window === "undefined" ? import_react.useEffect : import_react.useLayoutEffect;
/**
* Creates a React table instance backed by TanStack Store atoms.
*
* The optional selector projects from `table.store`; the selected value is
* exposed on `table.state` and compared shallowly for React re-renders. Omit
* the selector to subscribe to every registered table state slice, or pass a
* narrower selector and use `table.Subscribe` lower in the tree for targeted
* subscriptions.
*
* @example
* ```tsx
* const table = useTable(
*   {
*     features,
*     columns,
*     data,
*   },
*   (state) => ({ pagination: state.pagination }),
* )
*
* table.state.pagination
* ```
*/
function useTable(tableOptions, selector) {
	const [{ table, rootSource }] = (0, import_react.useState)(() => {
		const tableInstance = constructTable({
			...tableOptions,
			features: {
				coreReactivityFeature: reactReactivity(),
				...tableOptions.features
			}
		});
		tableInstance.Subscribe = ((props) => {
			return Subscribe({
				...props,
				source: props.source ?? tableInstance.store
			});
		});
		tableInstance.FlexRender = FlexRender;
		return {
			table: tableInstance,
			rootSource: createRenderPhaseSource(tableInstance.store, shallow$1)
		};
	});
	const coreTable = table;
	table_setOptions(coreTable, (prev) => ({
		...prev,
		...tableOptions
	}), { syncExternalState: false });
	const controlledState = coreTable.options.state;
	const renderSnapshot = rootSource.get();
	const state = useSelector(rootSource, selector, { compare: shallow$1 });
	useIsomorphicLayoutEffect(() => {
		rootSource.markCommitted(renderSnapshot);
		table_publishExternalState(coreTable, controlledState ?? null, shallow$1);
	});
	return (0, import_react.useMemo)(() => ({
		...table,
		options: tableOptions,
		state
	}), [
		table,
		tableOptions,
		state
	]);
}
//#endregion
export { assignPrototypeAPIs as _, column_toggleVisibility as a, flexRender as b, row_getVisibleCellsByColumnId as c, table_getToggleAllColumnsVisibilityHandler as d, table_getVisibleFlatColumns as f, table_toggleAllColumnsVisible as g, table_setColumnVisibility as h, column_getToggleVisibilityHandler as i, table_getIsAllColumnsVisible as l, table_resetColumnVisibility as m, column_getCanHide as n, getDefaultColumnVisibilityState as o, table_getVisibleLeafColumns as p, column_getIsVisible as r, row_getVisibleCells as s, useTable as t, table_getIsSomeColumnsVisible as u, assignTableAPIs as v, makeStateUpdater as y };
