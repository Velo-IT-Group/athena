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
import { getTickets, searchServiceTickets } from '@/lib/manage/read';
import type { ServiceTicket } from '@/types/manage';
import { useSuspenseQuery } from '@tanstack/react-query';
import { CommandItem } from 'cmdk';
import { AlarmClockPlus, Plus, Trash2 } from 'lucide-react';
interface Props {
	ticketIds: number[];
	companyId?: number;
	handleTicketChange: (ticketIds: number[]) => void;
}

const EngagementTab = ({ ticketIds, companyId, handleTicketChange }: Props) => {
	const {
		data: { data: tickets },
	} = useSuspenseQuery(getTicketsQuery({ conditions: { id: ticketIds } }));

	return (
		<div className='space-y-3'>
			<div className='flex items-center justify-between'>
				<h2 className='text-2xl font-semibold'>Engagement</h2>

				<AsyncSelect
					fetcher={async (value, page) => {
						console.log({
							summary: {
								value: `'${value}'`,
								comparison: 'contains',
							},
							closedFlag: false,
							parentTicketId: null,
							'board/id': [22, 26, 30, 31],
							...(companyId ? { 'company/id': companyId } : {}),
						});
						const ticketData = await getTickets({
							data: {
								conditions: {
									summary: {
										value: `'${value}'`,
										comparison: 'contains',
									},
									closedFlag: false,
									parentTicketId: null,
									'board/id': [22, 26, 30, 31],
									...(companyId ? { 'company/id': companyId } : {}),
								},
								page,
								orderBy: {
									key: 'summary',
								},
							},
						});

						return ticketData.data;
					}}
					renderOption={(item) => (
						<CommandItem
							value={item.id.toString()}
							onSelect={() => handleTicketChange([...ticketIds, item.id])}
						>
							<div className='flex flex-col gap-1.5'>
								<div className='flex flex-col'>
									<div className='font-medium'>{item.summary}</div>
									<div className='text-xs text-muted-foreground'>
										{item.id}
										{/* {item.recordType === 'ServiceTicket' && (
																<Badge
																	variant='secondary'
																	className='ml-1.5'
																>
																	Service Ticket
																</Badge>
															)} */}
									</div>
								</div>

								<div className='text-xs text-muted-foreground'>
									{item.company?.name} • {item.contact?.name}
								</div>
							</div>
						</CommandItem>
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
					}}
					className='min-w-[500px]'
				>
					<Button variant='outline'>
						<Plus />
					</Button>
				</AsyncSelect>
			</div>

			{tickets.map((ticket) => (
				<Card key={ticket.id}>
					<CardHeader className='flex flex-row items-center space-y-0'>
						<CardTitle>{ticket.summary}</CardTitle>

						<Dialog>
							<DialogTrigger asChild>
								<Button
									variant='ghost'
									className='ml-auto'
								>
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

						<Button
							variant='ghost'
							className='text-destructive focus:text-destructive focus:bg-destructive/5 hover:text-destructive hover:bg-destructive/5'
							onClick={() => handleTicketChange(ticketIds.filter((id) => id !== ticket.id))}
						>
							<Trash2 />
						</Button>
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
