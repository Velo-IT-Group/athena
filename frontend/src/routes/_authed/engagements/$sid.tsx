import { CommandMenu } from '@/components/command-menu';
import CompanyEngagementTab from '@/components/engagement-tabs/company-enagagement-tab';
import ContactEngagementTab from '@/components/engagement-tabs/contact-engagement-tab';
import EngagementTab from '@/components/engagement-tabs/engagment-tab';
import Timer from '@/components/timer';
import { Button } from '@/components/ui/button';

import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import VoiceEngagement from '@/components/engagement-tabs/voice-engagement';
import { useWorker } from '@/providers/worker-provider';
import { getDateOffset } from '@/utils/date';
import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { ChevronsUpDown, Loader2, MessageSquareShare } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import { z } from 'zod';
import ChatEngagement from '@/components/engagement-tabs/chat-engagement';
import type { User } from '@supabase/supabase-js';
import { ScrollArea } from '@/components/ui/scroll-area';
import Tiptap from '@/components/tip-tap';
import { AsyncSelect } from '@/components/ui/async-select';
import { getTickets, searchContacts, searchServiceTickets } from '@/lib/manage/read';
import type { Contact, ServiceTicket } from '@/types/manage';
import HistoryEngagmentTab from '@/components/engagement-tabs/history-engagment-tab';
import { cn, parsePhoneNumber } from '@/lib/utils';
import { CommandItem } from '@/components/ui/command';

const schema = z.object({
	edit: z.boolean().optional(),
});

export const Route = createFileRoute('/_authed/engagements/$sid')({
	component: RouteComponent,
	validateSearch: zodValidator(schema),
});

const tabs = ['Company', 'Contact', 'Engagement', 'History'];

