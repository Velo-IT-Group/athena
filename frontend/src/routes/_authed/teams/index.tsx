import { activityOrder } from '@/components/activity-list';
import ActivityListItem from '@/components/activity-list-item';
import { ListSelector } from '@/components/status-selector';
import Timer from '@/components/timer';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { ModalPopoverContent, Popover, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSyncMap from '@/hooks/use-sync-map';
import { getAccessTokenQuery, getActivitiesQuery } from '@/lib/twilio/api';
import { useWorker } from '@/providers/worker-provider';
import { getDateOffset } from '@/utils/date';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ChevronDown, Mic, Phone, PhoneCall, User } from 'lucide-react';
import { useMemo } from 'react';
import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import type { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';

export const Route = createFileRoute('/_authed/teams/')({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: token } = useSuspenseQuery(getAccessTokenQuery({ identity: '', workerSid: '' }));

	const { items: conversations } = useSyncMap({
		token,
		mapKey: 'SyncTaskRouterTasks',
	});
	const { items: workers } = useSyncMap({
		token,
		mapKey: 'SyncTaskRouterWorkers',
	});

	const filterWorkers = workers.filter(
		(w) => ((w.data as WorkerInstance).attributes as unknown as Record<string, any>).active
	);

	type WorkerConversation = WorkerInstance & {
		tasks: TaskInstance[];
	};

	const conversationsByWorker = useMemo(
		() =>
			filterWorkers.map((w) => {
				const worker = w.data as WorkerInstance;

				return {
					...worker,
					tasks: conversations
						.filter((c) => JSON.parse((c.data as TaskInstance).attributes).worker_sid === worker.sid)
						.map((c) => c.data as TaskInstance),
				};
			}),
		[conversations, filterWorkers]
	);

	const groupedConversationsByWorker = useMemo(() => {
		return Object.groupBy(conversationsByWorker, (w) => w.activityName);
	}, [conversationsByWorker]) as Record<string, WorkerConversation[]>;

	const { data: activities } = useSuspenseQuery(getActivitiesQuery());

	return (
		<div className='flex h-[calc(100vh-var(--navbar-height))] flex-col p-6 space-y-12'>
			<h1>Teams</h1>

			<div className='space-y-12'>
				{Object.entries(groupedConversationsByWorker)
					.sort(
						([activityNameA], [activityNameB]) =>
							activityOrder.get(activityNameA) - activityOrder.get(activityNameB)
					)
					.map(([activityName, filterWorkers]) => (
						<Collapsible
							key={activityName}
							defaultOpen={filterWorkers.length > 0 && activityName !== 'Offline'}
						>
							<CollapsibleTrigger className='flex items-center gap-1.5 hover:cursor-pointer'>
								<h2 className='text-lg font-semibold'>{activityName}</h2>
								<ChevronDown className='size-4' />
							</CollapsibleTrigger>

							<CollapsibleContent>
								<Table className='overflow-x-hidden'>
									<TableHeader>
										<TableRow>
											<TableHead className='text-sm w-96'>Worker</TableHead>
											<TableHead className='text-sm w-96'>Tasks</TableHead>
											<TableHead className='text-sm'>Messages</TableHead>
										</TableRow>
									</TableHeader>

									<TableBody className='overflow-x-auto'>
										{filterWorkers
											.sort((a, b) => a.friendlyName.localeCompare(b.friendlyName))
											.map((cell) => (
												<ContextMenu>
													<ContextMenuTrigger
														key={cell.sid}
														asChild
													>
														<>
															<TableRow
																key={cell.sid}
																className={
																	cell.tasks.some(
																		(c) =>
																			c.assignmentStatus === 'reserved' &&
																			JSON.parse(c.attributes).direction ===
																				'inbound'
																	)
																		? 'bg-orange-500/10 animate-pulse hover:bg-orange-500/20'
																		: undefined
																}
															>
																<TableCell className='w-96'>
																	<Sheet>
																		<SheetTrigger>
																			<div className='flex items-center gap-1.5'>
																				<Avatar className='size-12'>
																					<AvatarFallback>
																						<User className='size-5 stroke-[2px]' />
																					</AvatarFallback>
																				</Avatar>

																				<div className='flex flex-col items-start'>
																					<p>
																						{
																							JSON.parse(
																								JSON.stringify(
																									cell.attributes
																								)
																							).full_name
																						}
																					</p>

																					<div className='flex items-center gap-1.5'>
																						<ActivityListItem
																							activityName={
																								cell.activityName
																							}
																						/>

																						<Separator
																							orientation='vertical'
																							className='h-4'
																						/>

																						<Timer
																							stopwatchSettings={{
																								offsetTimestamp:
																									getDateOffset(
																										new Date(
																											cell.dateStatusChanged
																										)
																									),
																								autoStart: true,
																							}}
																						/>
																					</div>
																				</div>
																			</div>
																		</SheetTrigger>

																		<SheetContent className='gap-0 sm:max-w-xl'>
																			<SheetHeader>
																				<div className='flex items-center gap-1.5'>
																					<SheetTitle>
																						{
																							JSON.parse(
																								JSON.stringify(
																									cell.attributes
																								)
																							).full_name
																						}
																					</SheetTitle>

																					<Popover>
																						<PopoverTrigger asChild>
																							<Button
																								variant='outline'
																								role='combobox'
																								className='w-[200px] justify-between'
																								// disabled={isPending}
																							>
																								<ActivityListItem
																									activityName={
																										cell.activityName
																									}
																								/>
																							</Button>
																						</PopoverTrigger>

																						<ModalPopoverContent className='p-0'>
																							<ListSelector
																								items={activities}
																								currentValue={activities.find(
																									(a) =>
																										a.sid ===
																										cell.activitySid
																								)}
																								itemView={(a) => (
																									<ActivityListItem
																										activityName={
																											a.friendlyName
																										}
																									/>
																								)}
																							/>
																						</ModalPopoverContent>
																					</Popover>
																				</div>
																			</SheetHeader>

																			<div className='p-6'></div>
																		</SheetContent>
																	</Sheet>
																</TableCell>

																<TableCell className='w-96'>
																	{cell.tasks.length > 0 ? (
																		<div className='flex flex-col items-start gap-1.5'>
																			{cell.tasks.map((task) => {
																				return (
																					<ActiveCall
																						key={task.sid}
																						task={task}
																					/>
																				);
																			})}
																		</div>
																	) : (
																		<Component />
																	)}
																</TableCell>

																<TableCell>
																	<Component />
																</TableCell>
															</TableRow>

															<ContextMenuContent>
																<ContextMenuItem asChild>
																	<Button>TEst</Button>
																</ContextMenuItem>
															</ContextMenuContent>
														</>
													</ContextMenuTrigger>
												</ContextMenu>
											))}
									</TableBody>
								</Table>
							</CollapsibleContent>
						</Collapsible>
					))}
			</div>
		</div>
	);
}

function Component() {
	return (
		<div
			className='rounded pattern-diagonal-lines pattern-primary pattern-bg-background
  pattern-size-2 pattern-opacity-15 w-56 h-12 border border-primary'
		/>
	);
}

function ActiveCall({ task }: { task: TaskInstance }) {
	const isWrapping = task.assignmentStatus === 'wrapping';
	const parsedAttributes = JSON.parse(task.attributes);
	const { worker } = useWorker();

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button
					variant='outline'
					size='lg'
					className='h-12 items-center gap-[1.125rem] w-56 border-primary justify-start'
				>
					{isWrapping ? <Phone className='rotate-[135deg]' /> : <Phone />}

					<div className='flex flex-col items-start'>
						<span className='text-xs'>{parsedAttributes.name}</span>

						<div className='flex text-xs text-muted-foreground'>
							<Timer
								stopwatchSettings={{
									offsetTimestamp: getDateOffset(new Date(task.dateUpdated)),
									autoStart: true,
								}}
								hideDays
								hideHours
							/>
							<span className=''>&nbsp;</span>| {task.taskQueueFriendlyName}
						</div>
					</div>
				</Button>
			</SheetTrigger>

			<SheetContent className='gap-0 sm:max-w-xl'>
				<SheetHeader>
					<SheetTitle className='text-2xl'>Monitor Engagement</SheetTitle>
				</SheetHeader>

				<Tabs
					defaultValue='engagement'
					className='flex-1 px-4 overflow-hidden'
				>
					<TabsList>
						<TabsTrigger value='engagement'>Engagement</TabsTrigger>
						<TabsTrigger value='info'>Info</TabsTrigger>
					</TabsList>

					<TabsContent
						value='engagement'
						asChild
					>
						<div className='flex-1 grid place-items-center'>
							<div className='flex flex-col items-center gap-6'>
								{isWrapping ? (
									<Phone className='rotate-[135deg] size-9' />
								) : (
									<Phone className='size-9' />
								)}

								<p className='text-lg font-semibold'>
									{parsedAttributes.name === parsedAttributes.caller ? (
										<span>{parsedAttributes.name}</span>
									) : (
										<span>
											{parsedAttributes.name}, {parsedAttributes.caller}
										</span>
									)}
								</p>
							</div>
						</div>
					</TabsContent>

					<TabsContent
						value='info'
						asChild
					>
						<pre className='flex-1 text-wrap overflow-y-scroll overflow-x-hidden'>
							{JSON.stringify(task, null, 2)}
						</pre>
					</TabsContent>
				</Tabs>

				<SheetFooter className='flex-row justify-center gap-6'>
					<Button
						size='icon'
						variant='outline'
						className='rounded-full size-12 shrink-0'
						disabled={isWrapping}
					>
						<Mic />
					</Button>

					<Button
						size='icon'
						variant='outline'
						className='rounded-full size-12 shrink-0'
						disabled={isWrapping}
					>
						<PhoneCall />
					</Button>

					<Button
						size='icon'
						variant='outline'
						className='rounded-full size-12 shrink-0'
						onClick={() => worker?.monitor(task.sid, '', {})}
						disabled={isWrapping}
					>
						<User />
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
