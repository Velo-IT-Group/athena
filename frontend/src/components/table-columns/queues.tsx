import { ColumnDef } from '@tanstack/react-table';

import { Checkbox } from '@/components/ui/checkbox';
import type { CommunicationItem, Company, Contact, ReferenceType } from '@/types/manage';
import { DataTableColumnHeader } from @/components/data-table/column-header';
import { DataTableRowActions } from @/components/data-table/row-actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { buttonVariants } from @/components/button';
import parsePhoneNumber from 'libphonenumber-js';
import { FilterTarget } from '@/types/twilio';

export const columns: ColumnDef<FilterTarget>[] = [
	// {
	// 	id: 'select',
	// 	header: ({ table }) => (
	// 		<Checkbox
	// 			checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
	// 			onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
	// 			aria-label='Select all'
	// 			className='translate-y-[2px]'
	// 		/>
	// 	),
	// 	cell: ({ row }) => (
	// 		<Checkbox
	// 			checked={row.getIsSelected()}
	// 			onCheckedChange={(value) => row.toggleSelected(!!value)}
	// 			aria-label='Select row'
	// 			className='translate-y-[2px]'
	// 		/>
	// 	),
	// 	enableSorting: false,
	// 	enableHiding: false,
	// },
	{
		accessorKey: 'queue',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Task Queue'
			/>
		),
		cell: ({ row }) => <span>{row.getValue('queue')}</span>,
		enableSorting: false,
		enableHiding: false,
	},
	// {
	// 	id: 'actions',
	// 	cell: ({ row }) => <DataTableRowActions row={row} />,
	// },
];
