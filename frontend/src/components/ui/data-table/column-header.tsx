import { ArrowDown, ArrowUp, EyeOff } from 'lucide-react';
import type { Column } from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	title: string;
	setSort?: (orderBy?: { key: keyof TData; order?: 'asc' | 'desc' }) => void;
}

export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
	setSort,
}: DataTableColumnHeaderProps<TData, TValue>) {
	// const pathname = usePathname()
	// const searchParams = useSearchParams()
	// const { push } = useRouter()

	if (!column.getCanSort() || !column.columnDef.meta?.sortKey) {
		return <div className={cn(className)}>{title}</div>;
	}

	return (
		<div className={cn('flex items-center space-x-1.5 text-nowrap', className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghost'
						size='sm'
						className='-ml-3 h-9 data-[state=open]:bg-accent'
					>
						<span className='text-nowrap'>{title}</span>
						{/* {searchParams.get('sortOrder') === 'desc' &&
						searchParams.get('sort') === column.columnDef.meta.sortKey ? (
							<ArrowDown className='ml-2 h-3.5 w-3.5' />
						) : searchParams.get('sort') === column.columnDef.meta.sortKey ? (
							<ArrowUp className='ml-2 h-3.5 w-3.5' />
						) : (
							<ChevronsUpDown className='ml-2 h-3.5 w-3.5' />
						)} */}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align='start'>
					<DropdownMenuItem
						onClick={() => {
							setSort?.({
								key: (column.columnDef.meta?.filterKey as keyof TData) ?? column.id,
							});
							// const params = new URLSearchParams(searchParams);
							// params.set('sort', column.columnDef.meta?.sortKey!);
							// params.delete('sortOrder');
							// push(pathname + '?' + params.toString());
						}}
					>
						<ArrowUp className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
						Asc
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							setSort?.({
								key: (column.columnDef.meta?.filterKey as keyof TData) ?? column.id,
								order: 'desc',
							});
							// const params = new URLSearchParams(searchParams);
							// params.set('sort', column.columnDef.meta?.sortKey!);
							// params.set('sortOrder', 'desc');
							// push(pathname + '?' + params.toString());
						}}
					>
						<ArrowDown className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
						Desc
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
						<EyeOff className='mr-2 h-3.5 w-3.5 text-muted-foreground/70' />
						Hide
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