function RouteComponent() {
	const { sid } = Route.useParams();
	const { user } = Route.useRouteContext();

	const { engagements, handleComplete, handleWrapup } = useWorker();
	const engagement = engagements.find((engagement) => engagement.task?.sid === sid);

	if (!engagement) {
		throw new Error('Engagement not found');
	}

	if (!engagement.task) {
		throw new Error('Task not found');
	}

	if (!engagement.reservation) {
		throw new Error('Reservation not found');
	}

	const { task, reservation } = engagement;
	const [selectedTickets, setSelectedTicket] = useState<number[]>(task.attributes.ticketIds ?? []);

	let parsedAttributes = task.attributes;

	const offsetTimestamp = useMemo(
		() => getDateOffset(task?.dateUpdated ? new Date(task?.dateUpdated) : new Date()),
		[task?.dateUpdated]
	);

	const taskChannel = useMemo(() => task?.taskChannelUniqueName, [task?.taskChannelUniqueName]);

	return (
		<main className='grid grid-cols-[4fr_5fr]'>
			<div className='border-r h-[calc(100svh-var(--navbar-height))]'>
				<header className='flex items-center justify-between p-3 border-b'>
					<Button
						variant='ghost'
						size='icon'
					>
						<MessageSquareShare />
					</Button>

					<div className='text-center'>
						<h1 className='text-lg font-semibold'>{parsedAttributes?.name}</h1>
						<p className='text-sm text-muted-foreground flex items-center gap-1.5'>
							<span>{task?.queueName}</span>{' '}
							<Timer stopwatchSettings={{ autoStart: true, offsetTimestamp }} />
						</p>
					</div>

					<Button
						variant={reservation.status === 'wrapping' ? 'destructive' : 'default'}
						disabled={handleWrapup?.isPending || handleComplete?.isPending}
						onClick={() => {
							if (reservation.status === 'accepted') {
								handleWrapup?.mutate(engagement);
							} else if (reservation.status === 'wrapping') {
								handleComplete?.mutate(engagement);
							}
						}}
					>
						{(handleWrapup?.isPending || handleComplete?.isPending) && <Loader2 className='animate-spin' />}
						<span>End</span>
					</Button>
				</header>

				{reservation.status === 'wrapping' ? (
					<div className='p-6 space-y-6'>
						<h2 className='text-xl font-semibold'>
							Wrapup Notes {parsePhoneNumber(task.attributes.from).formattedNumber}
						</h2>

						<div className='w-full border rounded-lg'>
							<Tiptap
								placeholder='Add notes...'
								className='min-h-48'
								onBlur={({ editor }) => {
									editor.getJSON();
								}}
							/>
						</div>

						<Button
							className='w-full'
							onClick={() => handleComplete?.mutate(engagement)}
						>
							Complete
						</Button>
					</div>
				) : (
					<>
						{taskChannel === 'voice' && (
							<VoiceEngagement
								engagement={engagement}
								accessToken={''}
							/>
						)}

						{['chat', 'sms'].includes(taskChannel) && (
							<ChatEngagement
								engagement={engagement}
								user={user as User}
							/>
						)}
					</>
				)}
				{/* <section className='flex flex-col items-center space-y-6'>
				</section> */}
			</div>

			<ScrollArea className='h-[calc(100svh-var(--navbar-height))]'>
				<div className='container mx-auto p-6 flex flex-col items-center w-full'>
					<Tabs
						defaultValue={
							parsedAttributes.contact ? 'Contact' : parsedAttributes.company ? 'Company' : 'Engagement'
						}
						className='w-full gap-3'
					>
						<TabsList className='mx-auto'>
							{tabs.map((tab) => (
								<TabsTrigger
									key={tab}
									value={tab}
								>
									{tab}
								</TabsTrigger>
							))}
						</TabsList>

						<TabsContent
							value='Company'
							asChild
						>
							<Suspense fallback={<div>Loading...</div>}>
								<CompanyEngagementTab id={parsedAttributes?.companyId ?? 43460} />
							</Suspense>
						</TabsContent>

						<TabsContent
							value='Contact'
							asChild
						>
							<Suspense
								fallback={
									<div className='flex flex-col gap-3'>
										<div className='flex items-center gap-3'>
											<Skeleton className='size-12 shrink-0 rounded-full' />
											<Skeleton className='h-6 w-full' />
										</div>
										{Array.from({ length: 5 }).map((_, index) => (
											<Skeleton
												key={index}
												className='h-4 w-full'
											/>
										))}
										{Array.from({ length: 4 }).map((_, index) => (
											<Skeleton
												key={index}
												className='h-4 w-4/5'
											/>
										))}
										{Array.from({ length: 3 }).map((_, index) => (
											<Skeleton
												key={index}
												className='h-4 w-3/5'
											/>
										))}
										{Array.from({ length: 2 }).map((_, index) => (
											<Skeleton
												key={index}
												className='h-4 w-2/5'
											/>
										))}
										{Array.from({ length: 1 }).map((_, index) => (
											<Skeleton
												key={index}
												className='h-4 w-1/5'
											/>
										))}
									</div>
								}
							>
								{parsedAttributes?.contactId && typeof parsedAttributes?.contactId === 'number' ? (
									<>
										<ContactEngagementTab id={parsedAttributes.contactId} />
									</>
								) : (
									<div>
										<AsyncSelect<Contact>
											label='Contact'
											fetcher={searchContacts}
											getDisplayValue={(item) => (
												<div>
													{item.firstName} {item.lastName}
												</div>
											)}
											getOptionValue={(item) => item.id.toString()}
											renderOption={(item) => (
												<div>
													{item.firstName} {item.lastName}
												</div>
											)}
											value={parsedAttributes?.contactId}
											onChange={async (value) => {
												if (!value) return;
												parsedAttributes = {
													...parsedAttributes,
													contactId: value?.id,
													companyId: value?.company?.id,
													name: value?.firstName + ' ' + value?.lastName,
												};
												await task.setAttributes({
													...parsedAttributes,
													contactId: value?.id,
													companyId: value?.company?.id,
													name: value?.firstName + ' ' + value?.lastName,
												});
											}}
										>
											<Button variant='outline'>Select Contact</Button>
										</AsyncSelect>
									</div>
								)}
							</Suspense>
						</TabsContent>

						<TabsContent
							value='Engagement'
							asChild
						>
							<Suspense fallback={<div>Loading...</div>}>
								{selectedTickets.length > 0 ? (
									<EngagementTab
										ticketIds={selectedTickets}
										handleTicketChange={async (value) => {
											setSelectedTicket(value);
											await task.setAttributes({
												...parsedAttributes,
												ticketIds: value,
											});
										}}
									/>
								) : (
									<AsyncSelect<ServiceTicket>
										fetcher={async (value, page) => {
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
												onSelect={async () => {
													setSelectedTicket((prev) => [...prev, item.id]);
													await task.setAttributes({
														...parsedAttributes,
														ticketIds: [item.id],
													});
												}}
											>
												<div className='flex flex-col gap-1.5'>
													<div className='flex flex-col'>
														<div className='font-medium'>{item.summary}</div>
														{/* <div className='text-xs text-muted-foreground'>
									{item.identifier}
									{item.productClass === 'Bundle' && (
										<Badge
											variant='outline'
											className='ml-1.5'
										>
											Bundle
										</Badge>
									)}
								</div> */}
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
											setSelectedTicket((prev) => [...prev, value.id]);
											await task.setAttributes({
												...parsedAttributes,
												ticketIds: [value.id],
											});
										}}
										className='w-[var(--radix-popover-trigger-width)]'
									>
										<Button
											variant='outline'
											role='combobox'
											className={cn(
												'justify-between',
												!selectedTickets && 'text-muted-foreground'
											)}
										>
											{selectedTickets ? `#` : 'Select a ticket...'}
											<ChevronsUpDown className='opacity-50' />
										</Button>
									</AsyncSelect>
								)}
							</Suspense>
						</TabsContent>

						<TabsContent value='History'>
							<HistoryEngagmentTab
								contactId={parsedAttributes.contactId}
								companyId={parsedAttributes.companyId}
							/>
						</TabsContent>
					</Tabs>
				</div>
			</ScrollArea>

			<CommandMenu
				sections={[
					{
						heading: 'Duo',
						items: [
							{
								icon: (
									<img
										src='/duo-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Send duo prompt...',
								value: 'send-duo-prompt',
								action: () => {},
							},
						],
					},
					{
						heading: 'Timezest',
						items: [
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Schedule onsite appointment (1 hour)...',
								value: 'schedule-onsite-appointment',
								action: () => {},
							},
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Schedule phone call (1 hour)...',
								value: 'schedule-phone-call',
								action: () => {},
							},
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Schedule phone call (30 minutes)...',
								value: 'schedule-phone-call-30-minutes',
								action: () => {},
							},
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Strength meeting (1 hour)...',
								value: 'strength-meeting',
								action: () => {},
							},
						],
					},
				]}
			/>
		</main>
	);
}
