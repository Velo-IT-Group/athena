"use client";
import type { Conditions, KeyValue } from "@/utils/manage/params";
import {
	functionalUpdate,
	makeStateUpdater,
	type OnChangeFn,
	type RowData,
	type Table,
	type TableFeature,
	type Updater,
} from "@tanstack/react-table";

// define types for our new feature's custom state
export interface ParameterTableState<TData> {
	parameters: Conditions<TData>;
}

// define types for our new feature's table options
export interface ParameterOptions<TData> {
	enableParameters?: boolean;
	onParameterChange?: OnChangeFn<Conditions<TData>>;
}

// Define types for our new feature's table APIs
export interface ParameterInstance<TData> {
	setParameter: (updater: Updater<Conditions<TData>>) => void;
	setCondition: (condition: KeyValue) => void;
	removeCondition: (key: string) => void;
	resetConditions: (conditions?: Conditions<TData>) => void;
	setSort: (orderBy?: { key: keyof TData; order?: "asc" | "desc" }) => void;
}

// Use declaration merging to add our new feature APIs and state types to TanStack Table's existing types.
declare module "@tanstack/react-table" {
	// or whatever framework adapter you are using
	// interface TData extends RowData
	//merge our new feature's state with the existing table state
	interface TableState extends ParameterTableState<any> {}
	//merge our new feature's options with the existing table options
	interface TableOptionsResolved<TData extends RowData>
		extends ParameterOptions<TData> {}
	//merge our new feature's instance APIs with the existing table instance APIs
	interface Table<TData extends RowData> extends ParameterInstance<TData> {}
	// if you need to add cell instance APIs...
	// interface Cell<TData extends RowData, TValue> extends DensityCell
	// if you need to add row instance APIs...
	// interface Row<TData extends RowData> extends DensityRow
	// if you need to add column instance APIs...
	// interface Column<TData extends RowData, TValue> extends DensityColumn
	// if you need to add header instance APIs...
	// interface Header<TData extends RowData, TValue> extends DensityHeader

	// Note: declaration merging on `ColumnDef` is not possible because it is a complex type, not an interface.
	// But you can still use declaration merging on `ColumnDef.meta`
}

export const ParameterFeature: TableFeature<any> = {
	//Use the TableFeature type!!
	// define the new feature's initial state
	getInitialState: (state): ParameterTableState<any> => {
		return {
			parameters: {},
			...state,
		};
	},

	// define the new feature's default options
	getDefaultOptions: <TData extends RowData>(
		table: Table<TData>,
	): ParameterOptions<TData> => {
		return {
			enableParameters: true,
			onParameterChange: makeStateUpdater("parameters", table),
		} as ParameterOptions<TData>;
	},
	// if you need to add a default column definition...
	// getDefaultColumnDef: <TData extends RowData>(): Partial<ColumnDef<TData>> => {
	//   return { meta: {} } //use meta instead of directly adding to the columnDef to avoid typescript stuff that's hard to workaround
	// },

	// define the new feature's table instance methods
	createTable: <TData extends RowData>(table: Table<TData>): void => {
		table.setParameter = (updater) => {
			const safeUpdater: Updater<Conditions<TData>> = (old) => {
				const newState = functionalUpdate(updater, old);
				// console.log(newState)

				return newState;
			};
			return table.options.onParameterChange?.(safeUpdater);
		};
		table.setCondition = (value) => {
			table.setParameter((old) => {
				// console.log(old, value)
				//   if (value) return value
				const newParameters = {
					...old,
					conditions: {
						// @ts-ignore
						...(old.conditions ?? {}),
						...value,
					},
				} as Conditions<TData>;

				// console.log(old, old.conditions, newParameters)
				return newParameters;
			});
		};
		table.removeCondition = (value) => {
			table.setParameter((old) => {
				// console.log(old, value)
				//   if (value) return value
				// @ts-ignore
				delete old.conditions?.[value];
				const newParameters = {
					...old,
					conditions: {
						// @ts-ignore
						...(old.conditions ?? {}),
					},
				} as Conditions<TData>;

				// console.log(old, old.conditions, newParameters)
				return newParameters;
			});
		};
		table.resetConditions = (value) => {
			table.setParameter((old) => {
				if (value?.conditions) {
					old.conditions = value.conditions;
				} else {
					delete old.conditions;
				}
				return old;
			});
		};
		table.setSort = (value) => {
			// console.log(value)
			table.setParameter((old) => {
				if (value) {
					old.orderBy = value;
				}
				return old;
			});
		};
	},
	// if you need to add row instance APIs...
	// createRow: <TData extends RowData>(row, table): void => {},
	// if you need to add cell instance APIs...
	// createCell: <TData extends RowData>(cell, column, row, table): void => {},
	// if you need to add column instance APIs...
	// createColumn: <TData extends RowData>(column, table): void => {},
	// if you need to add header instance APIs...
	// createHeader: <TData extends RowData>(header, table): void => {},
};
