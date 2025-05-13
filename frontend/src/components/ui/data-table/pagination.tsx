import { ChevronLeftIcon, ChevronRightIcon, ChevronsRight, ChevronsLeft } from 'lucide-react';
import type { Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataTablePaginationProps<TData> {
	table: Table<TData>;
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
	return (
		<div className='flex items-center justify-between px-2'>
			<div className='flex-1 text-sm text-muted-foreground'>
				{/* {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected. */}
			</div>

			<div className='flex items-center space-x-6 lg:space-x-8'>
				<div className='flex items-center space-x-1.5'>
					<p className='text-sm font-medium'>Rows per page</p>
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger className='h-9 w-[70px]'>
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side='top'>
							{[25, 50, 100, 200, 500].map((pageSize) => (
								<SelectItem
									key={pageSize}
									value={`${pageSize}`}
								>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className='flex items-center justify-center text-sm font-medium'>
					Page {table.getState().pagination.pageIndex} of {table.getPageCount()}
				</div>

				<div className='flex items-center space-x-1.5'>
					<Button
						variant='outline'
						size='icon'
						onClick={() => table.setPageIndex(1)}
						disabled={[0, 1].includes(table.getState().pagination.pageIndex)}
					>
						<span className='sr-only'>Go to first page</span>
						<ChevronsLeft />
					</Button>

					<Button
						variant='outline'
						size='icon'
						onClick={() => table.previousPage()}
						disabled={[0, 1].includes(table.getState().pagination.pageIndex)}
					>
						<span className='sr-only'>Go to previous page</span>
						<ChevronLeftIcon />
					</Button>

					<Button
						variant='outline'
						size='icon'
						onClick={() => table.nextPage()}
						disabled={table.getState().pagination.pageIndex === table.getPageCount()}
					>
						<span className='sr-only'>Go to next page</span>
						<ChevronRightIcon />
					</Button>

					<Button
						variant='outline'
						size='icon'
						onClick={() => table.setPageIndex(table.getPageCount())}
						disabled={table.getState().pagination.pageIndex === table.getPageCount()}
					>
						<span className='sr-only'>Go to last page</span>
						<ChevronsRight />
					</Button>
				</div>
			</div>
		</div>
	);
}
