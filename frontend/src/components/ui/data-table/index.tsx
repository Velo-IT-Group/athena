import { useQuery, type UseMutateFunction, type UseQueryOptions } from '@tanstack/react-query';
import { DataTableFilter } from '@/components/data-table-filter';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
	type ColumnDef,
	type ColumnFiltersState,
	type ExpandedState,
	type PaginationState,
	type RowData,
	type RowSelectionState,
	type SortingState,
	type VisibilityState,
	flexRender,
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
import { cn, paginationSchema, sortSchema } from '@/lib/utils';
import { DataTablePagination } from '@/components/ui/data-table/pagination';
import { z } from 'zod';
import { parseAsJson, useQueryState } from 'nuqs';
import type { LinkOptions } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import DataTableDisplay from '@/components/ui/data-table/display';

export const dataTableFilterQuerySchema = z
	.object({
		id: z.string(),
		value: z.object({
			operator: z.string(),
			values: z.any(),
		}),
	})
	.array()
	.min(0);

// export const dataTableFilterQuerySchemas = z
// 	.object({
// 		filters: dataTableFilterQuerySchema,
// 		sort: z.string().optional(),
// 		page: z.number().optional(),
// 		pageSize: z.number().optional(),
// 	})
// 	.optional();

type DataTableFilterQuerySchema = z.infer<typeof dataTableFilterQuerySchema>;

function initializeFiltersFromQuery<TData, TValue>(
	filters: DataTableFilterQuerySchema,
	columns: ColumnDef<TData, TValue>[]
) {
	return filters && filters?.length > 0
		? filters.map((f) => {
				const columnMeta = columns.find((c) => c.id === f.id)!.meta!;

				const values =
					columnMeta.type === 'date' ? f.value.values.map((v: string) => new Date(v)) : f.value.values;

				return {
					...f,
					value: {
						operator: f.value.operator,
						values,
						columnMeta,
					},
				};
		  })
		: [];
}

declare module '@tanstack/react-table' {
	interface TableMeta<TData extends RowData> {
		rowLink?: LinkOptions;
		updateProduct?: UseMutateFunction<
			void,
			Error,
			{
				id: string;
				product: ProductUpdate;
			},
			{
				previousItems: NestedProduct[] | undefined;
				newItems: NestedProduct[];
			}
		>;
		deleteProduct?: UseMutateFunction<
			void,
			Error,
			{
				id: string;
			},
			{
				previousItems: NestedProduct[];
				newItems: NestedProduct[];
			}
		>;
	}
}

export interface DataTableProps<TData, TValue> {
	options: UseQueryOptions<{ data: TData[]; count: number }>;
	columns: ColumnDef<TData, TValue>[];
	getSubRows?: ((originalRow: TData, index: number) => TData[] | undefined) | undefined;
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
		parseAsJson(dataTableFilterQuerySchema.parse).withDefault([])
	);
	const [queryPagination, setQueryPagination] = useQueryState(
		'pagination',
		parseAsJson(paginationSchema.parse).withDefault({ page: 1, pageSize: 25 })
	);
	const [querySort, setQuerySort] = useQueryState(
		'sort',
		parseAsJson(sortSchema.parse).withDefault({ field: '', direction: 'asc' })
	);

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
		// Replace `Issue` with your data type
		() => initializeFiltersFromQuery(queryFilters, columns as ColumnDef<TData, TValue>[])
	);
	const [pagination, onPaginationChange] = useState<PaginationState>({
		pageSize: queryPagination.pageSize,
		pageIndex: queryPagination.page,
	});
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [sorting, setSorting] = useState<SortingState>([]);
	const [grouping, setGrouping] = useState<string[]>([]);
	const [expanded, setExpanded] = useState<ExpandedState>({});

	const { data: initialData, isLoading } = useQuery(options);

	// Step 5: Create our TanStack Table instance
	const table = useReactTable({
		data: initialData?.data ?? [],
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
		rowCount: initialData?.count ?? 0,
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
		<section className={cn('space-y-3 overflow-x-auto p-[4px]', className)}>
			{!hideFilter && <DataTableFilter table={table} />}

			<DataTableDisplay
				table={table}
				columns={columns}
			/>

			{!hidePagination && <DataTablePagination table={table} />}
		</section>
	);
}
