import { SettingsDialog } from '@/components/settings-dialog';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { createClient } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { redirect, useNavigate } from '@tanstack/react-router';
import { Circle, History, LogOut, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import ManageUserAvatar from '@/components/avatar/manage-user-avatar';
import { createServerFn } from '@tanstack/react-start';
import type {
	WorkerContextUpdateOptions,
	WorkerInstance,
} from 'twilio/lib/rest/taskrouter/v1/workspace/worker';
import { relativeDay } from '@/utils/date';
import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing } from 'lucide-react';
import { formatDate } from 'date-fns';
import { ListSelector } from '@/components/list-selector';
import ActivityListItem from '@/components/activity-list-item';
import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQueries,
} from '@tanstack/react-query';
import { getActivitiesQuery, getWorkerQuery } from '@/lib/twilio/api';
import { updateWorker } from '@/lib/twilio/update';
import { getEngagementReservationsQuery } from '@/lib/supabase/api';
import useSyncClient from '@/hooks/use-sync-client';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import NumberFlow from '@number-flow/react';
import SearchButton from '@/components/search/search-button';

const logout = createServerFn().handler(async () => {
	const supabase = createClient();
	const { data, error } = await supabase.auth.getSession();
	console.log(data, error);
	await supabase.auth.signOut();
	throw redirect({ to: '/auth/login' });
});

interface Props {
	profile: Profile;
	session: Session;
	workerSid: string;
	accessToken: string;
}

const GlobalNav = ({ profile, session, workerSid, accessToken }: Props) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const workerQuery = getWorkerQuery(workerSid);
	const { queryKey: workerQueryKey } = workerQuery;

	const [
		{ data: activities },
		{ data: worker },
		{
			data: { data: reservations },
		},
	] = useSuspenseQueries({
		queries: [
			getActivitiesQuery(),
			workerQuery,
			getEngagementReservationsQuery(workerSid),
		],
	});

	const handleWorkerUpdate = useMutation({
		mutationFn: (options: WorkerContextUpdateOptions) =>
			updateWorker({ data: { workerSid, options } }),
		onMutate: async (options) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: workerQueryKey,
			});

			const previousData =
				queryClient.getQueryData<WorkerInstance>(workerQueryKey);

			if (!previousData) return;

			const activity = activities?.find(
				(a) => a.sid === options.activitySid
			);

			if (!activity) return;

			const newData = {
				...previousData,
				activitySid: activity.sid,
				activityName: activity.friendlyName,
			} as WorkerInstance;

			queryClient.setQueryData(workerQueryKey, newData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: workerQueryKey });
		},
	});

	return (
		<header className='sticky top-0 z-50 flex h-[var(--navbar-height)] w-full shrink-0 items-center gap-1.5 border-b bg-sidebar px-3'>
			<SidebarTrigger />

			<img
				src='/VeloLogo-Black.png'
				className='h-[16px] object-contain dark:hidden'
			/>

			<img
				src='/VeloLogo-White.png'
				className='h-[16px] object-contain hidden dark:block'
			/>

			<SearchButton className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' />

			<QueueStatus accessToken={accessToken} />

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						role='combobox'
						size='sm'
						variant='ghost'
						aria-label='History'
						className='data-[state=open]:bg-muted '
					>
						<History />
						<span className='sr-only'>History</span>
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					className='p-0'
					side='bottom'
					align='end'
				>
					<ListSelector
						items={reservations ?? []}
						// currentValue={activity}
						value={(reservation) => reservation.id}
						onSelect={(reservation) => {}}
						itemView={(reservation) => (
							<HistoryListItem reservation={reservation} />
						)}
					/>
				</DropdownMenuContent>
			</DropdownMenu>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='outline'
						type='button'
					>
						<ActivityListItem activityName={worker.activityName} />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent
					className='p-0'
					side='bottom'
					align='end'
				>
					<ListSelector
						items={activities ?? []}
						currentValue={activities?.find(
							(a) => a.sid === worker.activitySid
						)}
						value={(activity) => activity.sid}
						onSelect={(activity) =>
							handleWorkerUpdate.mutate({
								activitySid: activity.sid,
							})
						}
						itemView={(activity) => (
							<ActivityListItem
								activityName={activity.friendlyName}
							/>
						)}
					/>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* <Suspense
				fallback={
					<Button
						variant='ghost'
						size='icon'
						disabled
					>
						<Bell />
						<span className='sr-only'>Notifications</span>
					</Button>
				}
			>
			<NotificationFeed />
			</Suspense> */}

			<Dialog>
				<AlertDialog>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant='ghost'
								size='icon'
								className='rounded-md'
							>
								<ManageUserAvatar
									memberId={
										profile.system_member_id ?? undefined
									}
								/>
							</Button>
						</DropdownMenuTrigger>

						<DropdownMenuContent
							className='min-w-[--radix-dropdown-menu-trigger-width] rounded-lg'
							side='bottom'
							align='end'
							sideOffset={12}
						>
							<DropdownMenuLabel className='p-0 font-normal'>
								<div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
									<ManageUserAvatar
										memberId={
											profile.system_member_id ??
											undefined
										}
									/>

									<div className='grid flex-1 text-left text-sm leading-tight'>
										<span className='truncate font-semibold'>
											{profile?.first_name}{' '}
											{profile?.last_name}
										</span>
										<p className='text-xs text-muted-foreground'>
											{profile?.username}
										</p>
									</div>
								</div>
							</DropdownMenuLabel>

							<DropdownMenuSeparator />

							<DropdownMenuGroup>
								<DialogTrigger asChild>
									<DropdownMenuItem>
										<Settings className='mr-1.5' />
										<span>Settings</span>
									</DropdownMenuItem>
								</DialogTrigger>
							</DropdownMenuGroup>

							<DropdownMenuSeparator />

							<DropdownMenuGroup>
								<DropdownMenuItem
									onSelect={async () => {
										const supabase = createClient();
										await supabase.auth.signOut();
										navigate({ to: '/auth/login' });
									}}
								>
									<LogOut className='mr-1.5' />
									<span>Log out</span>
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>
				</AlertDialog>

				<SettingsDialog session={session as Session} />
			</Dialog>
		</header>
	);
};

