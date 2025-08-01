import {
	useQuery,
	useSuspenseQuery,
	type QueryObserverRefetchErrorResult,
	type UseQueryOptions,
	type UseSuspenseQueryOptions,
	type UseSuspenseQueryResult,
} from '@tanstack/react-query';
import {
	type ColumnDef,
	type ColumnFiltersState,
	type ExpandedState,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	type VisibilityState,
	getCoreRowModel,
	getExpandedRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getGroupedRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';
import { cn, filterSchema, paginationSchema, sortSchema } from '@/lib/utils';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { z } from 'zod';
import { parseAsJson, useQueryState } from 'nuqs';
import DataTableDisplay from '@/components/ui/data-table/display';

type DataTableFilterQuerySchema = z.infer<typeof filterSchema>;

function initializeFiltersFromQuery<TData, TValue>(
	filters: DataTableFilterQuerySchema,
	columns: ColumnDef<TData, TValue>[]
) {
	return filters && filters?.length > 0
		? filters.map((f) => {
				const columnMeta = columns.find((c) => c.id === f.id)!.meta!;

				// const values =
				// 	columnMeta.type === 'date' ? f.value.values.map((v: string) => new Date(v)) : f.value.values;

				return {
					...f,
					value: {
						operator: f.value.operator,
						values: f.value.values,
						columnMeta,
					},
				};
			})
		: [];
}

export interface DataTableProps<TData, TValue> {
	options: UseSuspenseQueryOptions<{ data: TData[]; count: number }>;
	// options: Omit<
	// 	QueryObserverRefetchErrorResult<{ data: TData[]; count: number }, Error>,
	// 	'promise' | 'isPlaceholderData'
	// >;
	columns: ColumnDef<TData, TValue>[];
	getSubRows?:
		| ((originalRow: TData, index: number) => TData[] | undefined)
		| undefined;
	className?: string;
	hideFilter?: boolean;
	hidePagination?: boolean;
	hideHeader?: boolean;
}

export function DataTable<TData, TValue>({
	options,
	columns,
	getSubRows,
	className,
	hideFilter,
	hidePagination,
	hideHeader,
}: DataTableProps<TData, TValue>) {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const [queryFilters, setQueryFilters] = useQueryState(
		'filter',
		parseAsJson(filterSchema.parse).withDefault([])
	);
	const [queryPagination, setQueryPagination] = useQueryState(
		'pagination',
		parseAsJson(paginationSchema.parse).withDefault({
			page: 1,
			pageSize: 25,
		})
	);
	const [querySort, setQuerySort] = useQueryState(
		'sort',
		parseAsJson(sortSchema.parse).withDefault({
			field: '',
			direction: 'asc',
		})
	);

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
		// Replace `Issue` with your data type
		() =>
			initializeFiltersFromQuery(
				queryFilters,
				columns as ColumnDef<TData, TValue>[]
			)
	);
	const [pagination, onPaginationChange] = useState<PaginationState>({
		pageSize: queryPagination.pageSize,
		pageIndex: queryPagination.page,
	});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		{}
	);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [grouping, setGrouping] = useState<string[]>([]);
	const [expanded, setExpanded] = useState<ExpandedState>({});

	const { data: initialData, isLoading } = useSuspenseQuery(options);

	// Step 5: Create our TanStack Table instance
	const table = useReactTable({
		data: initialData?.data ?? initialData ?? [],
		columns,
		onSortingChange: setSorting,
		enableGrouping: true,
		getSubRows,
		onPaginationChange,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onExpandedChange: setExpanded,
		onGroupingChange: setGrouping,
		getGroupedRowModel: getGroupedRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		manualPagination: true,
		manualFiltering: true,
		manualSorting: true,
		rowCount: initialData?.count ?? initialData?.length ?? 0,
		state: {
			sorting,
			columnVisibility,
			columnFilters,
			pagination,
			rowSelection,
			grouping,
			expanded,
		},
	});

	useEffect(() => {
		setQueryFilters(
			columnFilters.map((f) => ({
				id: f.id,
				value: { ...(f.value as any), columnMeta: undefined },
			}))
		);
	}, [columnFilters, setQueryFilters]);

	useEffect(() => {
		if (hidePagination) return;
		setQueryPagination({
			page: pagination.pageIndex,
			pageSize: pagination.pageSize,
		});
	}, [pagination, setQueryPagination, hidePagination]);

	useEffect(() => {
		if (hideHeader) return;
		setQuerySort({
			field: sorting[0]?.id ?? '',
			direction: sorting[0]?.desc ? 'desc' : 'asc',
		});
	}, [sorting, setQuerySort, hideHeader]);

	return (
		<section className={cn('space-y-3 overflow-x-auto', className)}>
			{/* {!hideFilter && <DataTableFilter table={table} />} */}

			<DataTableDisplay
				table={table}
				columns={columns}
			/>

			{!hidePagination && <DataTablePagination table={table} />}
		</section>
	);
}
