import { formatRelative } from 'date-fns';

import type { ColumnDef } from '@tanstack/react-table';
import { Link } from '@tanstack/react-router';

import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { Button } from '@/components/ui/button';
import { Calendar, Phone, PhoneMissed } from 'lucide-react';
import { PhoneOutgoing, Voicemail } from 'lucide-react';
import { PhoneIncoming } from 'lucide-react';
import { filterFn } from '@/lib/filters';
import AudioPlayerToggle from '@/components/audio-player-toggle';

export const columns: ColumnDef<NestedEngagement>[] = [
	{
		id: 'direction',
		header: () => <div className='w-[50px]' />,
		cell: ({ row }) => (
			<span className={'flex items-center w-[50px]'}>
				{row.original.is_canceled ? (
					<>{row.original.is_canceled ? <Voicemail /> : <PhoneMissed />}</>
				) : (
					<>{row.original.is_inbound ? <PhoneIncoming /> : <PhoneOutgoing />}</>
				)}
			</span>
		),
		size: 50,
		enableSorting: false,
		enableHiding: false,
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
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Phone Number'
			/>
		),
		cell: ({ row }) => (
			<span className='capitalize'>
				{(row.original.attributes as Record<string, any>)?.from ??
					(row.original.attributes as Record<string, any>)?.phone_number}
			</span>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		id: 'channel',
		accessorKey: 'channel',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Channel'
			/>
		),
		cell: ({ table, row }) => <span className='capitalize'>{row.getValue('channel')}</span>,
		enableSorting: false,
		enableHiding: false,
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
			const contact = row.getValue('contact') as Record<string, any | undefined>;
			console.log(contact);

			return (
				<>
					{contact ? (
						<Button
							asChild
							variant='link'
						>
							<Link
								to='/contacts/$id'
								params={{ id: contact?.id }}
							>
								{contact?.id}
							</Link>
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
		accessorKey: 'company',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Company'
			/>
		),
		cell: ({ row }) => {
			const company = row.getValue('company') as Record<string, any | undefined>;

			return (
				<>
					{company ? (
						<Button
							asChild
							variant='link'
						>
							<Link
								to='/companies/$id'
								params={{ id: company?.id }}
							>
								{company?.id}
							</Link>
						</Button>
					) : (
						<Button variant='link'>----</Button>
					)}
				</>
			);
		},
	},
	{
		id: 'reservations',
		accessorKey: 'reservations',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Reservations'
			/>
		),
		cell: ({ row }) => {
			const reservations = row.getValue('reservations') as EngagementReservation[];
			// const company = row.getValue('company') as Record<string, any | undefined>;
			const completedReservation = reservations.find(
				(reservation) => reservation.reservation_status === 'completed'
			);

			console.log(completedReservation);

			return (
				<Button
					variant='link'
					className='capitalize'
				>
					{completedReservation?.reservation_status ?? '----'}
				</Button>
			);
		},
	},
	{
		id: 'created_at',
		accessorKey: 'created_at',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Date'
			/>
		),
		cell: ({ row }) => {
			return (
				<span className='text-muted-foreground capitalize'>
					{row.getValue('created_at')
						? formatRelative(new Date(row.getValue('created_at')), new Date())
						: null}
				</span>
			);
		},
		filterFn: filterFn('date'),
		meta: {
			displayName: 'Date',
			filterKey: 'created_at',
			icon: Calendar,
			type: 'date',
		},
	},
	{
		id: 'actions',
		// header: '',
		cell: ({ row }) => {
			const recording = row.original.recording_url;

			return (
				<>
					{recording && (
						<AudioPlayerToggle
							audioUrl={recording}
							downloadUrl={recording}
						/>
					)}
				</>
			);
		},
	},
];
