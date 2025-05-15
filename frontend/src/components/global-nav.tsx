import ActivityListItem from '@/components/activity-list-item';
import { CurrentUserAvatar } from '@/components/current-user-avatar';
import GlobalSearch from '@/components/global-search';
import { SettingsDialog } from '@/components/settings-dialog';
import { ListSelector } from '@/components/status-selector';
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
import { createClient } from '@/lib/supabase/server';
import { getActivitiesQuery } from '@/lib/twilio/api';
import { useWorker } from '@/providers/worker-provider';
import type { Session } from '@supabase/supabase-js';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Bell, FilePen, History, LogOut, RefreshCcw, Settings } from 'lucide-react';
import type { WorkerInstance } from 'twilio/lib/rest/taskrouter/v1/workspace/worker';

type Props = {
	profile: Profile;
	session: Session;
	worker: WorkerInstance;
};

const GlobalNav = ({ profile, session, worker }: Props) => {
	const navigate = useNavigate();
	const [
		{ data: activities },
		{
			data: { data: reservations },
		},
		{ data: notifications },
	] = useSuspenseQueries({
		queries: [getActivitiesQuery(), getEngagementReservationsQuery(worker.sid), getNotificationsQuery()],
	});

	const { updateWorkerActivity, activity } = useWorker();

	return (
		<header className='sticky top-0 z-50 flex h-[var(--navbar-height)] w-full shrink-0 items-center gap-3 border-b bg-sidebar px-3 justify-between'>
			<div className='flex items-center gap-1.5'>
				<SidebarTrigger />

				<img
					src='/VeloLogo-Black.png'
					className='h-[16px] object-contain dark:hidden'
				/>

				<img
					src='/VeloLogo-White.png'
					className='h-[16px] object-contain hidden dark:block'
				/>
			</div>

			<GlobalSearch />

			<div className='flex items-center gap-3'>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							role='combobox'
							size='sm'
							variant='ghost'
							aria-label='History'
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
							itemView={(reservation) => <HistoryListItem reservation={reservation} />}
						/>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='outline'
							type='button'
						>
							<ActivityListItem activityName={activity ? activity.name : worker.activityName} />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						className='p-0'
						side='bottom'
						align='end'
					>
						<ListSelector
							items={activities ?? []}
							currentValue={
								activity
									? activities?.find((a) => a.sid === activity.sid)
									: activities?.find((a) => a.sid === worker.activitySid)
							}
							value={(activity) => activity.sid}
							onSelect={(activity) => updateWorkerActivity({ sid: activity.sid, options: {} })}
							itemView={(activity) => <ActivityListItem activityName={activity.friendlyName} />}
						/>
					</DropdownMenuContent>
				</DropdownMenu>

				<Suspense
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
				</Suspense>

				<Dialog>
					<AlertDialog>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='rounded-full'
								>
									<CurrentUserAvatar />
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
										<CurrentUserAvatar />

										<div className='grid flex-1 text-left text-sm leading-tight'>
											<span className='truncate font-semibold'>
												{profile?.first_name} {profile?.last_name}
											</span>
											<p className='text-xs text-muted-foreground'>{profile?.username}</p>
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
											navigate({ to: '/login' });
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
			</div>
		</header>
	);
};

export default GlobalNav;

import { relativeDay } from '@/utils/date';
import { Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing } from 'lucide-react';
import { formatDate, formatRelative } from 'date-fns';
import { getEngagementReservationsQuery, getNotificationsQuery } from '@/lib/supabase/api';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NotificationFeed from '@/components/notification-feed';
import { Suspense } from 'react';

type HistoryListItemProps = {
	reservation: EngagementReservation & {
		engagement?: Engagement;
	};
};

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
				<p className='w-full leading-6 font-medium text-sm'>{reservation.engagement?.contact?.id}</p>

				<p className='text-muted-foreground text-xs'>
					{relativeDay(new Date(reservation.created_at)) === 'today' ? (
						<p>
							{formatDate(new Date(reservation.created_at), 'h:mm aaa')}
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
							{formatDate(new Date(reservation.created_at), 'P, h:mm aaa')}
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
