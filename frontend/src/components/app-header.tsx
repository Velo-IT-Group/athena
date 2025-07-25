import ActivitySelector from '@/components/activity-selector';
import DevicePicker from '@/components/device-picker';
import { ListSelector } from '@/components/list-selector';
import TaskNotification from '@/components/task-notification';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { linksConfig } from '@/config/links';
import { useTwilio } from '@/contexts/twilio-provider';
import { getEngagementReservationsQuery } from '@/lib/supabase/api';
import { attributeIdentifier, voiceAttributesSchema } from '@/types/twilio';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	useLocation,
	useRouteContext,
	useRouter,
} from '@tanstack/react-router';
import {
	Ban,
	Ellipsis,
	Headset,
	History,
	Phone,
	PhoneIncoming,
	PhoneMissed,
	PhoneOutgoing,
} from 'lucide-react';

export function SiteHeader({
	title,
	hideVoice,
}: {
	title?: string;
	hideVoice?: boolean;
}) {
	const { identity, workerSid } = useRouteContext({ from: '/_authed' });
	const { activeEngagement } = useTwilio();
	const pathname = useLocation({ select: (l) => l.pathname });
	const router = useRouter();

	const allLinks = linksConfig.sidebarNav.flatMap((section) => section.items);

	const activeLink = allLinks.find((link) => {
		const resolvedLink = router.buildLocation(link);
		return link.to === '/'
			? pathname === '/'
			: pathname.startsWith(resolvedLink.pathname);
	});

	const { data } = useQuery(getEngagementReservationsQuery(workerSid));

	return (
		<header className='flex h-(--header-height) shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=offcanvas]/sidebar-wrapper:h-(--header-height) px-3 flex-[0_0_var(--header-height)] justify-between gap-2'>
			<div className='flex w-full items-center'>
				<SidebarTrigger className='group-has-data-[collapsible=offcanvas]/sidebar-wrapper:-ml-1 group-has-data-[collapsible=offcanvas]/sidebar-wrapper:flex hidden size-6 items-center justify-center shrink-0 p-0 m-0' />

				<div className='flex flex-row items-center justify-start gap-1 pl-1 overflow-visible group-has-data-[collapsible=offcanvas]/sidebar-wrapper:ml-2 ml-0'>
					{activeLink && activeLink.icon && (
						<activeLink.icon className='size-3.5' />
					)}

					<h1 className='truncate tracking-tight text-sm font-medium'>
						{activeLink?.title}
					</h1>

					{title && (
						<Separator
							orientation='vertical'
							className='data-[orientation=vertical]:h-2.5 bg-muted-foreground -skew-12'
						/>
					)}

					{title && (
						<div className='flex flex-[0_1_auto] flex-col items-center justify-start gap-1 overflow-hidden isolate'>
							{title}
						</div>
					)}
				</div>
			</div>

			<div className='overflow-visible shrink-0 flex items-center'>
				<div className='flex items-center justify-center gap-2'>
					{!hideVoice && (
						<div className='flex items-center justify-start'>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant='ghost'
										size='icon'
									>
										<Headset />
									</Button>
								</PopoverTrigger>

								<PopoverContent className='w-72'>
									<DevicePicker />
								</PopoverContent>
							</Popover>

							<TaskNotification engagement={activeEngagement} />

							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant='ghost'
										size='icon'
									>
										<History />
									</Button>
								</PopoverTrigger>

								<PopoverContent className='w-72 p-0'>
									<ListSelector
										items={data?.data ?? []}
										itemView={(reservation) => (
											<HistoryListItem
												key={reservation.id}
												reservation={reservation}
											/>
										)}
										value={(r) => r.id}
									/>
								</PopoverContent>
							</Popover>
						</div>
					)}

					<Separator
						orientation='vertical'
						className='data-[orientation=vertical]:h-3.5'
					/>

					{!hideVoice && (
						<div className='flex items-center justify-start'>
							<ActivitySelector />
						</div>
					)}

					<Separator
						orientation='vertical'
						className='data-[orientation=vertical]:h-3.5'
					/>

					<div>
						<Avatar className='size-5 bg-[#f97514] text-white rounded-full'>
							<AvatarFallback className='text-xs font-normal'>
								{identity?.charAt(0).toUpperCase() ?? 'U'}
							</AvatarFallback>
						</Avatar>
					</div>
				</div>
			</div>
		</header>
	);
}

