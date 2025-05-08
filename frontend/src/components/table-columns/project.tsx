import { ColumnDef } from '@tanstack/react-table';
import type { Project, ReferenceType } from '@/types/manage';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import Link from 'next/link';
import { Progress } from '../ui/progress';

export const columns: ColumnDef<Project>[] = [
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
				href={`https://manage.velomethod.com/v4_6_release/services/system_io/router/openrecord.rails?recordType=ProjectHeaderFV&recid=${row.original.id}&companyName=velo`}
				className='font-medium w-[80px]'
			>
				{row.getValue('name')}
			</Link>
		),
		enableSorting: false,
		enableHiding: false,
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
			const company = row.getValue('company') as ReferenceType;

			return <span>{company?.name}</span>;
		},
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			return referenceRow ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'company/id',
		},
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
			const reference = row.getValue('status') as ReferenceType;

			return <span>{reference?.name}</span>;
		},
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			return referenceRow ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'status/id',
		},
	},
	{
		accessorKey: 'scheduledStart',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Start Date'
			/>
		),
		cell: ({ row }) => {
			return (
				<span>
					{Intl.DateTimeFormat('en-US', {
						dateStyle: 'medium',
					}).format(new Date(row.getValue('scheduledStart')))}
				</span>
			);
		},
	},
	{
		accessorKey: 'scheduledStart',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Start Date'
			/>
		),
		cell: ({ row }) => {
			return (
				<span>
					{Intl.DateTimeFormat('en-US', {
						dateStyle: 'medium',
					}).format(new Date(row.getValue('scheduledStart')))}
				</span>
			);
		},
	},
	{
		accessorKey: 'percentComplete',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Status'
			/>
		),
		cell: ({ row }) => {
			return <Progress value={row.getValue('percentComplete')} />;
		},
	},
];
