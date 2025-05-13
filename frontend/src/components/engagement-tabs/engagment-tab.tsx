import TimeEntryForm from '@/components/forms/time-entry-form';
import Tiptap from '@/components/tip-tap';
import { AsyncSelect } from '@/components/ui/async-select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { getTicketsQuery } from '@/lib/manage/api';
import { searchServiceTickets } from '@/lib/manage/read';
import type { ServiceTicket } from '@/types/manage';
import { useSuspenseQuery } from '@tanstack/react-query';
import { AlarmClockPlus, Plus } from 'lucide-react';
type Props = {
	ticketIds: number[];
	handleTicketChange: (ticketIds: number[]) => void;
};

const EngagementTab = ({ ticketIds, handleTicketChange }: Props) => {
	const {
		data: { data: tickets },
	} = useSuspenseQuery(getTicketsQuery({ conditions: { id: ticketIds } }));

	return (
		<div className='space-y-3'>
			<div className='flex items-center justify-between'>
				<h2 className='text-2xl font-semibold'>Engagement</h2>

				<AsyncSelect<ServiceTicket>
					fetcher={searchServiceTickets}
					renderOption={(item) => (
						<div className='flex items-center gap-2'>
							<div className='flex flex-col'>
								<div className='font-medium'>{item.summary}</div>
							</div>
						</div>
					)}
					getOptionValue={(item) => item.id.toString()}
					getDisplayValue={(item) => (
						<div className='flex items-center gap-2'>
							<div className='flex flex-col'>
								<div className='font-medium'>{item.summary}</div>
								<div className='text-xs text-muted-foreground'>{item.id}</div>
							</div>
						</div>
					)}
					notFound={<div className='py-6 text-center text-sm'>No tickets found</div>}
					label='Tickets'
					placeholder='Search tickets...'
					value={''}
					onChange={async (value) => {
						if (!value) {
							return;
						}
						handleTicketChange(
							ticketIds.includes(value.id)
								? ticketIds.filter((t) => (value.id = t))
								: [...ticketIds, value.id]
						);
					}}
					className='w-[500px]'
				>
					<Button variant='outline'>
						<Plus />
					</Button>
				</AsyncSelect>
			</div>

			{tickets.map((ticket) => (
				<Card key={ticket.id}>
					<CardHeader className='flex flex-row items-center justify-between'>
						<CardTitle>{ticket.summary}</CardTitle>

						<Dialog>
							<DialogTrigger asChild>
								<Button variant='ghost'>
									<AlarmClockPlus />
								</Button>
							</DialogTrigger>

							<DialogContent>
								<DialogHeader>
									<DialogTitle>Add Time Entry</DialogTitle>
									<DialogDescription>Add a time entry to the ticket.</DialogDescription>
								</DialogHeader>

								<TimeEntryForm ticket={ticket} />

								<DialogFooter>
									<Button type='submit'>Save</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</CardHeader>

					<CardContent className='p-0'>
						<h3 className='text-lg font-medium mx-3 mt-3'>Add Note</h3>

						<Tiptap
							className='min-h-48 p-3'
							autofocus
						/>
					</CardContent>
				</Card>
			))}
		</div>
	);
};

export default EngagementTab;
