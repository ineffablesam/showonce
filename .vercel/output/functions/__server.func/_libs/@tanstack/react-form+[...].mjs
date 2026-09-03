import { i as __toESM, t as __commonJSMin } from "../../_runtime.mjs";
import { a as functionalUpdate, i as FormApi, n as FormGroupApi, o as uuid, r as FieldApi, t as mergeAndUpdate } from "./form-core+[...].mjs";
//#region node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
//#endregion
//#region node_modules/react/jsx-runtime.js
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_production();
}));
//#endregion
//#region node_modules/react/cjs/react.production.js
/**
* @license React
* react.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
	var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
	var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
	var REACT_CONTEXT_TYPE = Symbol.for("react.context");
	var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
	var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
	var REACT_MEMO_TYPE = Symbol.for("react.memo");
	var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ReactNoopUpdateQueue = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	};
	var assign = Object.assign;
	var emptyObject = {};
	function Component(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	Component.prototype.isReactComponent = {};
	Component.prototype.setState = function(partialState, callback) {
		if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, partialState, callback, "setState");
	};
	Component.prototype.forceUpdate = function(callback) {
		this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
	};
	function ComponentDummy() {}
	ComponentDummy.prototype = Component.prototype;
	function PureComponent(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
	pureComponentPrototype.constructor = PureComponent;
	assign(pureComponentPrototype, Component.prototype);
	pureComponentPrototype.isPureReactComponent = !0;
	var isArrayImpl = Array.isArray;
	function noop() {}
	var ReactSharedInternals = {
		H: null,
		A: null,
		T: null,
		S: null
	};
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result;
			ctor = ctor();
			ctor.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject;
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error;
			});
			-1 === payload._status && (payload._status = 0, payload._result = ctor);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	};
	var Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
			return children;
		}
	};
	exports.Activity = REACT_ACTIVITY_TYPE;
	exports.Children = Children;
	exports.Component = Component;
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.PureComponent = PureComponent;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(size) {
			return ReactSharedInternals.H.useMemoCache(size);
		}
	};
	exports.cache = function(fn) {
		return function() {
			return fn.apply(null, arguments);
		};
	};
	exports.cacheSignal = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createContext = function(defaultValue) {
		defaultValue = {
			$$typeof: REACT_CONTEXT_TYPE,
			_currentValue: defaultValue,
			_currentValue2: defaultValue,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		};
		defaultValue.Provider = defaultValue;
		defaultValue.Consumer = {
			$$typeof: REACT_CONSUMER_TYPE,
			_context: defaultValue
		};
		return defaultValue;
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.startTransition = function(scope) {
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		ReactSharedInternals.T = currentTransition;
		try {
			var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
		} catch (error) {
			reportGlobalError(error);
		} finally {
			null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	};
	exports.unstable_useCacheRefresh = function() {
		return ReactSharedInternals.H.useCacheRefresh();
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useActionState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useActionState(action, initialState, permalink);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useContext = function(Context) {
		return ReactSharedInternals.H.useContext(Context);
	};
	exports.useDebugValue = function() {};
	exports.useDeferredValue = function(value, initialValue) {
		return ReactSharedInternals.H.useDeferredValue(value, initialValue);
	};
	exports.useEffect = function(create, deps) {
		return ReactSharedInternals.H.useEffect(create, deps);
	};
	exports.useEffectEvent = function(callback) {
		return ReactSharedInternals.H.useEffectEvent(callback);
	};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useImperativeHandle = function(ref, create, deps) {
		return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
	};
	exports.useInsertionEffect = function(create, deps) {
		return ReactSharedInternals.H.useInsertionEffect(create, deps);
	};
	exports.useLayoutEffect = function(create, deps) {
		return ReactSharedInternals.H.useLayoutEffect(create, deps);
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.useOptimistic = function(passthrough, reducer) {
		return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
	};
	exports.useReducer = function(reducer, initialArg, init) {
		return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
	};
	exports.useRef = function(initialValue) {
		return ReactSharedInternals.H.useRef(initialValue);
	};
	exports.useState = function(initialState) {
		return ReactSharedInternals.H.useState(initialState);
	};
	exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
		return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	};
	exports.useTransition = function() {
		return ReactSharedInternals.H.useTransition();
	};
	exports.version = "19.2.8";
}));
//#endregion
//#region node_modules/react/index.js
var require_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_production();
}));
//#endregion
//#region node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.production.js
/**
* @license React
* use-sync-external-store-shim.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_use_sync_external_store_shim_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	function is(x, y) {
		return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is;
	var useState = React.useState;
	var useEffect = React.useEffect;
	var useLayoutEffect = React.useLayoutEffect;
	var useDebugValue = React.useDebugValue;
	function useSyncExternalStore$2(subscribe, getSnapshot) {
		var value = getSnapshot(), _useState = useState({ inst: {
			value,
			getSnapshot
		} }), inst = _useState[0].inst, forceUpdate = _useState[1];
		useLayoutEffect(function() {
			inst.value = value;
			inst.getSnapshot = getSnapshot;
			checkIfSnapshotChanged(inst) && forceUpdate({ inst });
		}, [
			subscribe,
			value,
			getSnapshot
		]);
		useEffect(function() {
			checkIfSnapshotChanged(inst) && forceUpdate({ inst });
			return subscribe(function() {
				checkIfSnapshotChanged(inst) && forceUpdate({ inst });
			});
		}, [subscribe]);
		useDebugValue(value);
		return value;
	}
	function checkIfSnapshotChanged(inst) {
		var latestGetSnapshot = inst.getSnapshot;
		inst = inst.value;
		try {
			var nextValue = latestGetSnapshot();
			return !objectIs(inst, nextValue);
		} catch (error) {
			return !0;
		}
	}
	function useSyncExternalStore$1(subscribe, getSnapshot) {
		return getSnapshot();
	}
	var shim = "undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement ? useSyncExternalStore$1 : useSyncExternalStore$2;
	exports.useSyncExternalStore = void 0 !== React.useSyncExternalStore ? React.useSyncExternalStore : shim;
}));
//#endregion
//#region node_modules/use-sync-external-store/shim/index.js
var require_shim = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_use_sync_external_store_shim_production();
}));
//#endregion
//#region node_modules/use-sync-external-store/cjs/use-sync-external-store-shim/with-selector.production.js
/**
* @license React
* use-sync-external-store-shim/with-selector.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_with_selector_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	var shim = require_shim();
	function is(x, y) {
		return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is;
	var useSyncExternalStore = shim.useSyncExternalStore;
	var useRef = React.useRef;
	var useEffect = React.useEffect;
	var useMemo = React.useMemo;
	var useDebugValue = React.useDebugValue;
	exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
		var instRef = useRef(null);
		if (null === instRef.current) {
			var inst = {
				hasValue: !1,
				value: null
			};
			instRef.current = inst;
		} else inst = instRef.current;
		instRef = useMemo(function() {
			function memoizedSelector(nextSnapshot) {
				if (!hasMemo) {
					hasMemo = !0;
					memoizedSnapshot = nextSnapshot;
					nextSnapshot = selector(nextSnapshot);
					if (void 0 !== isEqual && inst.hasValue) {
						var currentSelection = inst.value;
						if (isEqual(currentSelection, nextSnapshot)) return memoizedSelection = currentSelection;
					}
					return memoizedSelection = nextSnapshot;
				}
				currentSelection = memoizedSelection;
				if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
				var nextSelection = selector(nextSnapshot);
				if (void 0 !== isEqual && isEqual(currentSelection, nextSelection)) return memoizedSnapshot = nextSnapshot, currentSelection;
				memoizedSnapshot = nextSnapshot;
				return memoizedSelection = nextSelection;
			}
			var hasMemo = !1, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
			return [function() {
				return memoizedSelector(getSnapshot());
			}, null === maybeGetServerSnapshot ? void 0 : function() {
				return memoizedSelector(maybeGetServerSnapshot());
			}];
		}, [
			getSnapshot,
			getServerSnapshot,
			selector,
			isEqual
		]);
		var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
		useEffect(function() {
			inst.hasValue = !0;
			inst.value = value;
		}, [value]);
		useDebugValue(value);
		return value;
	};
}));
//#endregion
//#region node_modules/use-sync-external-store/shim/with-selector.js
var require_with_selector = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_with_selector_production();
}));
//#endregion
//#region node_modules/@tanstack/react-form/node_modules/@tanstack/react-store/dist/useSelector.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_with_selector = require_with_selector();
function defaultCompare(a, b) {
	return a === b;
}
/**
* Selects a slice of state from an atom or store and subscribes the component
* to that selection.
*
* This is the primary React read hook for TanStack Store. It works with any
* source that exposes `get()` and `subscribe()`, including atoms, readonly
* atoms, stores, and readonly stores.
*
* Omit the selector to subscribe to the whole value.
*
* @example
* ```tsx
* const count = useSelector(counterStore, (state) => state.count)
* ```
*
* @example
* ```tsx
* const value = useSelector(countAtom)
* ```
*/
function useSelector(source, selector = (s) => s, options) {
	const compare = options?.compare ?? defaultCompare;
	const subscribe = (0, import_react.useCallback)((handleStoreChange) => {
		const { unsubscribe } = source.subscribe(handleStoreChange);
		return unsubscribe;
	}, [source]);
	const getSnapshot = (0, import_react.useCallback)(() => source.get(), [source]);
	return (0, import_with_selector.useSyncExternalStoreWithSelector)(subscribe, getSnapshot, getSnapshot, selector, compare);
}
//#endregion
//#region node_modules/@tanstack/react-form/dist/esm/useIsomorphicLayoutEffect.js
var import_jsx_runtime = require_jsx_runtime();
var useIsomorphicLayoutEffect = typeof window !== "undefined" ? import_react.useLayoutEffect : import_react.useEffect;
//#endregion
//#region node_modules/@tanstack/react-form/dist/esm/useField.js
function useField(opts) {
	const [prevOptions, setPrevOptions] = (0, import_react.useState)(() => ({
		form: opts.form,
		name: opts.name
	}));
	const [fieldApiState, setFieldApi] = (0, import_react.useState)(() => {
		return new FieldApi({ ...opts });
	});
	let fieldApi = fieldApiState;
	if (prevOptions.form !== opts.form || prevOptions.name !== opts.name) {
		fieldApi = new FieldApi({ ...opts });
		setFieldApi(fieldApi);
		setPrevOptions({
			form: opts.form,
			name: opts.name
		});
	}
	const reactiveStateValue = useSelector(fieldApi.store, opts.mode === "array" ? (state) => state.meta._arrayVersion || 0 : (state) => state.value);
	const reactiveMetaIsTouched = useSelector(fieldApi.store, (state) => state.meta.isTouched);
	const reactiveMetaIsBlurred = useSelector(fieldApi.store, (state) => state.meta.isBlurred);
	const reactiveMetaIsDirty = useSelector(fieldApi.store, (state) => state.meta.isDirty);
	const reactiveMetaErrorMap = useSelector(fieldApi.store, (state) => state.meta.errorMap);
	const reactiveMetaErrorSourceMap = useSelector(fieldApi.store, (state) => state.meta.errorSourceMap);
	const reactiveMetaIsValidating = useSelector(fieldApi.store, (state) => state.meta.isValidating);
	const extendedFieldApi = (0, import_react.useMemo)(() => {
		return {
			...fieldApi,
			get state() {
				return {
					value: opts.mode === "array" ? fieldApi.state.value : reactiveStateValue,
					get meta() {
						return {
							...fieldApi.state.meta,
							isTouched: reactiveMetaIsTouched,
							isBlurred: reactiveMetaIsBlurred,
							isDirty: reactiveMetaIsDirty,
							errorMap: reactiveMetaErrorMap,
							errorSourceMap: reactiveMetaErrorSourceMap,
							isValidating: reactiveMetaIsValidating
						};
					}
				};
			}
		};
	}, [
		fieldApi,
		opts.mode,
		reactiveStateValue,
		reactiveMetaIsTouched,
		reactiveMetaIsBlurred,
		reactiveMetaIsDirty,
		reactiveMetaErrorMap,
		reactiveMetaErrorSourceMap,
		reactiveMetaIsValidating
	]);
	useIsomorphicLayoutEffect(fieldApi.mount, [fieldApi]);
	useIsomorphicLayoutEffect(() => {
		fieldApi.update(opts);
	});
	return extendedFieldApi;
}
var Field = (({ children, ...fieldOptions }) => {
	const fieldApi = useField(fieldOptions);
	const jsxToDisplay = (0, import_react.useMemo)(() => functionalUpdate(children, fieldApi), [children, fieldApi]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: jsxToDisplay });
});
//#endregion
//#region node_modules/@tanstack/react-form/dist/esm/useUUID.js
function useUUID() {
	return (0, import_react.useState)(() => uuid())[0];
}
//#endregion
//#region node_modules/@tanstack/react-form/dist/esm/useFormId.js
var _React = import_react;
var useFormId = "19.2.8".split(".")[0] === "17" ? useUUID : _React.useId;
//#endregion
//#region node_modules/@tanstack/react-form/dist/esm/useFormGroup.js
function useFormGroup(opts) {
	const [prevOptions, setPrevOptions] = (0, import_react.useState)(() => ({
		form: opts.form,
		name: opts.name
	}));
	const [formGroupApi, setFormGroupApi] = (0, import_react.useState)(() => {
		return new FormGroupApi({ ...opts });
	});
	if (prevOptions.form !== opts.form || prevOptions.name !== opts.name) {
		setFormGroupApi(new FormGroupApi({ ...opts }));
		setPrevOptions({
			form: opts.form,
			name: opts.name
		});
	}
	const reactiveStateValue = useSelector(formGroupApi.store, (state) => state.value);
	const reactiveMetaIsTouched = useSelector(formGroupApi.store, (state) => state.meta.isTouched);
	const reactiveMetaIsBlurred = useSelector(formGroupApi.store, (state) => state.meta.isBlurred);
	const reactiveMetaIsDirty = useSelector(formGroupApi.store, (state) => state.meta.isDirty);
	const reactiveMetaErrorMap = useSelector(formGroupApi.store, (state) => state.meta.errorMap);
	const reactiveMetaErrorSourceMap = useSelector(formGroupApi.store, (state) => state.meta.errorSourceMap);
	const reactiveMetaIsValidating = useSelector(formGroupApi.store, (state) => state.meta.isValidating);
	const reactiveMetaIsSubmitting = useSelector(formGroupApi.store, (state) => state.meta.isSubmitting);
	const reactiveMetaIsSubmitted = useSelector(formGroupApi.store, (state) => state.meta.isSubmitted);
	const reactiveMetaSubmissionAttempts = useSelector(formGroupApi.store, (state) => state.meta.submissionAttempts);
	const reactiveMetaIsSubmitSuccessful = useSelector(formGroupApi.store, (state) => state.meta.isSubmitSuccessful);
	const reactiveMetaCanSubmit = useSelector(formGroupApi.store, (state) => state.meta.canSubmit);
	const reactiveMetaIsValid = useSelector(formGroupApi.store, (state) => state.meta.isValid);
	const reactiveMetaIsFieldsValid = useSelector(formGroupApi.store, (state) => state.meta.isFieldsValid);
	const reactiveMetaIsFieldsValidating = useSelector(formGroupApi.store, (state) => state.meta.isFieldsValidating);
	const reactiveMetaIsGroupValid = useSelector(formGroupApi.store, (state) => state.meta.isGroupValid);
	const extendedFieldApi = (0, import_react.useMemo)(() => {
		return {
			...formGroupApi,
			handleSubmit: ((...props) => {
				return formGroupApi._handleSubmit(...props);
			}),
			get state() {
				return {
					...formGroupApi.state,
					value: reactiveStateValue,
					get meta() {
						return {
							...formGroupApi.state.meta,
							isTouched: reactiveMetaIsTouched,
							isBlurred: reactiveMetaIsBlurred,
							isDirty: reactiveMetaIsDirty,
							errorMap: reactiveMetaErrorMap,
							errorSourceMap: reactiveMetaErrorSourceMap,
							isValidating: reactiveMetaIsValidating,
							isSubmitting: reactiveMetaIsSubmitting,
							isSubmitted: reactiveMetaIsSubmitted,
							submissionAttempts: reactiveMetaSubmissionAttempts,
							isSubmitSuccessful: reactiveMetaIsSubmitSuccessful,
							canSubmit: reactiveMetaCanSubmit,
							isValid: reactiveMetaIsValid,
							isFieldsValid: reactiveMetaIsFieldsValid,
							isFieldsValidating: reactiveMetaIsFieldsValidating,
							isGroupValid: reactiveMetaIsGroupValid
						};
					}
				};
			}
		};
	}, [
		formGroupApi,
		reactiveStateValue,
		reactiveMetaIsTouched,
		reactiveMetaIsBlurred,
		reactiveMetaIsDirty,
		reactiveMetaErrorMap,
		reactiveMetaErrorSourceMap,
		reactiveMetaIsValidating,
		reactiveMetaIsSubmitting,
		reactiveMetaIsSubmitted,
		reactiveMetaSubmissionAttempts,
		reactiveMetaIsSubmitSuccessful,
		reactiveMetaCanSubmit,
		reactiveMetaIsValid,
		reactiveMetaIsFieldsValid,
		reactiveMetaIsFieldsValidating,
		reactiveMetaIsGroupValid
	]);
	useIsomorphicLayoutEffect(formGroupApi.mount, [formGroupApi]);
	useIsomorphicLayoutEffect(() => {
		formGroupApi.update(opts);
	});
	return extendedFieldApi;
}
var FormGroup = (({ children, ...formGroupOptions }) => {
	const formGroupApi = useFormGroup(formGroupOptions);
	const jsxToDisplay = (0, import_react.useMemo)(() => functionalUpdate(children, formGroupApi), [children, formGroupApi]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: jsxToDisplay });
});
//#endregion
//#region node_modules/@tanstack/react-form/dist/esm/useForm.js
function LocalSubscribe({ form, selector = (state) => state, children }) {
	const data = useSelector(form.store, selector);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: functionalUpdate(children, data) });
}
function useForm(opts) {
	const fallbackFormId = useFormId();
	const [prevFormId, setPrevFormId] = (0, import_react.useState)(opts?.formId);
	const [formApi, setFormApi] = (0, import_react.useState)(() => {
		return new FormApi({
			...opts,
			formId: opts?.formId ?? fallbackFormId
		});
	});
	if (prevFormId !== opts?.formId) {
		const formId = opts?.formId ?? fallbackFormId;
		setFormApi(new FormApi({
			...opts,
			formId
		}));
		setPrevFormId(formId);
	}
	const extendedFormApi = (0, import_react.useMemo)(() => {
		const extendedApi = {
			...formApi,
			handleSubmit: ((...props) => {
				return formApi._handleSubmit(...props);
			}),
			get formId() {
				return formApi._formId;
			},
			get state() {
				return formApi.store.state;
			}
		};
		extendedApi.Field = function APIField(props) {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
				...props,
				form: formApi
			});
		};
		extendedApi.FormGroup = function APIFormGroup(props) {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FormGroup, {
				...props,
				form: formApi
			});
		};
		extendedApi.Subscribe = function Subscribe(props) {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocalSubscribe, {
				form: formApi,
				selector: props.selector,
				children: props.children
			});
		};
		return extendedApi;
	}, [formApi]);
	useIsomorphicLayoutEffect(formApi.mount, []);
	useIsomorphicLayoutEffect(() => {
		formApi.update(opts);
	});
	const hasRan = (0, import_react.useRef)(false);
	useIsomorphicLayoutEffect(() => {
		if (!hasRan.current) return;
		if (!opts?.transform) return;
		mergeAndUpdate(formApi, opts.transform);
	}, [formApi, opts?.transform]);
	useIsomorphicLayoutEffect(() => {
		hasRan.current = true;
	});
	return extendedFormApi;
}
//#endregion
export { require_jsx_runtime as i, require_with_selector as n, require_react as r, useForm as t };
