import React, { useEffect, useMemo, useState } from 'react';
import { useTimer } from 'react-timer-hook';

import { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import NumberFlow from '@number-flow/react';
import { cn } from '@/lib/utils';
import useSyncMap from '@/hooks/use-sync-map';
import { WorkerSyncItem } from '@/types/twilio';

import { SidebarGroup, SidebarGroupContent, SidebarMenu } from '@/components/ui/sidebar';
import { Progress } from '@/components/ui/progress';

import { useTwilio } from '@/providers/twilio-provider';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { getActivities } from '@/lib/twilio/taskrouter/worker/helpers';
import ActivityListItem from '@/components/activity-list-item';
import ActivityList from '@/components/activity-list';
import ActivityItem from '@/components/worker-sidebar/activity-item';
import type { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';
import { getActivitiesQuery } from '@/lib/twilio/api';

const QueueStatus = ({ token }: { token: string }) => {
	const { data: activities } = useQuery(getActivitiesQuery());

	const [state, setState] = useState<'red' | 'yellow' | 'green' | undefined>();
	const [trackingTask, setTrackingTask] = useState<TaskInstance | null>(null);

	const { items } = useSyncMap({ token, mapKey: 'SyncTaskRouterTasks' });
	const { items: allWorkers } = useSyncMap({ token, mapKey: 'SyncTaskRouterWorkers' });
	const { toggleDiscoBall } = useTwilio();

	const { start, isRunning, restart } = useTimer({
		autoStart: false,
		expiryTimestamp: new Date(Date.now() + 1000 * 18),
		onExpire() {
			toggleDiscoBall();
		},
	});

	const workers = useMemo(
		() => allWorkers?.filter((w) => (w.data as WorkerSyncItem).activityName === 'Available'),
		[allWorkers]
	);

	const callCount = useMemo(
		() =>
			items.filter((item) => {
				const data = item.data as TaskInstance;
				const attributes = JSON.parse(data?.attributes ?? '{}');
				return (
					(!!!attributes.taskType || attributes.taskType !== 'voicemail') &&
					!['assigned', 'wrapping'].includes(data.assignmentStatus) &&
					attributes.direction === 'inbound'
				);
			}).length,
		[items]
	);

	const voicemailCount = useMemo(
		() =>
			items.filter((item) => {
				const data = item.data as TaskInstance;
				const attributes = JSON.parse(data?.attributes ?? '{}');
				return attributes.taskType === 'voicemail' && !!!attributes.worker_sid;
			}).length,
		[items]
	);

	const workersOnActiveCalls = useMemo(
		() =>
			new Set(
				items
					.filter((item) => {
						const data = item.data as TaskInstance;
						const attributes = JSON.parse(data?.attributes ?? '{}');
						return workers?.some((w) => (w.data as WorkerSyncItem).sid === attributes.worker_sid);
					})
					.map((item) => {
						const data = item.data as TaskInstance;
						const attributes = JSON.parse(data?.attributes ?? '{}');
						return attributes.worker_sid;
					})
			),
		[items, workers]
	);

	useEffect(() => {
		if (!workers || !items) {
			setState(undefined);
			restart(new Date(Date.now() + 1000 * 18), false);
			setTrackingTask(null);
			return;
		}
		const availableWorkersNotOnCalls = (workers?.length ?? 0) - workersOnActiveCalls.size;

		const sortedItems = items?.sort((a, b) => (a.data as TaskInstance).age - (b.data as TaskInstance).age);
		if (callCount > 0 && (sortedItems?.[0].data as TaskInstance).sid !== trackingTask?.sid && !isRunning) {
			restart(new Date(Date.now() + 1000 * (18 - (sortedItems[0].data as TaskInstance).age)), true);
			setTrackingTask(sortedItems[0].data as TaskInstance);
		}

		if (callCount === 0 && isRunning) {
			restart(new Date(Date.now() + 1000 * 18), false);
			setTrackingTask(null);
		}

		setState(availableWorkersNotOnCalls === 0 ? 'red' : availableWorkersNotOnCalls < 2 ? 'yellow' : 'green');
	}, [workers, items, workersOnActiveCalls.size, start, isRunning, restart, trackingTask, callCount]);

	return (
		<>
			<Popover>
				<PopoverTrigger asChild>
					<Button
						variant='ghost'
						className='grid grid-cols-3 gap-3'
					>
						<div
							className={cn(
								'bg-red-500 w-full min-h-3 opacity-10 dark:opacity-15 rounded-full size-5',
								state === 'red' && 'opacity-100 dark:opacity-100'
							)}
						/>
						<div
							className={cn(
								'bg-yellow-300 w-full min-h-3 opacity-20 dark:opacity-15 rounded-full size-5',
								state === 'yellow' && 'opacity-100 dark:opacity-100'
							)}
						/>
						<div
							className={cn(
								'bg-green-600 w-full min-h-3 opacity-10 dark:opacity-15 rounded-full size-5',
								state === 'green' && 'opacity-100 dark:opacity-100'
							)}
						/>
					</Button>
				</PopoverTrigger>

				<PopoverContent className='w-fit max-h-96 overflow-y-auto'>
					<Tabs>
						<TabsList>
							{activities?.map((activity) => (
								<TabsTrigger
									key={activity.sid}
									value={activity.sid}
								>
									<ActivityListItem activityName={activity.friendlyName} />
									{/* {activity.friendlyName} */}
								</TabsTrigger>
							))}
						</TabsList>

						{activities?.map((activity) => (
							<TabsContent
								key={activity.sid}
								value={activity.sid}
							>
								{workers
									.filter((w) => (w.data as WorkerInstance).activityName === activity.friendlyName)
									.map((w) => {
										const workerAttributes = (w.data as WorkerInstance).attributes;
										return (
											<div className='flex items-center gap-1.5 text-nowrap'>
												{/* <UserAvatar
                                full_name={workerAttributes?.full_name ?? ''}
                                // blob={data}
                            /> */}

												<p>{workerAttributes?.full_name}</p>

												{/* <p className='ml-auto text-xs'>
													{currentDateInSeconds - secondsInActivity < 43200 ? (
														<>
															since{' '}
															{formatDate({
																timeStyle: 'short',
															}).format(new Date(worker.dateStatusChanged))}
														</>
													) : (
														<>{relativeDate(new Date(worker.dateStatusChanged))}</>
													)}
												</p> */}
											</div>
											// <div key={(w.data as WorkerInstance).sid}>
											// 	{(w.data as WorkerInstance).friendlyName}
											// </div>
										);
									})}
								{/* {activity.friendlyName} */}
							</TabsContent>
						))}
					</Tabs>
				</PopoverContent>
			</Popover>

			<div className='grid place-items-center'>
				<div className='grid grid-cols-2 gap-1.5 w-full'>
					<div
						className={cn(
							'relative text-xs grid place-items-center text-muted-foreground h-5',
							callCount > 0 && 'text-white'
						)}
					>
						<Progress
							value={callCount > 0 ? 100 : 0}
							className={cn('absolute left-0 top-0 -z-50 h-5', callCount > 0 && 'animate-pulse')}
							indicatorClassName='h-5'
						/>

						<p className='font-semibold'>
							Calls: <NumberFlow value={callCount} />
						</p>
					</div>

					<div
						className={cn(
							'relative text-xs grid place-items-center text-muted-foreground h-5 px-1.5',
							voicemailCount > 0 && 'text-white'
						)}
					>
						<Progress
							value={voicemailCount > 0 ? 100 : 0}
							className={cn('absolute left-0 top-0 -z-50 h-5', voicemailCount > 0 && 'animate-pulse')}
							indicatorClassName={cn('h-5', voicemailCount > 0 && 'bg-orange-500')}
						/>

						<p className='font-semibold'>
							Voicemails: <NumberFlow value={voicemailCount} />
						</p>
					</div>
				</div>
			</div>
		</>
		// <SidebarGroup>
		// 	<SidebarGroupContent>
		// 		<SidebarMenu>
		// 			<div className='grid grid-cols-3 gap-1.5'>
		// 				<div
		// 					className={cn(
		// 						'bg-red-500 w-full min-h-3 opacity-10 dark:opacity-15 rounded-full',
		// 						state === 'red' && 'opacity-100 dark:opacity-100'
		// 					)}
		// 				/>
		// 				<div
		// 					className={cn(
		// 						'bg-yellow-300 w-full min-h-3 opacity-20 dark:opacity-15 rounded-full',
		// 						state === 'yellow' && 'opacity-100 dark:opacity-100'
		// 					)}
		// 				/>
		// 				<div
		// 					className={cn(
		// 						'bg-green-600 w-full min-h-3 opacity-10 dark:opacity-15 rounded-full',
		// 						state === 'green' && 'opacity-100 dark:opacity-100'
		// 					)}
		// 				/>
		// 			</div>

		// 			<div className='grid place-items-center mt-1.5'>
		// 				<p className='font-medium'>Queue Status</p>

		// 				<div className='grid grid-cols-2 gap-1.5 w-full mt-1.5'>
		// 					<div
		// 						className={cn(
		// 							'relative text-xs grid place-items-center text-muted-foreground h-5',
		// 							callCount > 0 && 'text-white'
		// 						)}
		// 					>
		// 						<Progress
		// 							value={callCount > 0 ? 100 : 0}
		// 							className={cn('absolute left-0 top-0 -z-50 h-5', callCount > 0 && 'animate-pulse')}
		// 							indicatorClassName='h-5'
		// 						/>

		// 						<p className='font-semibold'>
		// 							Calls: <NumberFlow value={callCount} />
		// 						</p>
		// 					</div>

		// 					<div
		// 						className={cn(
		// 							'relative text-xs grid place-items-center text-muted-foreground h-5',
		// 							voicemailCount > 0 && 'text-white'
		// 						)}
		// 					>
		// 						<Progress
		// 							value={voicemailCount > 0 ? 100 : 0}
		// 							className={cn(
		// 								'absolute left-0 top-0 -z-50 h-5',
		// 								voicemailCount > 0 && 'animate-pulse'
		// 							)}
		// 							indicatorClassName={cn('h-5', voicemailCount > 0 && 'bg-orange-500')}
		// 						/>

		// 						<p className='font-semibold'>
		// 							Voicemails: <NumberFlow value={voicemailCount} />
		// 						</p>
		// 					</div>
		// 				</div>
		// 			</div>
		// 		</SidebarMenu>
		// 	</SidebarGroupContent>
		// </SidebarGroup>
	);
};

export default QueueStatus;
