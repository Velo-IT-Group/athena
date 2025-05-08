import { ChevronDown, Circle, PhoneIncoming, PhoneOutgoing, Voicemail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SyncMapItem } from 'twilio-sync';
import { TaskInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/task';
import { formatDate, getDateOffset, relativeDate } from '@/utils/date';
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import useSyncMap from '@/hooks/use-sync-map';
import type { ActivityInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/activity';
import type { WorkerSyncItem } from '@/types/twilio';

type Props = {
	token: string;
	activity: ActivityInstance;
	conversations: SyncMapItem[];
	workers: SyncMapItem[];
};

const activityColors: Map<string, string> = new Map();
activityColors.set('Available', 'bg-green-500');
activityColors.set('Unavailable', 'bg-red-500');
activityColors.set('Offline', 'bg-slate-500');
activityColors.set('Break', 'bg-purple-500');
activityColors.set('On-Site', 'bg-yellow-500');

const ActivityItem = ({ token, activity, conversations, workers }: Props) => {
	// const { items: conversations } = useSyncMap({
	// 	token,
	// 	mapKey: 'SyncTaskRouterTasks',
	// });
	// const { items: workers } = useSyncMap({
	// 	token,
	// 	mapKey: 'SyncTaskRouterWorkers',
	// });

	return (
		<Collapsible className='group/collapsible'>
			<SidebarGroup>
				<SidebarGroupContent>
					<CollapsibleTrigger asChild>
						<SidebarMenuButton className='[&>svg]:size-3.5'>
							<div className='flex items-center gap-1.5'>
								<Circle
									className={cn(
										'rounded-full stroke-white dark:stroke-black',
										activityColors.get(activity.friendlyName),
										'className'
									)}
								/>

								<span>{activity.friendlyName}</span>
							</div>
							<ChevronDown className='ml-auto transition-transform group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-180' />
						</SidebarMenuButton>
					</CollapsibleTrigger>

					<CollapsibleContent>
						<SidebarMenu>
							{workers
								?.filter(
									(w) =>
										(w.data as WorkerSyncItem).activityName === activity.friendlyName &&
										(w.data as WorkerSyncItem).attributes.active
								)
								.map(({ key, data }) => {
									const worker = data as WorkerSyncItem;

									const workerConversations =
										conversations?.filter((conversation) => {
											const data = conversation.data as TaskInstance;
											const attributes = JSON.parse(data?.attributes ?? '{}');
											return attributes.worker_sid === worker.sid;
										}) ?? [];

									return (
										<ActivityListItem
											key={key}
											conversations={workerConversations}
											worker={worker}
										/>
									);
								})}
						</SidebarMenu>
					</CollapsibleContent>
				</SidebarGroupContent>
			</SidebarGroup>
		</Collapsible>
	);
};

type ActivityListItemProps = {
	key: string;
	worker: WorkerSyncItem;
	conversations: SyncMapItem[];
};

const ActivityListItem = ({ worker, conversations }: ActivityListItemProps) => {
	const workerAttributes = worker.attributes;
	const secondsInActivity = new Date(worker.dateStatusChanged).getTime() / 1000;
	const currentDateInSeconds = new Date().getTime() / 1000;

	return (
		<Dialog>
			<SidebarMenuItem>
				<DialogTrigger asChild>
					<SidebarMenuButton className='grid h-auto gap-1.5 p-1.5 pr-3 hover:cursor-pointer'>
						<div className='flex items-center gap-1.5 text-nowrap'>
							{/* <UserAvatar
                                full_name={workerAttributes?.full_name ?? ''}
                                // blob={data}
                            /> */}

							<p>{workerAttributes?.full_name}</p>

							<p className='ml-auto text-xs'>
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
							</p>
						</div>

						{conversations && conversations?.length > 0 && (
							<SidebarMenuSub className='mr-0 px-0'>
								{conversations?.map((conversation) => {
									const task = conversation.data as TaskInstance;
									return (
										<TaskListItem
											key={`${worker.sid}-${conversation.key}`}
											task={task}
										/>
									);
								})}
							</SidebarMenuSub>
						)}
					</SidebarMenuButton>
				</DialogTrigger>
			</SidebarMenuItem>

			{/* <WorkerDialog
                worker={worker}
                workerAttributes={workerAttributes}
                items={conversations}
            /> */}
		</Dialog>
	);
};

const TaskListItem = ({ task }: { task: TaskInstance }) => {
	const attributes = JSON.parse(task?.attributes ?? '{}');
	const offsetTimestamp = getDateOffset(task.dateUpdated ? new Date(task.dateUpdated) : new Date());

	return (
		<SidebarMenuSubButton className='flex h-auto w-full items-center gap-3 border-b pb-1.5 text-xs last:border-b-0 last:pb-0 [&>svg]:size-4'>
			{attributes.taskType === 'voicemail' && <Voicemail />}
			{attributes.taskType !== 'voicemail' && attributes.direction === 'outbound' ? (
				<PhoneOutgoing />
			) : (
				<PhoneIncoming />
			)}

			<div>
				<p className='font-medium text-nowrap text-ellipsis'>{attributes.name ?? attributes.outbound_to}</p>

				<div className='flex items-center gap-1.5 text-muted-foreground'>
					{task.assignmentStatus === 'wrapping' && <p className='capitalize'>{task.assignmentStatus} | </p>}

					{/* <Timer
                        stopwatchSettings={{
                            autoStart: true,
                            offsetTimestamp,
                        }}
                    /> */}
				</div>
			</div>
		</SidebarMenuSubButton>
	);
};

export default ActivityItem;
