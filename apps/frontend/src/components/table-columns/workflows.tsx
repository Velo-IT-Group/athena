import { ColumnDef } from '@tanstack/react-table';

import { FileObject } from '@supabase/storage-js';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { File, Image } from 'lucide-react';
import { Workflow } from '@/types/manage';
import { Link } from '@tanstack/react-router';

export const columns: ColumnDef<Workflow>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(value) =>
					table.toggleAllPageRowsSelected(!!value)
				}
				aria-label='Select all'
				className='translate-y-[2px]'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
				className='translate-y-[2px]'
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Workflow'
			/>
		),
		cell: ({ row }) => (
			<Link
				to={`/workflows/$id`}
				params={{ id: row.original.id.toString() }}
			>
				{row.getValue('name')}
			</Link>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: 'createdBy',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Created By'
			/>
		),
		cell: ({ row }) => <span>{row.original._info?.enteredBy}</span>,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'batchLastRan',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Last run'
			/>
		),
		cell: ({ row }) => <span>{row.getValue('batchLastRan')}</span>,
		enableSorting: false,
		enableHiding: false,
	},
	// {
	// 	id: 'actions',
	// 	cell: ({ row }) => <DataTableRowActions row={row} />,
	// },
];
