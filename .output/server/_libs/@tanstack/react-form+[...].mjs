import { i as __toESM, t as __commonJSMin } from "../../_runtime.mjs";
import { n as require_react, r as require_jsx_runtime } from "../react+solar-icons__react.mjs";
import { a as functionalUpdate, i as FormApi, n as FormGroupApi, o as uuid, r as FieldApi, t as mergeAndUpdate } from "./form-core+[...].mjs";
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
export { require_with_selector as n, useForm as t };
