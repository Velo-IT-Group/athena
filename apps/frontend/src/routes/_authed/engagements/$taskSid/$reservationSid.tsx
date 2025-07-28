import ChatEngagement from '@/components/engagement-tabs/chat-engagement';
import Tiptap from '@/components/tip-tap';
import Timer from '@/components/timer';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown, Loader2 } from 'lucide-react';
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '@/components/ui/resizable';
import useReservations from '@/hooks/use-reservations';
import { getDateOffset } from '@/utils/date';
import type { User } from '@supabase/supabase-js';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Suspense, useMemo } from 'react';
import { cn, parsePhoneNumber } from '@/lib/utils';
import type { ReservationInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task/reservation';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CompanyEngagementTab from '@/components/engagement-tabs/company-enagagement-tab';
import { Skeleton } from '@/components/ui/skeleton';
import { AsyncSelect } from '@/components/ui/async-select';
import { getCompanies, getContacts, getTickets } from '@/lib/manage/read';
import EngagementTab from '@/components/engagement-tabs/engagment-tab';
import { CommandItem } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter';
import VoiceEngagement from '@/components/engagement-tabs/voice-engagement';
import HistoryEngagmentTab from '@/components/engagement-tabs/history-engagment-tab';
import { EngagementProvider } from '@/components/engagement-tabs/engagement-context';
import ContactEngagementTab from '@/components/engagement-tabs/contact-engagement-tab';

const schema = z.object({
	pane: z.enum(['ticket']).optional(),
	itemId: z.number().optional(),
});

export const Route = createFileRoute(
	'/_authed/engagements/$taskSid/$reservationSid'
)({
	component: RouteComponent,
	validateSearch: zodValidator(schema),
});

const tabs = ['Company', 'Contact', 'Engagement', 'History'];

function RouteComponent() {
	return null;
}

// function RouteComponent() {
// 	const { taskSid, reservationSid } = Route.useParams();
// 	const { pane, itemId } = Route.useSearch();
// 	const { user, accessToken } = Route.useRouteContext();
// 	const navigate = useNavigate();

// 	// const { engagements } = useWorker();

// 	// const { calls } = useDevice({ token: accessToken });
// 	const engagement = engagements?.find(
// 		(engagement) => engagement.reservation?.sid === reservationSid
// 	);

// 	console.log(engagements, reservationSid);

// 	// if (!reservation) throw new Error('Reservation not found');

// 	const reservation = engagement?.reservation;
// 	const task = engagement?.task;

// 	const { data, handleReservationUpdate } = useReservations({
// 		taskSid,
// 		reservationSid,
// 	});
// 	// const { data: task, handleTaskUpdate } = useTwilioTask(taskSid);

// 	const parsedAttributes =
// 		typeof task?.attributes === 'undefined'
// 			? {}
// 			: typeof task?.attributes === 'string'
// 				? JSON.parse(task?.attributes)
// 				: task?.attributes;

// 	const selectedTickets = (parsedAttributes?.ticketIds ?? []) as number[];

// 	const offsetTimestamp = useMemo(
// 		() =>
// 			getDateOffset(
// 				reservation?.dateUpdated
// 					? new Date(reservation?.dateUpdated)
// 					: new Date()
// 			),
// 		[reservation?.dateUpdated]
// 	);

// 	const taskChannel = useMemo(
// 		() => task?.taskChannelUniqueName,
// 		[task?.taskChannelUniqueName]
// 	);

// 	return (
// 		<EngagementProvider initialEngagement={engagement}>
// 			<ResizablePanelGroup direction='horizontal'>
// 				<ResizablePanel
// 					minSize={30}
// 					maxSize={60}
// 					autoSave='engagement-control-panel'
// 					className='flex flex-col h-[calc(100svh-var(--navbar-height))] relative'
// 				>
// 					<header className='flex items-center justify-between p-3 border-b'>
// 						<div></div>

// 						<div className='text-center'>
// 							<h1 className='text-lg font-semibold'>
// 								{parsedAttributes?.name}
// 							</h1>
// 							<p className='text-sm text-muted-foreground flex items-center gap-1.5'>
// 								<span>{task?.queueName}</span>{' '}
// 								<Timer
// 									stopwatchSettings={{
// 										autoStart: true,
// 										offsetTimestamp,
// 									}}
// 								/>
// 							</p>
// 						</div>

// 						<Button
// 							variant={
// 								reservation?.status === 'wrapping'
// 									? 'destructive'
// 									: 'default'
// 							}
// 							disabled={handleReservationUpdate?.isPending}
// 							onClick={() => {
// 								if (reservation?.status === 'accepted') {
// 									handleReservationUpdate?.mutate({
// 										reservationStatus: 'wrapping',
// 									});
// 								} else if (reservation?.status === 'wrapping') {
// 									handleReservationUpdate?.mutate({
// 										reservationStatus: 'completed',
// 									});
// 									navigate({ to: '/' });
// 								}
// 							}}
// 						>
// 							{handleReservationUpdate?.isPending && (
// 								<Loader2 className='animate-spin' />
// 							)}
// 							<span>End</span>
// 						</Button>
// 					</header>

// 					{reservation?.status === 'wrapping' ? (
// 						<div className='p-6 space-y-6'>
// 							<h2 className='text-xl font-semibold'>
// 								Wrapup Notes{' '}
// 								{
// 									parsePhoneNumber(
// 										(
// 											task?.attributes as unknown as Record<
// 												string,
// 												string
// 											>
// 										).from ?? ''
// 									).formattedNumber
// 								}
// 							</h2>

// 							<div className='w-full border rounded-lg'>
// 								<Tiptap
// 									placeholder='Add notes...'
// 									className='min-h-48'
// 									onBlur={({ editor }) => {
// 										editor.getJSON();
// 									}}
// 								/>
// 							</div>

// 							<Button
// 								className='w-full'
// 								onClick={() => {
// 									handleReservationUpdate?.mutate({
// 										reservationStatus: 'completed',
// 									});
// 									navigate({ to: '/' });
// 								}}
// 							>
// 								{handleReservationUpdate?.isPending && (
// 									<Loader2 className='animate-spin' />
// 								)}
// 								<span>Complete</span>
// 							</Button>
// 						</div>
// 					) : (
// 						<>
// 							{taskChannel === 'voice' && (
// 								<VoiceEngagement
// 									engagement={engagement!}
// 									accessToken={accessToken}
// 								/>
// 							)}

// 							{['chat', 'sms'].includes(taskChannel ?? '') && (
// 								<ChatEngagement
// 									engagement={{
// 										reservation:
// 											reservation! as unknown as ReservationInstance,
// 										task: task! as unknown as TaskInstance,
// 									}}
// 									user={user as User}
// 									accessToken={accessToken}
// 								/>
// 							)}
// 						</>
// 					)}
// 				</ResizablePanel>

// 				<ResizableHandle />

// 				<ResizablePanel className='flex flex-col h-[calc(100svh-var(--navbar-height))]'>
// 					<ScrollArea className='h-[calc(100svh-var(--navbar-height))]'>
// 						<div className='container mx-auto p-6 flex flex-col items-center w-full'>
// 							<Tabs
// 								defaultValue={
// 									parsedAttributes?.contact
// 										? 'Contact'
// 										: parsedAttributes.company
// 											? 'Company'
// 											: 'Engagement'
// 								}
// 								className='w-full gap-3'
// 							>
// 								<TabsList className='mx-auto'>
// 									{tabs.map((tab) => (
// 										<TabsTrigger
// 											key={tab}
// 											value={tab}
// 										>
// 											{tab}
// 										</TabsTrigger>
// 									))}
// 								</TabsList>

// 								<TabsContent
// 									value='Company'
// 									asChild
// 								>
// 									{parsedAttributes?.companyId ? (
// 										<Suspense
// 											fallback={<div>Loading...</div>}
// 										>
// 											<CompanyEngagementTab
// 												id={parsedAttributes?.companyId}
// 												taskSid={taskSid}
// 											/>
// 										</Suspense>
// 									) : (
// 										<AsyncSelect
// 											label='Company'
// 											fetcher={async (query, page) => {
// 												const { data } =
// 													await getCompanies({
// 														data: {
// 															conditions: `deletedFlag = false and (name contains '${query ?? ''}' or identifier contains '${query ?? ''}')`,
// 															childConditions: {
// 																'types/id': 1,
// 															},
// 															orderBy: {
// 																key: 'name',
// 																order: 'asc',
// 															},
// 															fields: [
// 																'id',
// 																'name',
// 															],
// 															page,
// 														},
// 													});

// 												return data;
// 											}}
// 											getDisplayValue={(item) => (
// 												<div>{item.name}</div>
// 											)}
// 											getOptionValue={(item) =>
// 												item.id.toString()
// 											}
// 											renderOption={(item) => (
// 												<CommandItem
// 													value={item.id.toString()}
// 													onSelect={() => {
// 														// handleTaskUpdate.mutate({
// 														// 	attributes: JSON.stringify({
// 														// 		...parsedAttributes,
// 														// 		companyId: item?.id,
// 														// 		companyName: item.name,
// 														// 	}),
// 														// });
// 													}}
// 												>
// 													{item.name}
// 												</CommandItem>
// 											)}
// 											value={parsedAttributes?.contactId}
// 											onChange={async (value) => {}}
// 										>
// 											<Button variant='outline'>
// 												Select company
// 											</Button>
// 										</AsyncSelect>
// 									)}
// 								</TabsContent>

// 								<TabsContent
// 									value='Contact'
// 									asChild
// 								>
// 									<Suspense
// 										fallback={
// 											<div className='flex flex-col gap-3'>
// 												<div className='flex items-center gap-3'>
// 													<Skeleton className='size-12 shrink-0 rounded-full' />
// 													<Skeleton className='h-6 w-full' />
// 												</div>
// 												{Array.from({ length: 5 }).map(
// 													(_, index) => (
// 														<Skeleton
// 															key={index}
// 															className='h-4 w-full'
// 														/>
// 													)
// 												)}
// 												{Array.from({ length: 4 }).map(
// 													(_, index) => (
// 														<Skeleton
// 															key={index}
// 															className='h-4 w-4/5'
// 														/>
// 													)
// 												)}
// 												{Array.from({ length: 3 }).map(
// 													(_, index) => (
// 														<Skeleton
// 															key={index}
// 															className='h-4 w-3/5'
// 														/>
// 													)
// 												)}
// 												{Array.from({ length: 2 }).map(
// 													(_, index) => (
// 														<Skeleton
// 															key={index}
// 															className='h-4 w-2/5'
// 														/>
// 													)
// 												)}
// 												{Array.from({ length: 1 }).map(
// 													(_, index) => (
// 														<Skeleton
// 															key={index}
// 															className='h-4 w-1/5'
// 														/>
// 													)
// 												)}
// 											</div>
// 										}
// 									>
// 										{parsedAttributes?.contactId &&
// 										typeof parsedAttributes?.contactId ===
// 											'number' ? (
// 											<>
// 												<ContactEngagementTab
// 													id={
// 														parsedAttributes.contactId
// 													}
// 													handleContactChange={(
// 														contact
// 													) => {
// 														// handleTaskUpdate.mutate({
// 														// 	attributes: JSON.stringify({
// 														// 		...parsedAttributes,
// 														// 		contactId: contact.id,
// 														// 		companyId: contact.company?.id,
// 														// 		name: contact.firstName + ' ' + contact.lastName,
// 														// 	}),
// 														// });
// 													}}
// 													taskSid={taskSid}
// 													reservationSid={
// 														reservationSid
// 													}
// 												/>
// 											</>
// 										) : (
// 											<div>
// 												<AsyncSelect
// 													label='Contact'
// 													fetcher={async (
// 														query,
// 														page
// 													) => {
// 														const names = query
// 															?.trim()
// 															.split(' ');
// 														const firstName =
// 															names?.[0];
// 														const lastName =
// 															names?.[1];

// 														const nameSearch =
// 															lastName
// 																? `firstName contains '${firstName}' and (company/name contains '${lastName}' or lastName contains '${lastName}')`
// 																: `company/name contains '${firstName}' or firstName contains '${firstName}' or lastName contains '${firstName}'`;

// 														let contactConditions =
// 															query
// 																? `inactiveFlag = false and (${nameSearch})`
// 																: 'inactiveFlag = false';

// 														if (
// 															parsedAttributes.companyId
// 														) {
// 															contactConditions += ` and company/id = ${parsedAttributes.companyId}`;
// 														}

// 														const { data } =
// 															await getContacts({
// 																data: {
// 																	page,
// 																	fields: [
// 																		'id',
// 																		'firstName',
// 																		'lastName',
// 																		'company',
// 																	],
// 																	orderBy: {
// 																		key: 'firstName',
// 																	},
// 																	childConditions:
// 																		'types/id = 17 or types/id = 21',
// 																	conditions:
// 																		contactConditions,
// 																},
// 															});

// 														return data;
// 													}}
// 													getDisplayValue={(item) => (
// 														<div>
// 															{item.firstName}{' '}
// 															{item.lastName}
// 														</div>
// 													)}
// 													getOptionValue={(item) =>
// 														item.id.toString()
// 													}
// 													renderOption={(item) => (
// 														<CommandItem
// 															value={item.id.toString()}
// 															onSelect={() => {
// 																// handleTaskUpdate.mutate({
// 																// 	attributes: JSON.stringify({
// 																// 		...parsedAttributes,
// 																// 		contactId: item?.id,
// 																// 		companyId: item?.company?.id,
// 																// 		name: item?.firstName + ' ' + item?.lastName,
// 																// 	}),
// 																// });
// 															}}
// 														>
// 															{item.firstName}{' '}
// 															{item.lastName}
// 														</CommandItem>
// 													)}
// 													value={
// 														parsedAttributes?.contactId
// 													}
// 													onChange={async (value) => {
// 														if (!value) return;
// 														// handleTaskUpdate.mutate({
// 														// 	attributes: JSON.stringify({
// 														// 		...parsedAttributes,
// 														// 		contactId: value?.id,
// 														// 		companyId: value?.company?.id,
// 														// 		name: value?.firstName + ' ' + value?.lastName,
// 														// 	}),
// 														// });
// 														// parsedAttributes = {
// 														// 	...parsedAttributes,
// 														// contactId: value?.id,
// 														// companyId: value?.company?.id,
// 														// name: value?.firstName + ' ' + value?.lastName,
// 														// };
// 														// await task.setAttributes({
// 														// 	...parsedAttributes,
// 														// 	contactId: value?.id,
// 														// 	companyId: value?.company?.id,
// 														// 	name: value?.firstName + ' ' + value?.lastName,
// 														// });
// 													}}
// 												>
// 													<Button variant='outline'>
// 														Select Contact
// 													</Button>
// 												</AsyncSelect>
// 											</div>
// 										)}
// 									</Suspense>
// 								</TabsContent>

// 								<TabsContent
// 									value='Engagement'
// 									asChild
// 								>
// 									<Suspense fallback={<div>Loading...</div>}>
// 										{selectedTickets.length > 0 ? (
// 											<EngagementTab
// 												ticketIds={selectedTickets}
// 												companyId={
// 													parsedAttributes.companyId
// 												}
// 												handleTicketChange={
// 													(value) => {}
// 													// handleTaskUpdate.mutate({
// 													// 	attributes: JSON.stringify({
// 													// 		...parsedAttributes,
// 													// 		ticketIds: value,
// 													// 	}),
// 													// })
// 												}
// 											/>
// 										) : (
// 											<AsyncSelect
// 												fetcher={async (
// 													value,
// 													page
// 												) => {
// 													const ticketData =
// 														await getTickets({
// 															data: {
// 																conditions: {
// 																	summary: {
// 																		value: `'${value}'`,
// 																		comparison:
// 																			'contains',
// 																	},
// 																	closedFlag:
// 																		false,
// 																	parentTicketId:
// 																		null,
// 																	'board/id':
// 																		[
// 																			22,
// 																			26,
// 																			30,
// 																			31,
// 																		],
// 																	'company/id':
// 																		parsedAttributes.companyId,
// 																},
// 																page,
// 																orderBy: {
// 																	key: 'summary',
// 																},
// 															},
// 														});

// 													return ticketData.data;
// 												}}
// 												renderOption={(item) => (
// 													<CommandItem
// 														value={item.id.toString()}
// 														onSelect={() => {
// 															// handleTaskUpdate.mutate({
// 															// 	attributes: JSON.stringify({
// 															// 		...parsedAttributes,
// 															// 		ticketIds: [item.id],
// 															// 	}),
// 															// });
// 															// setSelectedTicket((prev) => [...prev, item.id]);
// 															// await task.setAttributes({
// 															// 	...parsedAttributes,
// 															// 	ticketIds: [item.id],
// 															// });
// 														}}
// 													>
// 														<div className='flex flex-col gap-1.5'>
// 															<div className='flex flex-col'>
// 																<div className='font-medium'>
// 																	{
// 																		item.summary
// 																	}
// 																</div>
// 																<div className='text-xs text-muted-foreground'>
// 																	{item.id}
// 																	{/* {item.recordType === 'ServiceTicket' && (
// 																	<Badge
// 																		variant='secondary'
// 																		className='ml-1.5'
// 																	>
// 																		Service Ticket
// 																	</Badge>
// 																)} */}
// 																</div>
// 															</div>

// 															<div className='text-xs text-muted-foreground'>
// 																{
// 																	item.company
// 																		?.name
// 																}{' '}
// 																•{' '}
// 																{
// 																	item.contact
// 																		?.name
// 																}
// 															</div>
// 														</div>
// 													</CommandItem>
// 												)}
// 												getOptionValue={(item) =>
// 													item.id.toString()
// 												}
// 												getDisplayValue={(item) => (
// 													<div className='flex items-center gap-2'>
// 														<div className='flex flex-col'>
// 															<div className='font-medium'>
// 																{item.summary}
// 															</div>
// 															<div className='text-xs text-muted-foreground'>
// 																{item.id}
// 															</div>
// 														</div>
// 													</div>
// 												)}
// 												notFound={
// 													<div className='py-6 text-center text-sm'>
// 														No tickets found
// 													</div>
// 												}
// 												label='Tickets'
// 												placeholder='Search tickets...'
// 												value={''}
// 												onChange={async (value) => {
// 													if (!value) {
// 														return;
// 													}
// 													// setSelectedTicket((prev) => [...prev, value.id]);
// 													// await task.setAttributes({
// 													// 	...parsedAttributes,
// 													// 	ticketIds: [value.id],
// 													// });
// 												}}
// 												className='w-[var(--radix-popover-trigger-width)]'
// 											>
// 												<Button
// 													variant='outline'
// 													role='combobox'
// 													className={cn(
// 														'justify-between'
// 														// !selectedTickets && 'text-muted-foreground'
// 													)}
// 												>
// 													{/* {selectedTickets ? `#` : 'Select a ticket...'} */}
// 													<ChevronsUpDown className='opacity-50' />
// 												</Button>
// 											</AsyncSelect>
// 										)}
// 									</Suspense>
// 								</TabsContent>

// 								<TabsContent value='History'>
// 									<HistoryEngagmentTab
// 										contactId={parsedAttributes.contactId}
// 										companyId={parsedAttributes.companyId}
// 									/>
// 								</TabsContent>
// 							</Tabs>
// 						</div>
// 					</ScrollArea>
// 				</ResizablePanel>
// 			</ResizablePanelGroup>
// 		</EngagementProvider>
// 		// <Sheet
// 		// 	open={pane !== undefined}
// 		// 	onOpenChange={(open) =>
// 		// 		!open &&
// 		// 		navigate({
// 		// 			to: '/engagements/$taskSid/$reservationSid',
// 		// 			params: { taskSid, reservationSid },
// 		// 		})
// 		// 	}
// 		// >

// 		// <SheetContent
// 		// 	hideClose
// 		// 	className='sm:max-w-[min(90%,1280px)] rounded-bl-4xl rounded-tl-4xl overflow-hidden'
// 		// >
// 		// 	{pane === 'ticket' && itemId && (
// 		// 		<Suspense
// 		// 			fallback={
// 		// 				<>
// 		// 					<SheetHeader>
// 		// 						<SheetTitle className='text-4xl font-medium'>
// 		// 							<Skeleton className='h-9 w-3/4' />
// 		// 						</SheetTitle>
// 		// 						<SheetDescription asChild>
// 		// 							<div className='flex items-center gap-1.5'>
// 		// 								<ColoredBadge
// 		// 									variant='purple'
// 		// 									className='text-xl rounded-full'
// 		// 								>
// 		// 									{/* <Circle className='stroke-0 fill-inherit' /> {data?.status?.name} */}
// 		// 								</ColoredBadge>
// 		// 							</div>
// 		// 						</SheetDescription>
// 		// 					</SheetHeader>
// 		// 				</>
// 		// 			}
// 		// 		>
// 		// 			<TicketPane id={itemId} />
// 		// 		</Suspense>
// 		// 	)}
// 		// </SheetContent>
// 		// </Sheet>
// 	);
// }