const HistoryListItem = ({
	reservation,
}: {
	reservation: EngagementReservation & {
		engagement: Engagement;
	};
}) => {
	const { createEngagement } = useTwilio();

	const { data: attributes } = voiceAttributesSchema.safeParse(
		reservation?.engagement?.attributes
	);

	const blockedNumberMutation = useMutation({
		mutationKey: ['block-number'],
		mutationFn: async (number: string) => {
			const response = await fetch(
				'/rest/v1/taskrouter/blacklisted-phone-number',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ number }),
				}
			);
			if (!response.ok) {
				throw new Error('Failed to block number');
			}
			return response.json();
		},
	});

	return (
		<AlertDialog>
			{reservation.reservation_status?.includes('timeout') ? (
				<div className='text-destructive flex items-center gap-1.5 text-xs'>
					<PhoneMissed />
					<span className='sr-only'>Missed incoming</span>
				</div>
			) : (
				<div className='text-xs flex items-center gap-1.5'>
					{reservation?.engagement?.is_inbound ? (
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
				<p className='w-full leading-6 font-medium text-sm'>
					{
						voiceAttributesSchema.safeParse(
							reservation?.engagement?.attributes
						).data?.name
					}
				</p>

				<p className='text-muted-foreground text-xs'>
					{/* {relativeDay(new Date(event.eventDate)) === 'today' ? (
						<p>
							{formatDate(new Date(event.eventDate), 'h:mm aaa')}
							<span className='text-muted-foreground'> - </span>
							{formatDate(
								addSeconds(
									new Date(event.eventDate),
									Number(
										event.eventData
											.task_age as unknown as string
									)
								),
								'h:mm aaa'
							)}
						</p>
					) : (
						<p>
							{formatDate(
								new Date(event.eventDate),
								'P, h:mm aaa'
							)}
							<span className='text-muted-foreground'> - </span>
							{formatDate(
								addSeconds(
									new Date(event.eventDate),
									Number(
										event.eventData
											.task_age as unknown as string
									)
								),
								'h:mm aaa'
							)}
						</p>
					)} */}
				</p>
			</div>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant='ghostOutline'
						size='icon'
					>
						<Ellipsis />
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align='end'>
					<DropdownMenuItem asChild>
						<Button
							variant='ghost'
							className='flex-shrink-0 justify-start'
							disabled={createEngagement.isPending}
							onClick={() =>
								createEngagement.mutate({
									channel: 'voice',
									from:
										attributes?.direction === 'outbound'
											? attributes?.from
											: attributes?.to ?? '',
									to:
										attributes?.direction === 'outbound'
											? attributes?.outbound_to
											: attributes?.from ?? '',
									attributes: {
										...attributeIdentifier.parse(
											attributes
										),
										direction: 'outbound',
									},
								})
							}
						>
							<Phone />
							<span>Call</span>
						</Button>
					</DropdownMenuItem>

					<DropdownMenuItem asChild>
						<AlertDialogTrigger asChild>
							<Button
								variant='ghost'
								className='flex-shrink-0 justify-start focus:bg-destructive/5 focus:text-destructive'
							>
								<Ban />
								<span>Block</span>
							</Button>
						</AlertDialogTrigger>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Block number?</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to block{' '}
						{attributes?.direction === 'outbound'
							? attributes?.outbound_to
							: attributes?.from}
						? You will not receive any further calls from this
						number.
					</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button
							variant='destructive'
							onClick={() =>
								blockedNumberMutation.mutate(
									attributes?.direction === 'outbound'
										? attributes?.outbound_to
										: attributes?.from ?? ''
								)
							}
							disabled={blockedNumberMutation.isPending}
						>
							{blockedNumberMutation.isPending
								? 'Blocking...'
								: 'Block'}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
