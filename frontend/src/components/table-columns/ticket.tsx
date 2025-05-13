import {
	ALargeSmall,
	Building,
	ChartNoAxesColumnIncreasing,
	Circle,
	Clock,
	Flame,
	Hash,
	Heading1Icon,
	SquareKanban,
	User,
} from 'lucide-react';

import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import type { ReferenceType, ServiceTicket } from '@/types/manage';
import { cn } from '@/lib/utils';
import { filterFn } from '@/lib/filters';
import { Link } from '@tanstack/react-router';

import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { Button, buttonVariants } from '@/components/ui/button';
import { getContactsQuery } from '@/lib/manage/api';

const columnHelper = createColumnHelper<ServiceTicket>();

export const columns: ColumnDef<ServiceTicket>[] = [
	{
		id: 'id',
		accessorKey: 'id',
		header: ({ column, table }) => (
			<DataTableColumnHeader
				column={column}
				title='Ticket'
			/>
		),
		cell: ({ row }) => {
			const id = row.getValue('id') as string;

			return (
				<Button
					variant='link'
					className='w-[80px] justify-start px-0 text-sm'
					asChild
				>
					<Link
						to='/tickets/$id'
						params={{ id }}
					>
						#{id}
					</Link>
				</Button>
			);
		},
		// enableColumnFilter: false,
		filterFn: (row, id, value) => {
			return true;
			// const referenceRow = row.getValue(id) as ReferenceType;

			// return referenceRow && referenceRow.id ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'id',
			displayName: 'Ticket #',
			icon: Hash,
			type: 'number',
		},
	},
	{
		id: 'summary',
		accessorKey: 'summary',
		header: ({ column, table }) => {
			return (
				<DataTableColumnHeader
					column={column}
					title='Summary'
					setSort={table.setSort}
				/>
			);
		},
		cell: ({ row }) => {
			// const label = labels.find((label) => label.value === row.original.label);

			return (
				<div className='flex items-center space-x-1.5'>
					<Circle
						className={cn(
							'stroke-none',
							row?.original?.priority?.id === 6 && 'fill-[#DC3221]',
							row?.original?.priority?.id === 7 && 'fill-[#029E73]',
							row?.original?.priority?.id === 8 && 'fill-[#56B4E9]'
						)}
					/>
					<span className='max-w-[40ch] truncate font-medium'>{row.getValue('summary')}</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			return true;
			// const referenceRow = row.getValue(id) as ReferenceType;

			// return referenceRow && referenceRow.id ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			displayName: 'Summary',
			icon: ALargeSmall,
			type: 'text',
			filterKey: 'summary',
			sortKey: 'summary',
		},
	},
	{
		id: 'status',
		accessorKey: 'status',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Status'
			/>
		),
		cell: ({ row }) => {
			const status = row.getValue('status') as ReferenceType;

			return (
				<div className='flex items-center'>
					<span>{status?.name}</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			return referenceRow && referenceRow.id ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'status/name',
			sortKey: 'status/name',
			displayName: 'Status',
			type: 'text',
			icon: Circle,
		},
	},
	{
		id: 'slaStatus',
		accessorKey: 'slaStatus',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='SLA Status'
			/>
		),
		cell: ({ row }) => {
			const sla = row.getValue('slaStatus') as string;

			return <span>{sla}</span>;
		},
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			return referenceRow && referenceRow.id ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'slaStatus/name',
			sortKey: 'slaStatus',
			displayName: 'SLA Status',
			icon: Flame,
			type: 'text',
		},
	},
	{
		id: 'contact',
		accessorKey: 'contact',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Contact'
			/>
		),
		cell: ({ row }) => {
			// const { addView } = useLocalStorage();
			const reference = row.getValue('contact') as ReferenceType;

			return (
				<>
					{reference?.id ? (
						<Link
							to='/contacts/$id'
							params={{ id: reference.id.toString() }}
							className={cn(
								buttonVariants({ variant: 'link' }),
								'flex items-center px-0 hover:bg-transparent'
							)}
						>
							<span>{reference?.name}</span>
						</Link>
					) : (
						<span>{reference?.name}</span>
					)}
				</>
			);
		},
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			return referenceRow && referenceRow.id ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'contact/name',
			sortKey: 'contact/name',
			displayName: 'Contact',
			icon: User,
			type: 'multiOption',
		},
	},
	{
		id: 'board',
		accessorKey: 'board',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Board'
			/>
		),
		cell: ({ row }) => {
			const board = row.getValue('board') as ReferenceType;

			return <span>{board?.name}</span>;
		},
		filterFn: filterFn('multiOption'),
		meta: {
			filterKey: 'board/name',
			sortKey: 'board/name',
			displayName: 'Board',
			icon: SquareKanban,
			type: 'text',
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
			// const { addView } = useLocalStorage();
			const reference = row.getValue('company') as ReferenceType;

			return (
				<Button
					variant='link'
					onClick={(e) => {
						if (e.altKey) {
							window.open(
								`https://manage.velomethod.com/v4_6_release/services/system_io/router/openrecord.rails?locale=en_US&recordType=CompanyFV&recid=${reference.id}&companyName=${reference?.identity}`,
								'_blank'
							);
						} else {
							// addView({
							// 	name: reference?.name || 'Unknown',
							// 	companyId: row.original.company!.id,
							// });
							const searchParams = new URLSearchParams();
							searchParams.set('companyId', String(row.original.company!.id));
							// redirect(`/?${searchParams.toString()}`);
						}
					}}
					className='flex items-center px-0 hover:bg-transparent'
				>
					{/* {status.icon && <status.icon className='mr-2 h-3.5 w-3.5 text-muted-foreground' />} */}
					<span>{reference?.name}</span>
				</Button>
			);
		},
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			console.log(value);

			return true;
			// return referenceRow && referenceRow.id ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'company/name',
			sortKey: 'company/name',
			displayName: 'Company',
			icon: Building,
			type: 'text',
		},
	},
	{
		id: 'priority',
		accessorKey: 'priority',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Priority'
			/>
		),
		cell: ({ row }) => {
			const priority = row.getValue('priority') as ReferenceType;

			// if (!priority) {
			// 	return null;
			// }

			return (
				<div className='flex items-center'>
					{/* {priority.icon && <priority.icon className='mr-2 h-3.5 w-3.5 text-muted-foreground' />} */}
					<span>{priority?.name}</span>
				</div>
			);
		},
		enableHiding: true,
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			return referenceRow && referenceRow.id ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'priority/name',
			sortKey: 'priority/name',
			displayName: 'Priority',
			icon: ChartNoAxesColumnIncreasing,
			type: 'text',
		},
	},
	{
		id: 'owner',
		accessorKey: 'owner',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Owner'
			/>
		),
		cell: ({ row }) => {
			const owner = row.getValue('owner') as ReferenceType;

			// if (!priority) {
			// 	return null;
			// }

			return (
				<div className='flex items-center'>
					{/* {priority.icon && <priority.icon className='mr-2 h-3.5 w-3.5 text-muted-foreground' />} */}
					<span>{owner?.name}</span>
				</div>
			);
		},
		filterFn: (row, id, value) => {
			const referenceRow = row.getValue(id) as ReferenceType;

			if (!referenceRow) return false;

			return referenceRow && referenceRow.id ? value.includes(String(referenceRow.id)) : false;
		},
		meta: {
			filterKey: 'owner/name',
			sortKey: 'owner/name',
			displayName: 'Owner',
			icon: User,
			type: 'text',
		},
	},
	{
		id: '_info',
		accessorKey: '_info',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Age'
			/>
		),
		cell: ({ row }) => {
			const _info = row.getValue('_info') as Record<string, any>;
			const enteredDate = new Date(_info?.dateEntered);
			const seconds = enteredDate.getTime() / 1000;

			return (
				<div className='flex items-center'>
					{/* {priority.icon && <priority.icon className='mr-2 h-3.5 w-3.5 text-muted-foreground' />} */}
					{/* <Timer
						stopwatchSettings={{
							autoStart: true,
							offsetTimestamp: getDateOffset(enteredDate),
						}}
						className='font-normal'
						hideDays={seconds < 86400}
						hideSeconds={true}
					/> */}
				</div>
			);
		},

		meta: {
			filterKey: 'dateEntered',
			sortKey: 'dateEntered',
			displayName: 'Age',
			icon: Clock,
			type: 'date',
		},
	},
	// {
	// 	id: 'actions',
	// 	cell: ({ row }) => <DataTableRowActions row={row} />,
	// },
];
