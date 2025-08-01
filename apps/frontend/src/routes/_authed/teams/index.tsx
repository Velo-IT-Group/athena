import { createFileRoute, Link } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { Circle, Phone } from 'lucide-react';
import { Suspense, useMemo } from 'react';
import { z } from 'zod';
import { activityOrder } from '@/components/activity-list';
import ActivityListItem from '@/components/activity-list-item';
import Timer from '@/components/timer';
import { ColoredBadge } from '@/components/ui/badge';
import { ListGroup, ListItem } from '@/components/ui/list';
import { Separator } from '@/components/ui/separator';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import useSyncMap from '@/hooks/use-sync-map';
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

type ReservationSyncInstance = {
	sid: string;
	taskSid: string;
	reservationStatus: string;
	dateCreated: Date;
	dateUpdated: Date;
	taskAttributes: string;
	wrapUpTime?: Date;
};

type WorkerSyncInstance = {
	name: string;
	activity: string;
	dateActivityChanged: Date;
	reservations: ReservationSyncInstance[];
};

// export type WorkerConversation = WorkerInstance & {
// 	id: string;
// 	tasks: (TaskInstance & { id: string })[];
// };

function RouteComponent() {
	const { accessToken } = Route.useRouteContext();
	const { pane, itemId } = Route.useSearch();
	const navigate = Route.useNavigate();

	const { items: conversations } = useSyncMap({
		token: accessToken ?? '',
		mapKey: 'Sync Worker Reservations',
	});

	const groupedConversationsByWorker = useMemo(() => {
		return Object.groupBy(
			conversations,
			(w) => (w.data as WorkerSyncInstance).activity
		);
	}, [conversations]);

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

					<div className='flex items-center justify-start gap-1 overflow-hidden text-xs text-muted-foreground'></div>
				</div>

				{Object.entries(groupedConversationsByWorker)
					.sort(
						([activityNameA], [activityNameB]) =>
							activityOrder.get(activityNameA) -
							activityOrder.get(activityNameB)
					)
					.map(([activityName, filterWorkers]) => {
						return (
							<ListGroup
								key={activityName}
								heading={activityName}
							>
								{filterWorkers
									?.sort(
										(a, b) =>
											new Date(
												(
													b.data as WorkerSyncInstance
												).dateActivityChanged
											).getTime() -
											new Date(
												(
													a.data as WorkerSyncInstance
												).dateActivityChanged
											).getTime()
									)
									?.map((w) => {
										const worker =
											w.data as WorkerSyncInstance;
										return (
											<ListItem
												key={w.key}
												className='gap-8 grid grid-cols-[3fr_2fr_2fr_1fr_1.2fr_1.2fr_1fr] items-center inset-shadow-[0px_-1px_0px_0px_var(--border)]'
											>
												<Link
													to='/teams'
													search={{
														pane: 'worker',
														itemId: w.key,
													}}
													className='flex items-center px-3 py-4 gap-1.5'
												>
													<div className='flex flex-col items-start'>
														<p>{worker.name}</p>

														<div className='flex items-center gap-1.5'>
															<ActivityListItem
																activityName={
																	worker.activity
																}
															/>

															<Separator
																orientation='vertical'
																className='data-[orientation=vertical]:h-2.5'
															/>

															<Timer
																stopwatchSettings={{
																	offsetTimestamp:
																		getDateOffset(
																			new Date(
																				worker.dateActivityChanged
																			)
																		),
																	autoStart:
																		true,
																}}
															/>
														</div>
													</div>
												</Link>

												{worker.reservations.length >
												0 ? (
													<>
														{worker.reservations.map(
															(res) => (
																<ActiveCall
																	key={
																		res.sid
																	}
																	reservation={
																		res
																	}
																/>
															)
														)}
													</>
												) : (
													<div
														className='rounded pattern-diagonal-lines pattern-primary pattern-bg-background
		  pattern-size-2 pattern-opacity-15 w-full h-12 border border-primary'
													/>
												)}
											</ListItem>
										);
									})}
							</ListGroup>
						);
					})}
			</div>
			<SheetContent
				hideClose
				className='sm:max-w-[min(90%,1280px)] rounded-bl-4xl rounded-tl-4xl overflow-hidden'
			>
				{pane === 'worker' && itemId && (
					<Suspense
						fallback={
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
						}
					>
						{/* <WorkerPane
							workerSid={itemId}
							workerAttributes={{}}
						/> */}
					</Suspense>
				)}
			</SheetContent>
		</Sheet>
	);
}

function ActiveCall({ reservation }: { reservation: ReservationSyncInstance }) {
	// const isWrapping = task.assignmentStatus === 'wrapping';
	const parsedAttributes = JSON.parse(reservation.taskAttributes ?? '{}');

	return (
		<div
			// variant='outline'
			// size='lg'
			className='h-12 items-center gap-[1.125rem] w-56 border-primary justify-start px-4 border rounded-md flex'
		>
			{reservation.reservationStatus === 'wrapping' ? (
				<Phone className='rotate-[135deg]' />
			) : (
				<Phone />
			)}

			<div className='flex flex-col items-start'>
				<span className='text-xs'>{parsedAttributes.name}</span>

				<div className='flex text-xs text-muted-foreground'>
					<Timer
						stopwatchSettings={{
							offsetTimestamp: getDateOffset(
								reservation.wrapUpTime ??
									reservation.dateUpdated
							),
							autoStart: true,
						}}
						hideDays
						hideHours
					/>
					<span className=''>&nbsp;</span>|{' '}
					{/* {task.taskQueueFriendlyName} */}
				</div>
			</div>
		</div>
	);
}
