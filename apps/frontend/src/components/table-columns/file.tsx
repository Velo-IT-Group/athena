import { ColumnDef } from '@tanstack/react-table';

import { FileObject } from '@supabase/storage-js';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { File, Image } from 'lucide-react';

export const columns: ColumnDef<FileObject>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
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
		accessorKey: 'metadata',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Task Queue'
			/>
		),
		cell: ({ row }) => {
			const metadata = row.getValue('metadata') as Record<string, any>;
			if (metadata.mimetype.includes('image/')) {
				return <Image />;
			}

			return <File />;
		},
		enableSorting: false,
		enableHiding: false,
	},
	// {
	// 	id: 'actions',
	// 	cell: ({ row }) => <DataTableRowActions row={row} />,
	// },
];
