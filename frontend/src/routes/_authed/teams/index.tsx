import { Suspense, useMemo } from 'react';

import { ChevronDown, Circle, MessageCircle, Phone } from 'lucide-react';

import { z } from 'zod';

import { createFileRoute, Link } from '@tanstack/react-router';

import { getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { zodValidator } from '@tanstack/zod-adapter';

import type { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import type { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';

import { activityOrder } from '@/components/activity-list';
import { columns } from '@/components/table-columns/teams';
import DataTableDisplay from '@/components/ui/data-table/display';
import useSyncMap from '@/hooks/use-sync-map';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ColoredBadge } from '@/components/ui/badge';
import { WorkerPane } from '@/components/panes/worker-pane';
import { ListGroup, ListItem } from '@/components/ui/list';
import ManageUserAvatar from '@/components/avatar/manage-user-avatar';
import { Separator } from '@/components/ui/separator';
import ActivityListItem from '@/components/activity-list-item';
import Timer from '@/components/timer';
import { getDateOffset } from '@/utils/date';

const schema = z.object({
	pane: z.enum(['worker', 'call']).optional(),
	itemId: z.string().optional(),
});

export const Route = createFileRoute('/_authed/teams/')({
	component: RouteComponent,
	validateSearch: zodValidator(schema),
	ssr: 'data-only',
});

export type WorkerConversation = WorkerInstance & {
	id: string;
	tasks: (TaskInstance & { id: string })[];
};

function RouteComponent() {
	const { accessToken } = Route.useRouteContext();
	const { pane, itemId } = Route.useSearch();
	const navigate = Route.useNavigate();

	const { items: conversations, isLoading: isLoadingConversations } =
		useSyncMap({
			token: accessToken,
			mapKey: 'SyncTaskRouterTasks',
		});

	const { items: workers, isLoading: isLoadingWorkers } = useSyncMap({
		token: accessToken,
		mapKey: 'SyncTaskRouterWorkers',
	});

	const filterWorkers = workers.filter(
		(w) =>
			(
				(w.data as WorkerInstance).attributes as unknown as Record<
					string,
					any
				>
			).active
	);

	const conversationsByWorker: WorkerConversation[] = useMemo(
		() =>
			filterWorkers.map((w) => {
				const worker = w.data as WorkerInstance;

				return {
					...worker,
					tasks: conversations
						.filter(
							(c) =>
								JSON.parse(
									c.data.attributes as unknown as string
								).worker_sid === worker.sid
						)
						.map((c) => c.data as TaskInstance),
				} as WorkerConversation;
			}),
		[conversations, filterWorkers]
	);

	const groupedConversationsByWorker = useMemo(() => {
		return Object.groupBy(conversationsByWorker, (w) => w.activityName);
	}, [conversationsByWorker]) as Record<string, WorkerConversation[]>;

	// const { data: activities } = useSuspenseQuery(getActivitiesQuery());

	return (
		<Sheet
			open={pane !== undefined}
			onOpenChange={(open) => !open && navigate({ to: '/teams' })}
		>
			<div className='w-full relative'>
				<div className='sticky top-0 z-[2] min-h-8 max-h-8 px-4 py-1.5 items-center gap-8 grid grid-cols-[3fr_2fr_2fr_1fr_1.2fr_1.2fr_1fr] max-w-full flex-[1_1_auto] inset-shadow-[0px_-1px_0px_0px_var(--border)] bg-background'>
					<div className='flex items-center justify-start gap-1 overflow-hidden text-xs text-muted-foreground'>
						Engineer
					</div>

					<div className='flex items-center justify-start gap-1 overflow-hidden text-xs text-muted-foreground'>
						<Phone className='size-3' />
						<span>Calls</span>
					</div>

					<div className='flex items-center justify-start gap-1 overflow-hidden text-xs text-muted-foreground'>
						{/* <MessageCircle className='size-3' />
						<span>Chats</span> */}
					</div>
				</div>

				{Object.entries(groupedConversationsByWorker)
					.sort(
						([activityNameA], [activityNameB]) =>
							activityOrder.get(activityNameA) -
							activityOrder.get(activityNameB)
					)
					.map(([activityName, filterWorkers]) => (
						<ListGroup
							key={activityName}
							heading={activityName}
						>
							{filterWorkers
								.sort(
									(a, b) =>
										new Date(
											b.dateStatusChanged
										).getTime() -
										new Date(a.dateStatusChanged).getTime()
								)
								.map((w) => (
									<ListItem
										key={w.id}
										className='gap-8 grid grid-cols-[3fr_2fr_2fr_1fr_1.2fr_1.2fr_1fr] items-center inset-shadow-[0px_-1px_0px_0px_var(--border)]'
									>
										<Link
											to='/teams'
											search={{
												pane: 'worker',
												itemId: w.sid,
											}}
											className='flex items-center px-3 py-4 gap-1.5'
										>
											<ManageUserAvatar
												memberId={
													JSON.parse(
														JSON.stringify(
															w.attributes
														)
													).member_id
												}
											/>

											<div className='flex flex-col items-start'>
												<p>
													{
														(
															w.attributes as unknown as Record<
																string,
																any
															>
														).full_name
													}
												</p>

												<div className='flex items-center gap-1.5'>
													<ActivityListItem
														activityName={
															w.activityName
														}
													/>

													{/* <Separator
														orientation='vertical'
														className='data-[orientation=vertical]:h-2.5'
													/>

													<Timer
														stopwatchSettings={{
															offsetTimestamp:
																getDateOffset(
																	new Date(
																		w.dateStatusChanged
																	)
																),
															autoStart: true,
														}}
													/> */}
												</div>
											</div>
										</Link>

										<div
											className='rounded pattern-diagonal-lines pattern-primary pattern-bg-background
  pattern-size-2 pattern-opacity-15 w-full h-12 border border-primary'
										/>
									</ListItem>
								))}
						</ListGroup>
					))}
			</div>
			<SheetContent
				hideClose
				className='sm:max-w-[min(90%,1280px)] rounded-bl-4xl rounded-tl-4xl overflow-hidden'
			>
				{pane === 'worker' && itemId && (
					<Suspense
						fallback={
							<>
								<SheetHeader>
									<SheetTitle className='text-4xl font-medium'>
										<Skeleton className='h-9 w-3/4' />
									</SheetTitle>
									<SheetDescription asChild>
										<div className='flex items-center gap-1.5'>
											<ColoredBadge
												variant='purple'
												className='text-xl rounded-full'
											>
												<Circle className='stroke-0 fill-inherit' />
												<Skeleton className='h-4 w-24' />
											</ColoredBadge>
										</div>
									</SheetDescription>
								</SheetHeader>
							</>
						}
					>
						<WorkerPane
							workerSid={itemId}
							workerAttributes={{}}
						/>
					</Suspense>
				)}
			</SheetContent>
		</Sheet>
	);
}

const GroupedConversations = ({ data }: { data: WorkerConversation[] }) => {
	const table = useReactTable({
		columns,
		data,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<DataTableDisplay
			table={table}
			columns={columns}
		/>
	);
};
