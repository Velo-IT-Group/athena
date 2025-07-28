'use client';
import type { ColumnDef } from '@tanstack/react-table';
import type { Configuration, ReferenceType } from '@/types/manage';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { Link } from '@tanstack/react-router';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export const columns: ColumnDef<Configuration>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Name'
			/>
		),
		cell: ({ row }) => (
			<Link
				to='/companies/$id'
				params={{ id: String(row.original.company.id) }}
				className={cn(
					'font-medium',
					buttonVariants({
						variant: 'link',
						className: 'px-0 text-xs h-auto',
					})
				)}
			>
				{row.getValue('name')}
			</Link>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'status',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Status'
			/>
		),
		cell: ({ row }) => {
			const status = row.getValue('status') as ReferenceType;
			return <span className='text-xs h-auto'>{status?.name}</span>;
		},
		enableSorting: false,
		enableHiding: false,
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			if (!referenceRow) return false;

			return value.includes(String(referenceRow.id));
		},
	},
	{
		accessorKey: 'company',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Company'
			/>
		),
		cell: ({ row }) => {
			const reference = row.getValue('company') as ReferenceType;
			return <span className='text-xs h-auto'>{reference?.name}</span>;
		},
		enableSorting: false,
		enableHiding: false,
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			if (!referenceRow) return false;

			return value.includes(String(referenceRow.id));
		},
	},
	{
		accessorKey: 'type',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Type'
			/>
		),
		cell: ({ row }) => {
			const reference = row.getValue('type') as ReferenceType;
			return <span>{reference?.name}</span>;
		},
		enableSorting: false,
		enableHiding: false,
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			if (!referenceRow) return false;

			return value.includes(String(referenceRow.id));
		},
	},
	{
		accessorKey: 'site',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Site'
			/>
		),
		cell: ({ row }) => {
			const site = row.getValue('site') as ReferenceType;
			return <span>{site?.name}</span>;
		},
		enableSorting: false,
		enableHiding: false,
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			if (!referenceRow) return false;

			return value.includes(String(referenceRow.id));
		},
	},
	{
		accessorKey: 'contact',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Contact'
			/>
		),
		cell: ({ row }) => {
			const contact = row.getValue('contact') as ReferenceType;
			return (
				<>
					{contact !== undefined && (
						<div className='flex items-center space-x-1.5'>
							<User className='mr-1.5' />
							<span className='truncate font-medium'>
								{contact?.name}
							</span>
						</div>
					)}
				</>
			);
		},
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			if (!referenceRow) return false;

			return value.includes(String(referenceRow.id));
		},
	},
	{
		accessorKey: 'lastLoginName',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Last Login'
			/>
		),
		cell: ({ row }) => <span>{row.getValue('lastLoginName')}</span>,
	},
	{
		accessorKey: 'tagNumber',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Tag Number'
			/>
		),
		cell: ({ row }) => <span>{row.getValue('tagNumber')}</span>,
	},
	{
		accessorKey: 'serialNumber',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Serial Number'
			/>
		),
		cell: ({ row }) => <span>{row.getValue('serialNumber')}</span>,
	},
];