export default GlobalNav;

interface HistoryListItemProps {
	reservation: EngagementReservation & {
		engagement?: Engagement;
	};
}

const HistoryListItem = ({ reservation }: HistoryListItemProps) => {
	console.log(reservation.reservation_status === 'canceled');
	// const { name } = generateCallerId(attributes);
	// const { worker } = useWorker();

	// const To = attributes.direction === Direction.Outbound ? attributes.outbound_to : attributes.from;

	// const { mutate, isPending } = useMutation({
	// 	mutationKey: ['createTask', To],
	// 	mutationFn: async (values: z.infer<typeof outboundPhoneSchema>) => {
	// 		// Do something with the form values.
	// 		// ✅ This will be type-safe and validated.
	// 		try {
	// 			const to = values.To;
	// 			const splitNumber: string[] = to.split(' ');
	// 			const areaCode = splitNumber?.[1];
	// 			const numberReturn = await lookupPhoneNumber(to);
	// 			await worker?.createTask(
	// 				parsePhoneNumber(to, 'US', 'E.164')?.formattedNumber ?? '',
	// 				numbers[areaCode as string] ?? env.VITE_TWILIO_PHONE_NUMBER,
	// 				env.VITE_TWILIO_WORKFLOW_SID!,
	// 				env.VITE_TWILIO_TASK_QUEUE_SID!,
	// 				{
	// 					attributes: {
	// 						direction: 'outbound',
	// 						name: numberReturn?.name,
	// 						companyId: numberReturn?.companyId,
	// 						userId: numberReturn?.userId,
	// 					},
	// 					taskChannelUniqueName: 'voice',
	// 				}
	// 			);
	// 		} catch (error) {
	// 			console.error(error);
	// 			toast.error(JSON.stringify(error));
	// 		}
	// 	},
	// });

	return (
		<div
			// value={`${reservation.id}-${reservation.engagement.contact?.name}-${reservation.engagement.attributes?.from}`}
			className='flex items-center gap-3 w-full -ml-[19.25px]'
		>
			{reservation.reservation_status === 'canceled' ? (
				<div className='text-destructive flex items-center gap-1.5 text-xs'>
					<PhoneMissed className='text-destructive' />
					<span className='sr-only'>Missed incoming</span>
				</div>
			) : (
				<div className='text-xs flex items-center gap-1.5'>
					{reservation.engagement?.is_inbound ? (
						<>
							<PhoneIncoming />
							<span className='sr-only'>Incoming</span>
						</>
					) : (
						<>
							<PhoneOutgoing />
							<span className='sr-only'>Outgoing</span>
						</>
					)}
				</div>
			)}

			<div className='w-full text-ellipsis text-nowrap line-clamp-2'>
				{/* @ts-ignore */}
				<p className='w-full leading-6 font-medium text-sm'>
					{reservation.engagement?.contact?.id}
				</p>

				<p className='text-muted-foreground text-xs'>
					{relativeDay(new Date(reservation.created_at)) ===
					'today' ? (
						<p>
							{formatDate(
								new Date(reservation.created_at),
								'h:mm aaa'
							)}
							<span className='text-muted-foreground'> - </span>
							{/* {formatDate(
								addSeconds(
									new Date(event.eventDate),
									Number(event.eventData.task_age as unknown as string)
								),
								'h:mm aaa'
							)} */}
						</p>
					) : (
						<p>
							{formatDate(
								new Date(reservation.created_at),
								'P, h:mm aaa'
							)}
							<span className='text-muted-foreground'> - </span>
							{/* {formatDate(
								addSeconds(
									new Date(reservation.created_at),
									Number(event.eventData.task_age as unknown as string)
								),
								'h:mm aaa'
							)} */}
						</p>
					)}
				</p>
			</div>

			<Button
				variant='outline'
				size='icon'
				className='flex-shrink-0'
				// disabled={isPending}
				// onClick={() => mutate({ To })}
			>
				<Phone />
			</Button>
		</div>
	);
};

