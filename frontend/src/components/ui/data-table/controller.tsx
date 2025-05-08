'use client';

import * as React from 'react';
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	useReactTable,
	type Row,
} from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { DataTablePagination } from './pagination';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import type { Serializable, SerializerStringifyBy } from '@tanstack/react-router';
import { DataTableFilter } from '@/components/data-table-filter';

interface DataTableControllerProps<TData, TValue> extends DataTableProps<TData, TValue> {
	initialData: { data: SerializerStringifyBy<TData, Serializable>[]; count: number };
}

export function DataTableController<TData, TValue>({
	columns,
	queryFn,
	validator,
	className,
	initialData,
}: DataTableControllerProps<TData, TValue>) {
	// const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
	const [rowSelection, setRowSelection] = React.useState({});

	const { data } = useQuery({
		queryKey: ['data-table', validator],
		queryFn: () => queryFn({ data: validator }),
		initialData,
	});

	// Step 5: Create our TanStack Table instance
	const table = useReactTable({
		data: [],
		columns: [],
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onRowSelectionChange: setRowSelection,
		state: {
			rowSelection,
		},
	});

	return (
		<section className={cn('space-y-3 overflow-x-auto p-[4px]', className)}>
			<DataTableFilter table={table} />
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											colSpan={header.colSpan}
											className='text-sm'
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>

					<TableBody className='overflow-x-auto'>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className='text-sm'
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className='h-24 text-center'
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<DataTablePagination table={table} />{' '}
		</section>
	);
}

import { Table as ReactTable } from '@tanstack/react-table';
import { updateProduct } from '@/lib/supabase/update';
import { createProduct } from '@/lib/supabase/create';
import { SortableItem, SortableItemHandle } from '../sortable';
import { toast } from 'sonner';
import type { DataTableProps } from '@/components/ui/data-table';

interface DataTablePaginationProps<TData> {
	table: ReactTable<TData>;
	hideHeader?: boolean;
	type: string;
}

export function DraggableDataTable<TData>({ table, hideHeader = false }: DataTablePaginationProps<TData>) {
	'use no memo';
	return (
		<div className='rounded-md border'>
			<Table>
				{!hideHeader && (
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											colSpan={header.colSpan}
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
				)}

				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<DraggableRow
								key={row.id}
								row={row}
							/>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={table.getAllColumns().length}
								className='h-24 text-center'
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}

const DraggableRow = <TData,>({ row }: { row: Row<TData> }) => {
	return (
		<SortableItem
			key={row.id}
			value={row.id}
			asChild
		>
			<TableRow
				data-state={row.getIsSelected() && 'selected'}
				className={cn(row.depth ? 'bg-muted/50' : '', 'relative')}
			>
				{row.getVisibleCells().map((cell) => (
					<>
						{cell.column.id === 'drag' ? (
							<SortableItemHandle
								key={cell.id}
								asChild
							>
								<TableCell className='hover:opacity-100 opacity-100'>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							</SortableItemHandle>
						) : (
							<TableCell key={cell.id}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</TableCell>
						)}
					</>
				))}
			</TableRow>
		</SortableItem>
	);
};
