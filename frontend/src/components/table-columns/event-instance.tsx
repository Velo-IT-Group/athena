'use client';
import { CalendarDays, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, User, Voicemail } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Direction, type Event } from '@/types/twilio';
import { formatRelative } from 'date-fns';
import { DataTableColumnHeader } from '../ui/data-table/column-header';
import type { DateRange } from 'react-day-picker';
import { Button } from '../ui/button';
import { Link } from '@tanstack/react-router';
import { workers } from '@/utils/data';
import { filterFn } from '@/lib/filters';

export const columns: ColumnDef<Event>[] = [
	{
		id: 'direction',
		accessorKey: 'event_data',
		header: () => <div className='w-[50px]' />,
		cell: ({ row }) => {
			const { task_attributes } = row.original.event_data;
			const attributes = JSON.parse(task_attributes ?? '{}') as Record<string, unknown>;

			return (
				<span className={'flex items-center w-[50px]'}>
					{row.original.event_type === 'task.canceled' ? (
						<>
							{row.original.event_data.task_canceled_reason === 'redirected' && attributes?.ticketId ? (
								<Voicemail />
							) : (
								<PhoneMissed />
							)}
						</>
					) : (
						<>{attributes?.direction === Direction.Inbound ? <PhoneIncoming /> : <PhoneOutgoing />}</>
					)}
				</span>
			);
		},
		size: 50,
		// filterFn: (row, id, value: string[]) => {
		// 	const {
		// 		event_data: { task_attributes, task_canceled_reason },
		// 		event_type,
		// 	} = row.original;
		// 	const attributes = JSON.parse(task_attributes ?? '{}') as Record<string, unknown>;

		// 	console.log(attributes);

		// 	// Check if any of the selected filter values match the current row
		// 	return value.some((filterValue) => {
		// 		if (filterValue === 'missed') {
		// 			return event_type === 'task.canceled' && task_canceled_reason !== 'redirected';
		// 		}

		// 		if (filterValue === 'voicemail') {
		// 			return event_type === 'task.canceled' && task_canceled_reason === 'redirected';
		// 		}

		// 		// For inbound/outbound direction
		// 		return filterValue === attributes.direction;
		// 	});
		// },
		filterFn: filterFn('option'),
		meta: {
			displayName: 'Type',
			filterKey: '/',
			icon: Phone,
			type: 'option',
			options: [
				{
					label: 'Inbound',
					value: 'inbound',
					icon: PhoneIncoming,
				},
				{
					label: 'Outbound',
					value: 'outbound',
					icon: PhoneOutgoing,
				},
				{
					label: 'Missed',
					value: 'missed',
					icon: PhoneMissed,
				},
				{
					label: 'Voicemail',
					value: 'voicemail',
					icon: Voicemail,
				},
			],
		},
	},
	{
		id: 'phone_number',
		accessorKey: 'event_data',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Phone Number'
			/>
		),
		cell: ({ row }) => {
			const { task_attributes } = row.original.event_data;
			const attributes = JSON.parse(task_attributes ?? '{}') as Record<string, unknown>;

			const direction = attributes?.direction as Direction;
			const from = attributes?.from as string;
			const to = attributes?.outbound_to as string;

			return <>{direction === Direction.Inbound ? from : to}</>;
		},
	},
	{
		id: 'contact',
		accessorKey: 'event_data',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Contact'
			/>
		),
		cell: ({ row }) => {
			const { task_attributes } = row.original.event_data;
			const attributes = JSON.parse(task_attributes ?? '{}') as Record<string, any>;

			return (
				<>
					{attributes?.contactId || attributes?.userId ? (
						<Button
							asChild
							variant='link'
						>
							<Link to='/contacts'>{attributes?.name}</Link>
						</Button>
					) : (
						<Button variant='link'>----</Button>
					)}
				</>
			);
		},
	},
	{
		id: 'company',
		accessorKey: 'event_data',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Company'
			/>
		),
		cell: ({ row }) => {
			const { task_attributes } = row.original.event_data;
			const attributes = JSON.parse(task_attributes ?? '{}') as Record<string, any>;

			return (
				<>
					{attributes?.companyId &&
					!!!attributes?.contactId &&
					attributes?.companyId &&
					!!!attributes?.userId ? (
						<Button
							asChild
							variant='link'
						>
							<Link to='/companies'>{attributes?.name}</Link>
						</Button>
					) : (
						<Button variant='link'>----</Button>
					)}
				</>
			);
		},
		filterFn: (row, id, value) => {
			const { task_attributes } = row.original.event_data;
			const attributes = JSON.parse(task_attributes ?? '{}') as Record<string, unknown>;

			if (!!!attributes.companyId) return false;

			return (value as string[]).includes(String(attributes.companyId as number));
		},
	},
	{
		id: 'worker_name',
		accessorKey: 'event_data',
		accessorFn: (data) => data.event_data.worker_name,
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Worker'
			/>
		),
		cell: ({ row }) => {
			const { worker_attributes } = row.original.event_data;
			const attributes = JSON.parse(worker_attributes ?? '{}') as Record<string, unknown>;
			return (
				<span className='text-muted-foreground'>
					{(attributes?.full_name as string) ?? row.original.event_data.worker_name}
				</span>
			);
		},
		filterFn: (row, id, value) => {
			const { worker_sid } = row.original.event_data;
			// const attributes = JSON.parse(worker_attributes ?? '{}') as Record<string, unknown>;
			const { worker_name } = row.original.event_data;

			console.log(value);

			if (!!!worker_name) return false;

			return value.includes(worker_name);
		},
		meta: {
			displayName: 'Worker',
			filterKey: '/',
			icon: User,
			type: 'multiOption',
			options: workers
				.sort((a, b) => a.friendly_name.localeCompare(b.friendly_name))
				.map((w) => ({ label: JSON.parse(w.attributes ?? '{}').full_name, value: w.sid })),
		},
	},
	{
		id: 'task_age',
		accessorKey: 'event_date',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Talk Time'
			/>
		),
		cell: ({ row }) => {
			const { task_age } = row.original.event_data;
			const talkTime = task_age ? Number(task_age) : 0;
			const hours = Math.floor(talkTime / 3600);
			const minutes = Math.floor((talkTime % 3600) / 60);

			return (
				<span className='text-muted-foreground'>
					{hours}h {minutes}m
				</span>
			);
		},
	},
	{
		accessorKey: 'event_date',
		id: 'event_date',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Date'
			/>
		),
		cell: ({ row }) => {
			return (
				<span className='text-muted-foreground capitalize'>
					{row.getValue('event_date')
						? formatRelative(new Date(row.getValue('event_date')), new Date())
						: null}
				</span>
			);
		},
		filterFn: (row, id, value: DateRange) => {
			const eventDate = new Date(row.original.event_date);

			return (
				(value.from ? eventDate.getTime() >= value.from.getTime() : true) &&
				(value.to ? eventDate.getTime() <= value.to.getTime() : true)
			);
		},
		meta: {
			displayName: 'Date',
			filterKey: 'date',
			icon: CalendarDays,
			type: 'date',
		},
	},
	// {
	// 	accessorKey: 'event_date',
	// 	id: 'end_date',
	// 	header: ({ column }) => (
	// 		<DataTableColumnHeader
	// 			column={column}
	// 			title='End Date'
	// 		/>
	// 	),
	// 	cell: ({ row }) => {
	// 		return (
	// 			<span className='text-muted-foreground capitalize'>
	// 				{row.getValue('event_date')
	// 					? formatRelative(new Date(row.getValue('event_date')), new Date())
	// 					: null}
	// 			</span>
	// 		);
	// 	},
	// 	filterFn: (row, id, value: DateRange) => {
	// 		const eventDate = new Date(row.original.event_date);

	// 		console.log(eventDate, value);

	// 		return (
	// 			(value.from ? eventDate.getTime() >= value.from.getTime() : true) &&
	// 			(value.to ? eventDate.getTime() <= value.to.getTime() : true)
	// 		);
	// 	},
	// 	enableHiding: true,
	// 	meta: {
	// 		displayName: 'End Date',
	// 		filterKey: 'endDate',
	// 		icon: CalendarDays,
	// 		type: 'date',
	// 	},
	// },
];