interface QueueStatusDocument {
	calls_in_queue: number;
	status: 'red' | 'yellow' | 'green';
	voicemails_in_queue: number;
	workers_available: number;
}

const QueueStatus = ({ accessToken }: { accessToken: string }) => {
	const { client } = useSyncClient(accessToken);
	const [status, setStatus] = useState<QueueStatusDocument>({
		calls_in_queue: 0,
		status: 'red',
		voicemails_in_queue: 0,
		workers_available: 0,
	});

	const { data: document } = useQuery({
		queryKey: ['documents', 'Queue Status'],
		queryFn: async () => {
			const doc = await client?.document('Queue Status');

			if (!doc) throw new Error('Document not found');

			return doc;
		},
	});

	useEffect(() => {
		if (!document) return;

		setStatus(document.data as QueueStatusDocument);

		document.on('updated', ({ data }) => {
			console.log(data);
			setStatus(data);
		});

		return () => {
			document.close();
		};
	}, [document]);

	return (
		<div className='flex items-center space-x-0.5 ml-auto'>
			<div
				className={cn(
					'relative text-xs grid place-items-center text-muted-foreground h-5 px-3',
					status?.calls_in_queue && 'text-white'
				)}
			>
				<Progress
					value={status?.calls_in_queue > 0 ? 100 : 0}
					className={cn(
						'absolute left-0 top-0 -z-50 h-5',
						status?.calls_in_queue > 0 && 'animate-pulse'
					)}
					indicatorClassName='h-5'
				/>

				<p className='font-poppins font-semibold'>
					Calls:{' '}
					<NumberFlow
						className='font-poppins'
						value={status?.calls_in_queue}
					/>
				</p>
			</div>

			<div
				className={cn(
					'relative text-xs grid place-items-center text-muted-foreground h-5 px-3',
					status?.voicemails_in_queue > 0 && 'text-white'
				)}
			>
				<Progress
					value={status?.voicemails_in_queue > 0 ? 100 : 0}
					className={cn(
						'absolute left-0 top-0 -z-50 h-5',
						status?.voicemails_in_queue > 0 && 'animate-pulse'
					)}
					indicatorClassName={cn(
						'h-5',
						status?.voicemails_in_queue > 0 && 'bg-orange-500'
					)}
				/>

				<p className='font-poppins font-semibold'>
					Voicemails:{' '}
					<NumberFlow
						className='font-poppins'
						value={status?.voicemails_in_queue}
					/>
				</p>
			</div>

			<Circle
				className={cn(
					'stroke-white dark:stroke-black fill-red-500/15 rounded-full size-6',
					status?.status === 'red' && 'fill-red-500'
				)}
			/>
			<Circle
				className={cn(
					'stroke-white dark:stroke-black fill-yellow-400/15 rounded-full size-6',
					status?.status === 'yellow' && 'fill-yellow-500'
				)}
			/>
			<Circle
				className={cn(
					'stroke-white dark:stroke-black fill-green-500/15 rounded-full size-6',
					status?.status === 'green' && 'fill-green-500'
				)}
			/>
		</div>
	);
};
