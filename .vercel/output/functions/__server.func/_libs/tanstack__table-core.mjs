import { _ as assignPrototypeAPIs, a as column_toggleVisibility, c as row_getVisibleCellsByColumnId, d as table_getToggleAllColumnsVisibilityHandler, f as table_getVisibleFlatColumns, g as table_toggleAllColumnsVisible, h as table_setColumnVisibility, i as column_getToggleVisibilityHandler, l as table_getIsAllColumnsVisible, m as table_resetColumnVisibility, n as column_getCanHide, o as getDefaultColumnVisibilityState, p as table_getVisibleLeafColumns, r as column_getIsVisible, s as row_getVisibleCells, u as table_getIsSomeColumnsVisible, v as assignTableAPIs, y as makeStateUpdater } from "./@tanstack/react-table+[...].mjs";
//#region node_modules/@tanstack/table-core/dist/helpers/tableFeatures.js
/**
* A helper function to help define the features that are to be imported and applied to a table instance.
* Use this utility to make it easier to have the correct type inference for the features that are being imported.
* **Note:** It is recommended to use this utility statically outside of a component.
*
* Alongside feature modules, this object carries everything else that is
* statically stitched into the table:
*
* - Row model factories (`sortedRowModel`, `filteredRowModel`, etc.)
* - Row model function registries (`sortFns`, `filterFns`, `aggregationFns`),
*   whose keys become the valid string values for `sortFn`, `filterFn`,
*   `globalFilterFn`, and `aggregationFn` with full inference
* - Type-only `tableMeta`/`columnMeta` slots for declaring per-table meta types
*   instead of using global declaration merging. The values are phantom
*   (ignored and stripped at runtime); only their types are used.
* @example
* ```
* import {
*   columnFilteringFeature,
*   createFilteredRowModel,
*   createSortedRowModel,
*   filterFn_includesString,
*   rowSortingFeature,
*   sortFn_alphanumeric,
*   sortFn_text,
*   tableFeatures,
* } from '@tanstack/react-table'
* const features = tableFeatures({
*   columnFilteringFeature,
*   rowSortingFeature,
*   filteredRowModel: createFilteredRowModel(),
*   sortedRowModel: createSortedRowModel(),
*   filterFns: { includesString: filterFn_includesString, myCustomFilterFn },
*   sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
*   tableMeta: {} as { updateData: (rowIndex: number, columnId: string, value: unknown) => void },
*   columnMeta: {} as { align?: 'left' | 'right' },
* });
* const table = useTable({ features, columns, data });
* ```
*/
function tableFeatures(features) {
	return features;
}
//#endregion
//#region node_modules/@tanstack/table-core/dist/features/column-visibility/columnVisibilityFeature.js
/**
* Feature that adds column visibility state and APIs for hiding and showing columns.
*/
var columnVisibilityFeature = {
	getInitialState: (initialState) => {
		return {
			columnVisibility: getDefaultColumnVisibilityState(),
			...initialState
		};
	},
	getDefaultTableOptions: (table) => {
		return { onColumnVisibilityChange: makeStateUpdater("columnVisibility", table) };
	},
	assignColumnPrototype: (prototype, table) => {
		assignPrototypeAPIs("columnVisibilityFeature", prototype, table, {
			column_getIsVisible: {
				fn: (column) => column_getIsVisible(column),
				memoDeps: (column) => [
					table.options.columns,
					table.atoms.columnVisibility?.get(),
					column.columns
				]
			},
			column_getCanHide: { fn: (column) => column_getCanHide(column) },
			column_getToggleVisibilityHandler: { fn: (column) => column_getToggleVisibilityHandler(column) },
			column_toggleVisibility: { fn: (column, visible) => column_toggleVisibility(column, visible) }
		});
	},
	assignRowPrototype: (prototype, table) => {
		assignPrototypeAPIs("columnVisibilityFeature", prototype, table, {
			row_getVisibleCells: {
				fn: (row) => row_getVisibleCells(row),
				memoDeps: (row) => [
					row.getAllCells(),
					table.atoms.columnPinning?.get(),
					table.atoms.columnVisibility?.get()
				]
			},
			row_getVisibleCellsByColumnId: {
				fn: (row) => row_getVisibleCellsByColumnId(row),
				memoDeps: (row) => [row.getAllCells(), table.atoms.columnVisibility?.get()]
			}
		});
	},
	constructTableAPIs: (table) => {
		assignTableAPIs("columnVisibilityFeature", table, {
			table_getVisibleFlatColumns: {
				fn: () => table_getVisibleFlatColumns(table),
				memoDeps: () => [
					table.atoms.columnVisibility?.get(),
					table.atoms.columnOrder?.get(),
					table.atoms.grouping?.get(),
					table.options.columns,
					table.options.groupedColumnMode
				]
			},
			table_getVisibleLeafColumns: {
				fn: () => table_getVisibleLeafColumns(table),
				memoDeps: () => [
					table.atoms.columnVisibility?.get(),
					table.atoms.columnOrder?.get(),
					table.atoms.grouping?.get(),
					table.options.columns,
					table.options.groupedColumnMode
				]
			},
			table_setColumnVisibility: { fn: (updater) => table_setColumnVisibility(table, updater) },
			table_resetColumnVisibility: { fn: (defaultState) => table_resetColumnVisibility(table, defaultState) },
			table_toggleAllColumnsVisible: { fn: (value) => table_toggleAllColumnsVisible(table, value) },
			table_getIsAllColumnsVisible: { fn: () => table_getIsAllColumnsVisible(table) },
			table_getIsSomeColumnsVisible: { fn: () => table_getIsSomeColumnsVisible(table) },
			table_getToggleAllColumnsVisibilityHandler: { fn: () => table_getToggleAllColumnsVisibilityHandler(table) }
		});
	}
};
//#endregion
export { tableFeatures as n, columnVisibilityFeature as t };
