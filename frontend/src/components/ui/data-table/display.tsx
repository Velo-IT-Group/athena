import { ListSelector } from '@/components/list-selector';
import { ColoredBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProposals } from '@/hooks/use-proposals';
import { cn } from '@/lib/utils';
import { proposalStatuses } from '@/routes/_authed/proposals/$id/$version/settings';
import { flexRender, type ColumnDef, type Table as TableType } from '@tanstack/react-table';
import { CircleDashed, Loader2, Trash2 } from 'lucide-react';

interface Props<TData, TValue> {
	table: TableType<TData>;
	columns: ColumnDef<TData, TValue>[];
}

const DataTableDisplay = <TData extends { id: string }, TValue>({ table, columns }: Props<TData, TValue>) => {
	const { handleBulkProposalDeletion, handleProposalUpdate } = useProposals({ initialData: [] });

	return (
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

			<div
				className={cn(
					'absolute top-3 right-1/2 -translate-x-1/2 bg-background rounded-full min-w-fit flex items-center gap-1.5 border shadow-xs dark:bg-input/30 dark:border-input',
					table.getSelectedRowModel().rows.length > 0 ? 'visible' : 'invisible'
				)}
			>
				<Button
					variant='ghost'
					size='sm'
				>
					<span className='text-xs'>{table.getSelectedRowModel().rows.length} Selected</span>
				</Button>

				<Separator
					orientation='vertical'
					className='!h-3'
				/>

				<Button
					variant='ghost'
					size='sm'
					onClick={() => {
						handleBulkProposalDeletion.mutate({
							id: table.getSelectedRowModel().rows.map((row) => row.original.id),
						});
						table.resetRowSelection();
					}}
				>
					{handleBulkProposalDeletion.isPending ? (
						<Loader2 className='text-xs animate-spin' />
					) : (
						<Trash2 className='text-xs' />
					)}
				</Button>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant='ghost'
							size='sm'
						>
							{handleBulkProposalDeletion.isPending ? (
								<Loader2 className='text-xs animate-spin' />
							) : (
								<CircleDashed className='text-xs' />
							)}
						</Button>
					</PopoverTrigger>

					<PopoverContent
						className='p-0 w-fit'
						align='start'
					>
						<ListSelector
							onSelect={(status) =>
								handleProposalUpdate.mutate({
									proposal: table.getSelectedRowModel().rows.map((row) => ({
										id: row.original.id,
										status: status.value as StatusEnum,
									})),
								})
							}
							value={(status) => status.label}
							items={proposalStatuses}
							itemView={(status) => (
								<ColoredBadge
									variant={status.color}
									className='capitalize'
								>
									<status.icon className='size-3 mr-1.5' />
									{status.label}
								</ColoredBadge>
							)}
						/>

						<Separator />
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
};

export default DataTableDisplay;
