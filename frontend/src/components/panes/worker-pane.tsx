import Tiptap from '@/components/tip-tap';
import { Button } from '@/components/ui/button';
import {
	Check,
	ChevronsUpDown,
	Clock,
	Ellipsis,
	Loader2,
	Phone,
	PhoneIncoming,
	PhoneOutgoing,
	type LucideIcon,
} from 'lucide-react';

import {
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from '@/components/ui/sheet';

import { getTimeEntriesQuery } from '@/lib/manage/api';

interface Log {
	id: number | string;
	text: string;
	currentUser: string;
	contact: string;
	startDate: Date;
	endDate?: Date;
	icon: LucideIcon;
}

export const WorkerPane = ({
	// id,
	workerSid,
	workerAttributes,
}: {
	// id: number;
	workerSid: string;
	workerAttributes: Record<string, any>;
}) => {
	const todayStart = useMemo(() => startOfDay(new Date()), []);
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(workerAttributes.activitySid);

	const { mutate, isPending, variables } = useMutation({
		mutationFn: (value: string) =>
			updateWorker({
				data: { workerSid, options: { activitySid: value } },
			}),
		onSuccess(data, variables) {
			setOpen(false);
			setValue(variables);
		},
		onError(error) {
			console.error(error);
			// setValue(workerAttributes.activitySid);
		},
	});

	const { data: worker } = useSuspenseQuery(getWorkerQuery(workerSid));

	const attributes = JSON.parse(worker.attributes);
	const id = attributes.member_id ?? 310;

	const [
		{ data },
		{ data: conversationsData },
		{ data: activitiesData },
		{ data: workerStatsData },
	] = useSuspenseQueries({
		queries: [
			getTimeEntriesQuery({
				conditions: {
					'member/id': id,
				},
				orderBy: { key: 'dateEntered', order: 'desc' },
			}),
			getEngagementReservationsQuery(workerSid),
			getActivitiesQuery(),
			getWorkerStatsQuery(workerSid, { startDate: todayStart }),
		],
	});

	const conversations = conversationsData?.data;

	const todayConversations = conversations?.filter((c) => {
		const conversationDate = new Date(c.engagement.created_at);
		return (
			conversationDate >= todayStart &&
			conversationDate <= endOfDay(new Date())
		);
	});

	const totalTalkTime =
		todayConversations?.reduce(
			(accumulator, currentValue) => accumulator + 0,
			0
		) ?? 0;

	const hours = Math.floor(totalTalkTime / 3600);
	const minutes = Math.floor((totalTalkTime % 3600) / 60);

	const inboundConversations = todayConversations?.filter(
		(c) => c.engagement.is_inbound
	);
	const outboundConversations = todayConversations?.filter(
		(c) => !c.engagement.is_inbound
	);

	const logs: Log[] = [
		...(data && Array.isArray(data)
			? data
					?.filter((a) => a.ticket !== undefined)
					?.map(({ id, member, timeStart, timeEnd, ticket }) => ({
						id,
						currentUser: member.name,
						contact: `#${ticket?.id ?? ''} - ${ticket?.summary ?? ''}`,
						startDate: timeStart ? new Date(timeStart) : new Date(),
						endDate: timeEnd ? new Date(timeEnd) : undefined,
						text: 'saved a time entry to',
						icon: Clock,
					}))
			: []),
		...(conversations?.map(({ id, engagement }) => {
			const startDate = new Date(engagement.created_at);
			const endDate = new Date(
				startDate.getTime() +
					(engagement.attributes?.talk_time ?? 0) * 1000
			); // Add duration in milliseconds
			const isInbound = engagement.is_inbound;
			return {
				id,
				currentUser: engagement.attributes?.full_name ?? '',
				contact: engagement.contact?.name ?? '',
				startDate,
				endDate,
				text: isInbound ? 'talked to' : 'called',
				icon: isInbound ? PhoneIncoming : PhoneOutgoing,
			};
		}) ?? []),
	];

	const groupedLogs = Object.groupBy(
		logs.sort(
			(a, b) =>
				(b?.endDate?.getTime() ?? new Date().getTime()) -
				(a?.endDate?.getTime() ?? new Date().getTime())
		),
		({ startDate }) => {
			const newDate = new Date(startDate);
			return relativeDay(newDate);
		}
	);

	return (
		<>
			<SheetHeader className='flex flex-row items-center justify-start gap-3 space-y-0 h-16'>
				<ManageUserAvatar memberId={id} />

				<div className='space-y-1.5'>
					<div className='flex items-center gap-1.5'>
						<SheetTitle className='shrink-0'>
							{workerAttributes.full_name}
						</SheetTitle>

						<Popover
							open={open}
							onOpenChange={setOpen}
						>
							<PopoverTrigger asChild>
								<Button
									variant='outline'
									role='combobox'
									aria-expanded={open}
									className='w-[200px] justify-between'
								>
									{worker.activitySid ? (
										<ActivityListItem
											activityName={
												activitiesData?.find(
													(activity) =>
														activity.sid ===
														worker.activitySid
												)?.friendlyName ?? ''
											}
										/>
									) : (
										'Select activity...'
									)}
									{isPending ? (
										<Loader2 className='animate-spin' />
									) : (
										<ChevronsUpDown className='ml-1.5 shrink-0 opacity-50' />
									)}
								</Button>
							</PopoverTrigger>

							<PopoverContent className='w-[200px] p-0'>
								<ListSelector
									items={activitiesData}
									currentValue={activitiesData.find(
										(a) => a.sid === worker.activitySid
									)}
									itemView={(a) => (
										<ActivityListItem
											activityName={a.friendlyName}
										/>
									)}
									onSelect={(a) => {}}
									value={(a) => a.friendlyName}
								/>
							</PopoverContent>
						</Popover>
					</div>
					<SheetDescription>
						{workerAttributes.email}
					</SheetDescription>
				</div>
			</SheetHeader>

			<ScrollArea className='h-[calc(100vh-64px)] px-6'>
				<div className='space-y-3'>
					<div className='grid grid-cols-5 gap-3'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 p-3'>
								<CardTitle className='text-sm font-medium truncate'>
									Total Calls
								</CardTitle>

								<Phone className='text-muted-foreground' />
							</CardHeader>

							<CardContent className='pb-3 px-3'>
								<div className='text-2xl font-bold'>
									{todayConversations?.length ?? 0}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 p-3'>
								<CardTitle className='text-sm font-medium truncate'>
									Inbound Calls
								</CardTitle>

								<PhoneIncoming className='text-muted-foreground' />
							</CardHeader>

							<CardContent className='pb-3 px-3'>
								<div className='text-2xl font-bold'>
									{inboundConversations?.length ?? 0}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 p-3'>
								<CardTitle className='text-sm font-medium truncate'>
									Hours Available
								</CardTitle>

								<PhoneOutgoing className='text-muted-foreground' />
							</CardHeader>

							<CardContent className='pb-3 px-3'>
								<div className='text-2xl font-bold'>
									{Intl.NumberFormat('en-US', {
										style: 'unit',
										unit: 'hour',
										maximumFractionDigits: 1,
									}).format(
										((
											workerStatsData?.cumulative
												.activity_durations as ActivityDuration[]
										)?.find(
											(activity) =>
												activity.friendly_name ===
												'Available'
										)?.total ?? 0) / 3600
									)}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 p-3'>
								<CardTitle className='text-sm font-medium truncate'>
									Outbound Calls
								</CardTitle>

								<PhoneOutgoing className='text-muted-foreground' />
							</CardHeader>

							<CardContent className='pb-3 px-3'>
								<div className='text-2xl font-bold'>
									{outboundConversations?.length ?? 0}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2 p-3'>
								<CardTitle className='text-sm font-medium truncate'>
									Talk Time
								</CardTitle>

								<Clock className='text-muted-foreground' />
							</CardHeader>

							<CardContent className='pb-3 px-3'>
								<div className='text-2xl font-bold'>
									{hours}h {minutes}m
								</div>
							</CardContent>
						</Card>
					</div>

					<div className='space-y-6 px-3'>
						{/* <p className='text-muted-foreground text-sm'>Activity Logs</p> */}

						<div className='space-y-3'>
							{Object?.entries(groupedLogs).map(
								([key, logGroup]) => (
									<div key={key}>
										<h2 className='font-medium font-poppins text-base mb-3 capitalize'>
											{key}
										</h2>

										{logGroup?.map((log) => (
											<div
												key={`log-${log.id}`}
												className='group px-1.5 flex items-start gap-3'
											>
												<div className='flex flex-col justify-center items-center'>
													<Avatar className='h-9 w-9'>
														<AvatarFallback className='uppercase'>
															{/* <Icon  /> */}
															<log.icon />
														</AvatarFallback>
													</Avatar>

													<Separator
														orientation='vertical'
														className='min-h-9 w-[2px] group-last:hidden'
													/>
												</div>

												<div className='space-y-1.5'>
													<p>
														<span className='font-medium'>
															{log.currentUser}
														</span>
														<span className='text-muted-foreground text-sm'>
															{' '}
															{log.text}{' '}
														</span>
														<span className='font-medium'>
															{log.contact}
														</span>
													</p>

													<p className='text-xs text-muted-foreground'>
														{log.endDate &&
														log.startDate ? (
															formatDate({
																timeStyle:
																	'short',
															}).formatRange(
																log.startDate,
																log.endDate
															)
														) : (
															<>
																{Intl.DateTimeFormat(
																	'en-US',
																	{
																		timeStyle:
																			'short',
																	}
																).format(
																	log.startDate
																)}{' '}
																- Current
															</>
														)}
													</p>
												</div>
											</div>
										))}
									</div>
								)
							)}
						</div>
					</div>
				</div>
			</ScrollArea>
		</>
	);
};

export function PropertySection({ children }: { children: React.ReactNode }) {
	return (
		<div className='border-b py-3 first:pt-0 last:pb-0 last:border-b-0 -ml-3 space-y-1.5'>
			{children}
		</div>
	);
}

export function PropertyGroup({
	title,
	children,
}: {
	title: string | React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className='border rounded-md p-3'>
			<h4>{title}</h4>
			{children}
		</div>
	);
}

import ManageUserAvatar from '@/components/avatar/manage-user-avatar';
import type { ServiceTicketNote } from '@/types/manage';
import {
	DropdownMenu,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	useMutation,
	useSuspenseQueries,
	useSuspenseQuery,
} from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { getEngagementReservationsQuery } from '@/lib/supabase/api';
import {
	getActivitiesQuery,
	getWorkerQuery,
	getWorkerStatsQuery,
} from '@/lib/twilio/api';
import { useMemo, useState } from 'react';
import { endOfDay, startOfDay } from 'date-fns';
import { formatDate, relativeDay } from '@/utils/date';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { updateWorker } from '@/lib/twilio/update';
import ActivityListItem from '@/components/activity-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActivityDuration } from '@/types/twilio';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ListSelector } from '@/components/list-selector';

export function InitalNote({ note }: { note?: ServiceTicketNote }) {
	return (
		<div>
			<div
				className='Box-sc-g0xbh4-0 gRssIw'
				style={{ gap: '16px', display: 'flex' }}
			>
				<a
					className='Avatar-module__avatarLink--S36bm Avatar-module__avatarOuter--MZJZH prc-Link-Link-85e08'
					aria-label="@github-product-roadmap's profile"
					href='https://github.com/github-product-roadmap'
					style={{
						display: 'none',
						cursor: 'pointer',
						height: '100%',
					}}
				>
					<img
						className='Avatar-module__issueViewerAvatar--grA_h prc-Avatar-Avatar-ZRS-m'
						height={40}
						width={40}
						alt='@github-product-roadmap'
						src='https://avatars.githubusercontent.com/u/67656570?u=71034939d8d88be6d9b9068038dfdc8158fa69c0&v=4&size=80'
						style={{ flexShrink: 0 }}
					/>
				</a>
				<div
					className='Box-sc-g0xbh4-0 bDlPR react-issue-body'
					style={{
						MozBoxFlex: '1',
						flexGrow: 1,
						minWidth: '0px',
						order: 0,
					}}
				>
					<h2
						className='sr-only'
						style={{
							padding: '0px',
							overflow: 'hidden',
							border: '0px',
							position: 'absolute',
							width: '1px',
							height: '1px',
							clipPath: 'rect(0px 0px 0px 0px)',
							overflowWrap: 'normal',
						}}
					>
						Description
					</h2>
					<div
						className='Box-sc-g0xbh4-0 crMLA-D'
						style={{
							gap: '8px',
							display: 'flex',
							flexDirection: 'row',
						}}
					>
						<div
							className='rounded-md'
							style={{
								borderWidth: '1px',
								borderStyle: 'solid',
								borderImage: 'none',
								borderColor:
									'var(--borderColor-default,var(--color-border-default,#d0d7de))',
								MozBoxFlex: '1',
								flexGrow: 1,
								width: '100%',
								minWidth: '0px',
							}}
						>
							<div
								className='bg-primary/10 p-1.5 pl-3'
								style={{
									flexFlow: 'wrap',
									flex: '1 1 0%',
									// padding: '4px 4px 4px 16px',
									overflow: 'hidden',
									// backgroundColor: 'var(--bgColor-muted,var(--color-canvas-subtle,#f6f8fa))',
									borderTopLeftRadius: '6px',
									borderTopRightRadius: '6px',
									borderBottomWidth: '1px',
									borderBottomStyle: 'solid',
									borderBottomColor:
										'var(--borderColor-muted,var(--color-border-muted,hsla(210,18%,87%,1)))',
									color: 'var(--fgColor-muted,var(--color-fg-muted,#57606a))',
									display: 'flex',
									fontSize: '14px',
									MozBoxPack: 'justify',
									justifyContent: 'space-between',
									MozBoxAlign: 'center',
									alignItems: 'center',
								}}
							>
								<div
									className='Box-sc-g0xbh4-0 fnEhwD ActivityHeader-module__activityHeader--Flalv'
									style={{
										display: 'grid',
										gridTemplateAreas:
											'"avatar title title title badges actions" "avatar footer footer footer footer edits"',
										gridTemplateColumns:
											'auto 1fr auto auto auto auto',
										width: '100%',
										minWidth: '0px',
										minHeight:
											'var(--control-small-size,28px)',
										MozBoxPack: 'justify',
										justifyContent: 'space-between',
										MozBoxAlign: 'stretch',
										alignItems: 'stretch',
										paddingBottom: '0px',
									}}
								>
									<div
										className='Box-sc-g0xbh4-0 iKiGfw Avatar-module__avatarInner--rVuJD'
										style={{
											placeSelf: 'center',
											gridArea: 'avatar',
											marginRight: '8px',
											display: 'flex',
										}}
									>
										<a
											className='Avatar-module__avatarLink--S36bm prc-Link-Link-85e08'
											aria-label="@github-product-roadmap's profile"
											href='https://github.com/github-product-roadmap'
											style={{
												cursor: 'pointer',
												height: '100%',
											}}
										>
											<img
												className='prc-Avatar-Avatar-ZRS-m'
												height={24}
												width={24}
												alt='@github-product-roadmap'
												src='https://avatars.githubusercontent.com/u/67656570?u=71034939d8d88be6d9b9068038dfdc8158fa69c0&v=4&size=48'
											/>
										</a>
									</div>
									<div
										className='Box-sc-g0xbh4-0 koxHLL ActivityHeader-module__narrowViewportWrapper--Hjl75'
										style={{
											display: 'flex',
											gridColumn: 'title / badges',
											minWidth: '0px',
											flexWrap: 'wrap',
											MozBoxAlign: 'center',
											alignItems: 'center',
											flexShrink: 1,
											flexBasis: 'auto',
											columnGap: '0.45ch',
											paddingTop: '4px',
											paddingBottom: '4px',
										}}
									>
										<div
											className='Box-sc-g0xbh4-0 dqmClk'
											style={{
												gridArea: 'title',
												overflow: 'hidden',
												marginTop: '0px',
												MozBoxAlign: 'center',
												alignItems: 'center',
												display: 'flex',
												flexShrink: 1,
												flexBasis: 'auto',
											}}
										>
											<a
												className='Box-sc-g0xbh4-0 Iynuz prc-Link-Link-85e08'
												href='https://github.com/github-product-roadmap'
												style={{
													gridArea: 'login',
													overflow: 'hidden',
													whiteSpace: 'nowrap',
													color: 'var(--fgColor-default,var(--color-fg-default,#24292f))',
													fontWeight: 500,
													flexShrink: 1,
													textOverflow: 'ellipsis',
													alignSelf: 'flex-end',
												}}
											>
												github-product-roadmap
											</a>
										</div>
										<div
											className='Box-sc-g0xbh4-0 bJQcYY ActivityHeader-module__footer--FVHp7'
											style={{
												fontSize:
													'var(--text-body-size-small,12px)',
												gridArea: 'footer',
												lineHeight: 1.4,
												paddingBottom: '0px',
											}}
										>
											<span>opened </span>
											<a
												className='Box-sc-g0xbh4-0 dEDevN prc-Link-Link-85e08'
												href='https://github.com/github/roadmap/issues/928#issue-2159789196'
												style={{
													color: 'var(--fgColor-muted,var(--color-fg-muted,#57606a))',
												}}
											>
												on Feb 28, 2024
											</a>
											<span
												className='MarkdownLastEditedBy-module__container--fKxHN'
												style={{
													overflow: 'hidden',
													color: '#59636e',
													fontSize: '0.875rem',
												}}
											>
												<span> · </span>
												<span>
													edited by{' '}
													<a
														className='Box-sc-g0xbh4-0 dEDevN prc-Link-Link-85e08'
														href='https://github.com/github-product-roadmap'
														style={{
															color: 'var(--fgColor-muted,var(--color-fg-muted,#57606a))',
														}}
													>
														github-product-roadmap
													</a>
												</span>
											</span>
										</div>
									</div>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant='ghost'
												size='icon'
												className='hover:bg-primary/15 hover:text-primary'
											>
												<Ellipsis />
											</Button>
										</DropdownMenuTrigger>
									</DropdownMenu>
								</div>
							</div>

							<Tiptap
								content={note?.text ?? ''}
								editorClassName='py-0'
								className='py-0'
								editable={false}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
