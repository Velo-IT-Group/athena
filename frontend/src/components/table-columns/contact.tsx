'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { CommunicationItem, Contact, ReferenceType } from '@/types/manage';
import { DataTableColumnHeader } from '../ui/data-table/column-header';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '../ui/button';
import { Link } from '@tanstack/react-router';
import { ALargeSmall, Building } from 'lucide-react';

export const columns: ColumnDef<Contact>[] = [
	{
		id: 'firstName',
		accessorKey: 'firstName',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='First Name'
			/>
		),
		cell: ({ row }) => (
			<Button
				asChild
				variant='link'
				className='px-0'
			>
				<Link
					to='/contacts/$id'
					params={{ id: row.original.id.toString() }}
					className='font-medium'
				>
					{row.getValue('firstName')}
				</Link>
			</Button>
		),
		enableSorting: false,
		enableHiding: false,
		filterFn: (row, id, value) => {
			return true;
			// const referenceRow = row.getValue(id) as ReferenceType;

			// return referenceRow && referenceRow.id ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'firstName',
			displayName: 'First Name',
			icon: ALargeSmall,
			type: 'text',
		},
	},
	{
		id: 'lastName',
		accessorKey: 'lastName',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Last Name'
			/>
		),
		cell: ({ row }) => {
			// const label = labels.find((label) => label.value === row.original.label);

			return (
				<Button
					asChild
					variant='link'
					className='px-0'
				>
					<Link
						to='/contacts/$id'
						params={{ id: row.original.id.toString() }}
						className='font-medium'
					>
						{row.getValue('lastName')}
					</Link>
				</Button>
			);
		},
		filterFn: (row, id, value) => {
			return true;
			// const referenceRow = row.getValue(id) as ReferenceType;

			// return referenceRow && referenceRow.id ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'lastName',
			displayName: 'Last Name',
			icon: ALargeSmall,
			type: 'text',
		},
	},
	// {
	//   accessorKey: "defaultPhoneNbr",
	//   header: ({ column }) => (
	//     <DataTableColumnHeader column={column} title="Phone Number" />
	//   ),
	//   cell: ({ row }) => {
	//     const number = parsePhoneNumber(
	//       row?.getValue("defaultPhoneNbr") ?? "",
	//       "US",
	//     );

	//     return (
	//       <span className={cn(buttonVariants({ variant: "link" }), "px-0")}>
	//         {number?.format("NATIONAL") ?? ""}
	//       </span>
	//     );
	//   },
	// },
	{
		accessorKey: 'communicationItems',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Email'
			/>
		),
		cell: ({ row }) => {
			const communicationItems = row.getValue('communicationItems') as CommunicationItem[];
			const defaultEmail = communicationItems?.find((item) => item.defaultFlag && item.type.name === 'Email');

			return <span className={cn(buttonVariants({ variant: 'link' }), 'px-0')}>{defaultEmail?.value}</span>;
		},
	},
	{
		id: 'company',
		accessorKey: 'company',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Company'
			/>
		),
		cell: ({ row }) => {
			const company = row.getValue('company') as ReferenceType;

			return <span>{company?.name}</span>;
		},
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			return referenceRow ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'company/name',
			displayName: 'Company',
			icon: Building,
			type: 'text',
		},
	},
];
