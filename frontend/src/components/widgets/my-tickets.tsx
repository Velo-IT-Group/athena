import { CurrentUserAvatar } from '@/components/current-user-avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import WidgetOptions from '@/components/widgets/widget-options';
import useWidget from '@/hooks/use-widget';
import { getTicketsQuery } from '@/lib/manage/api';
import { cn } from '@/lib/utils';
import type { ServiceTicket } from '@/types/manage';
import { useQueries, useSuspenseQueries } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { CalendarDays, CheckCircle2, Plus } from 'lucide-react';
import { useState } from 'react';

const tabs = ['Upcoming', 'Overdue', 'Completed'] as const;
const MyTickets = () => {
	const [selectedTab, setSelectedTab] = useState<(typeof tabs)[number]>('Upcoming');
	const { halfSize, toggleHalfSize } = useWidget({ widgetName: 'my-tickets' });
	const navigate = useNavigate();

	const today = new Date();

	const [
		{ data: upcomingTicketData },
		// { data: overdueTicketData },
		{ data: completedTicketData },
	] = useSuspenseQueries({
		queries: [
			getTicketsQuery({
				conditions: {
					'owner/id': 310,
					closedFlag: false,
				},
			}),
			// getTicketsQuery({
			// 	conditions: {
			// 		'owner/id': 310,
			// 		closedFlag: false,
			// 		requiredDate: today,
			// 	},
			// }),
			getTicketsQuery({
				conditions: {
					'contact/id': 32569,
					closedFlag: true,
				},
			}),
		],
	});

	const upcomingTickets: ServiceTicket[] = upcomingTicketData?.data ?? [];
	const overdueTickets: ServiceTicket[] = upcomingTicketData?.data ?? [];
	const completedTickets: ServiceTicket[] = completedTicketData?.data ?? [];

	return (
		<Card
			className='hover:border-black/25 transition flex flex-col'
			style={{ gridColumn: halfSize ? 'span 1' : 'span 2' }}
		>
			<CardHeader className='flex flex-row items-start gap-3'>
				<CurrentUserAvatar size='lg' />

				<div>
					<CardTitle className='text-xl'>My Tickets</CardTitle>

					<CardDescription className='flex items-center gap-3'>
						{tabs.map((tab) => (
							<Button
								key={tab}
								variant='ghost'
								className={cn(
									'px-0 text-muted-foreground hover:bg-transparent',
									tab === selectedTab && 'text-foreground rounded-none border-b-2'
								)}
								onClick={() => setSelectedTab(tab)}
							>
								{tab}
							</Button>
						))}
					</CardDescription>
				</div>

				<WidgetOptions
					halfSize={halfSize}
					toggleHalfSize={toggleHalfSize}
				/>
			</CardHeader>

			<ScrollArea className='min-h-96 h-full'>
				<CardContent className='p-0 min-h-96 h-full'>
					<>
						{selectedTab === 'Upcoming' && (
							<>
								<Button variant='ghost'>
									<Plus />
									<span>Create ticket</span>
								</Button>

								<Separator />

								{upcomingTickets.map((ticket) => (
									// <Link
									// 	key={ticket.id}
									// 	to='/tickets/$id'
									// 	params={{ id: ticket.id.toString() }}
									// 	className={buttonVariants({
									// 		variant: 'ghost',
									// 		className:
									// 			'border-b rounded-none px-0 w-full flex items-center gap-1.5 justify-start',
									// 	})}
									// >
									<Button
										key={ticket.id}
										variant='ghost'
										className='border-b rounded-none px-0 w-full flex items-center gap-1.5 justify-start'
									>
										<CheckCircle2 />

										<span className='truncate'>{ticket.summary}</span>

										<div className='border border-dashed rounded-full size-6 grid place-items-center border-black ml-auto'>
											<CalendarDays className='size-3.5 text-muted-foreground' />
										</div>
									</Button>
									// </Link>
								))}
							</>
						)}
					</>

					<>
						{selectedTab === 'Overdue' && (
							<>
								{overdueTickets.map((ticket) => (
									<Link
										key={ticket.id}
										to='/tickets/$id'
										params={{ id: ticket.id.toString() }}
										className={buttonVariants({
											variant: 'ghost',
											className:
												'border-b rounded-none px-0 w-full flex items-center gap-1.5 justify-start',
										})}
									>
										<CheckCircle2 />

										<span className='truncate'>{ticket.summary}</span>

										<div className='border border-dashed rounded-full size-6 grid place-items-center border-black ml-auto'>
											<CalendarDays className='size-3.5 text-muted-foreground' />
										</div>
									</Link>
								))}
							</>
						)}
					</>

					<>
						{selectedTab === 'Completed' && (
							<>
								{completedTickets.map((ticket) => (
									<Link
										key={ticket.id}
										to='/tickets/$id'
										params={{ id: ticket.id.toString() }}
										className={buttonVariants({
											variant: 'ghost',
											className:
												'border-b rounded-none px-0 w-full flex items-center gap-1.5 justify-start',
										})}
									>
										<CheckCircle2 />

										<span className='truncate'>{ticket.summary}</span>

										<div className='border border-dashed rounded-full size-6 grid place-items-center border-black ml-auto'>
											<CalendarDays className='size-3.5 text-muted-foreground' />
										</div>
									</Link>
								))}
							</>
						)}
					</>
				</CardContent>
			</ScrollArea>
		</Card>
	);
};

export default MyTickets;
