import {
	useInfiniteQuery,
	useQueries,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query';
import {
	createFileRoute,
	Link,
	type UseNavigateResult,
} from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { enUS } from 'date-fns/locale/en-US';
import {
	Building,
	Calendar,
	Calendar1,
	Headset,
	PauseCircle,
	Phone,
	PhoneIncoming,
	PhoneMissed,
	PhoneOutgoing,
	PlayCircle,
	Smartphone,
	User,
	Voicemail,
} from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import {
	getEngagementSummaryByPeriodQuery,
	getEngagementsQuery,
} from '@/lib/supabase/api';
import { cn, filterSchema, paginationSchema, sortSchema } from '@/lib/utils';

export const Route = createFileRoute('/_authed/engagements/')({
	component: RouteComponent,
	validateSearch: zodValidator(
		z.object({
			filter: filterSchema.optional(),
			sort: sortSchema.optional(),
			pagination: paginationSchema.optional(),
			live: z.boolean().optional(),
		})
	),
});

const formatRelativeLocale: Record<FormatRelativeToken, string> = {
	lastWeek: "'Last' eeee",
	yesterday: "'Yesterday'",
	today: "'Today'",
	tomorrow: "'Tomorrow'",
	nextWeek: "'Next' eeee",
	other: 'MMM dd',
};

function RouteComponent() {
	const { filter, live: _live, sort, pagination } = Route.useSearch();
	const navigate = Route.useNavigate();

	const [live, setLive] = useState(_live);

	const startDate = filter?.find(
		(f) =>
			f.id === 'created_at' &&
			f.value.operator === 'greater_than_or_equal_to'
	)?.value?.values;
	const endDate = filter?.find(
		(f) =>
			f.id === 'created_at' &&
			f.value.operator === 'less_than_or_equal_to'
	)?.value?.values;
	const inSla = filter?.find((f) => f.id === 'within_sla_hours')?.value
		?.values?.[0];

	const call_date =
		startDate && endDate
			? [startOfDay(new Date(startDate)), endOfDay(new Date(endDate))]
			: startOfDay(new Date());

	const queryFilter: EngagementQueryOptions = {
		call_date,
		in_business_hours: inSla,
	};

	const engagementQuery = getEngagementsQuery(
		queryFilter,
		{
			direction: 'desc',
			field: 'created_at',
		}
		// { pageSize: 1000, page: 0 }
	);

	const { data } = useQuery(engagementQuery);

	const dateFormatter = new Intl.DateTimeFormat('en-US', {
		dateStyle: 'medium',
	});

	const {
		data: engagments,
		fetchNextPage,
		fetchPreviousPage,
		isLoading,
	} = useInfiniteQuery({
		queryKey: [
			'my-key',
			// any other keys, e.g. for search params filters
		],
		queryFn: async ({ pageParam }) => {
			const { cursor, direction } = pageParam;
			const res = await fetch(
				`/rest/v1/engagements?cursor=${cursor}&direction=${direction}`
			);
			const json: ReturnType<NestedEngagement> = await res.json();
			// For direction "next": { data: [...], nextCursor: 1741526294, prevCursor: null }
			// For direction "prev": { data: [...], nextCursor: null, prevCursor: 1741526295 }
			return json;
		},
		// Initialize with current timestamp and get the most recent data in the past
		initialPageParam: {
			cursor: new Date().toISOString(),
			direction: 'next',
		},
		// Function to fetch newer data
		getPreviousPageParam: (firstPage, allPages) => {
			if (!firstPage.prevCursor) return null;
			return { cursor: firstPage.prevCursor, direction: 'prev' };
		},
		// Function to fetch older data
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage.nextCursor) return null;
			return { cursor: lastPage.nextCursor, direction: 'next' };
		},
	});

	const flatData: NestedEngagement[] = useMemo(
		() => engagments?.pages?.flatMap((page) => page.data ?? []) ?? [],
		[engagments?.pages]
	);

	const groupedDays = Object.groupBy(flatData ?? [], (engagement) =>
		formatRelative(new Date(engagement.created_at), new Date(), {
			locale: {
				...enUS,
				formatRelative: (token) => formatRelativeLocale[token],
			},
		})
	);

	const client = useQueryClient();

	const engagementSummaryByPeriodQuery =
		getEngagementSummaryByPeriodQuery(queryFilter);

	// useEffect(() => {
	// 	if (!live) return;
	// 	const supabase = createClient();

	// 	const channel = supabase
	// 		.channel('engagements')
	// 		.on(
	// 			'postgres_changes',
	// 			{
	// 				event: '*',
	// 				schema: 'reporting',
	// 				table: 'engagements',
	// 			},
	// 			(payload) => {
	// 				console.log(payload);
	// 				if (payload.eventType === 'UPDATE') {
	// 					client.invalidateQueries({
	// 						queryKey: engagementQuery.queryKey,
	// 					});
	// 					const previousData = client.getQueryData(
	// 						engagementQuery.queryKey
	// 					);
	// 					console.log(previousData);
	// 					client.setQueryData(engagementQuery.queryKey, {
	// 						...(previousData ?? {}),
	// 						data: (previousData?.data ?? []).map((e) =>
	// 							e.id === payload.new.id
	// 								? { ...e, ...payload.new }
	// 								: e
	// 						),
	// 						count: previousData?.count ?? 0,
	// 					});
	// 				} else if (payload.eventType === 'INSERT') {
	// 					client.invalidateQueries({
	// 						queryKey: engagementQuery.queryKey,
	// 					});
	// 					client.invalidateQueries({
	// 						queryKey: engagementSummaryByPeriodQuery.queryKey,
	// 					});
	// 					const previousData = client.getQueryData(
	// 						engagementQuery.queryKey
	// 					);
	// 					console.log(previousData);
	// 					client.setQueryData(engagementQuery.queryKey, {
	// 						...(previousData ?? {}),
	// 						data: [payload.new, ...(previousData?.data ?? [])],
	// 						count: (previousData?.count ?? 0) + 1,
	// 					});
	// 				} else if (payload.eventType === 'DELETE') {
	// 					client.invalidateQueries({
	// 						queryKey: engagementQuery.queryKey,
	// 					});
	// 					client.invalidateQueries({
	// 						queryKey: engagementSummaryByPeriodQuery.queryKey,
	// 					});
	// 					const previousData = client.getQueryData(
	// 						engagementQuery.queryKey
	// 					);
	// 					console.log(previousData);
	// 					client.setQueryData(engagementQuery.queryKey, {
	// 						...(previousData ?? {}),
	// 						data: (previousData?.data ?? []).filter(
	// 							(e) => e.id !== payload.old.id
	// 						),
	// 						count: (previousData?.count ?? 0) - 1,
	// 					});
	// 				}
	// 			}
	// 		)
	// 		.subscribe();

	// 	console.log(channel);

	// 	return () => {
	// 		channel.unsubscribe();
	// 	};
	// }, [live]);

	return (
		<>
			<div className='flex flex-col pt-1 gap-1 bg-muted max-w-full inset-shadow-[0px_-1px_0px_0px_var(--border)]'>
				<div className='flex px-4 pt-2 pb-1'>
					<h2 className='text-xs font-medium tracking-tight text-muted-foreground'>
						Metrics
					</h2>
				</div>

				<div className='flex flex-col w-full h-full overflow-hidden'>
					<div className='grid grid-cols-4 gap-3 w-full h-full items-stretch scroll-px-4 px-4 py-3'>
						<Metric
							label='Total Engagements'
							icon={Phone}
							queryFn={getEngagementSummaryByPeriodQuery(
								queryFilter
							)}
							renderOption={(data) => {
								const total =
									data?.reduce((acc, engagement) => {
										return (
											acc +
											(engagement.total_engagements ?? 0)
										);
									}, 0) ?? 0;
								return <NumberFlow value={total} />;
							}}
						/>

						<Metric
							label='Inbound Engagements'
							icon={PhoneIncoming}
							queryFn={getEngagementSummaryByPeriodQuery(
								queryFilter
							)}
							renderOption={(data) => {
								const total =
									data?.reduce((acc, engagement) => {
										return (
											acc +
											(engagement.inbound_engagements ??
												0)
										);
									}, 0) ?? 0;
								return <NumberFlow value={total} />;
							}}
						/>

						<Metric
							label='Outbound Engagements'
							icon={PhoneOutgoing}
							queryFn={getEngagementSummaryByPeriodQuery(
								queryFilter
							)}
							renderOption={(data) => {
								const total =
									data?.reduce((acc, engagement) => {
										return (
											acc +
											(engagement.outbound_engagements ??
												0)
										);
									}, 0) ?? 0;
								return <NumberFlow value={total} />;
							}}
						/>

						<Metric
							label='Voicemails Left'
							icon={Voicemail}
							queryFn={getEngagementSummaryByPeriodQuery(
								queryFilter
							)}
							renderOption={(data) => {
								const total =
									data?.reduce((acc, engagement) => {
										return (
											acc + (engagement.voicemails ?? 0)
										);
									}, 0) ?? 0;
								return <NumberFlow value={total} />;
							}}
						/>
					</div>
				</div>
			</div>
			{/* <section className='grid grid-cols-4 gap-3 mt-6'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Total Calls
						</CardTitle>

						<Phone className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3'>
						<div className='text-2xl font-bold'>{totalCalls}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Inbound Calls
						</CardTitle>

						<PhoneIncoming className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3 '>
						<div className='text-2xl font-bold'>
							{totalInboundCalls}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Outbound Calls
						</CardTitle>

						<PhoneOutgoing className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3'>
						<div className='text-2xl font-bold'>
							{totalOutboundCalls}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
						<CardTitle className='text-sm font-medium'>
							Voicemails Left
						</CardTitle>

						<Voicemail className='text-muted-foreground' />
					</CardHeader>

					<CardContent className='px-3 pb-3'>
						<div className='text-2xl font-bold'>
							{totalVoicemails}
						</div>
					</CardContent>
				</Card>
			</section> */}

			<div className='min-h-12 max-h-12 flex items-center px-3 inset-shadow-[0px_-1px_0px_0px_var(--border)] '>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant='outline'>
							<Calendar />
							{startDate &&
								!endDate &&
								`After ${dateFormatter.format(new Date(startDate))}`}
							{startDate &&
								endDate &&
								`${dateFormatter.formatRange(new Date(startDate), new Date(endDate))}`}
							{!startDate &&
								endDate &&
								`Before ${dateFormatter.format(new Date(endDate))}`}
							{!startDate && !endDate && 'Date'}
						</Button>
					</PopoverTrigger>

					<PopoverContent
						align='start'
						className='w-[500px] p-0'
					>
						<DateRangeDisplay
							defaultValues={filter}
							navigate={navigate}
						/>
					</PopoverContent>
				</Popover>

				<div className='ml-auto flex items-center gap-2'>
					<Expandable placeholder='Search engagements...' />

					<LiveModeButton fetchPreviousPage={fetchPreviousPage} />
					{/* <Button
						variant='outline'
						className={cn(
							// 'ml-auto',
							live && 'border-primary text-primary'
						)}
						onClick={() => {
							setLive((prev) => !prev);
						}}
					>
						{live ? (
							<PauseCircle className='stroke-current' />
						) : (
							<PlayCircle className='stroke-current' />
						)}
						<span>{live ? 'Pause' : 'Live'}</span>
					</Button> */}
				</div>
			</div>

			<div className='w-full relative'>
				<div className='sticky top-0 z-[2] min-h-8 max-h-8 px-4 py-1.5 items-center gap-8 grid grid-cols-[0.25fr_1fr_1fr_1fr_1fr_1fr] max-w-full flex-[1_1_auto] inset-shadow-[0px_-1px_0px_0px_var(--border)] text-xs text-muted-foreground bg-background'>
					<div className='flex items-center justify-start gap-1 overflow-hidden'></div>

					<div className='flex items-center justify-start gap-1 overflow-hidden'>
						<Smartphone /> <span>Phone Number</span>
					</div>

					<div className='flex items-center justify-start gap-1 overflow-hidden'>
						<User />
						<span>Contact</span>
					</div>

					<div className='flex items-center justify-start gap-1 overflow-hidden'>
						<Building />
						<span>Company</span>
					</div>

					<div className='flex items-center justify-start gap-1 overflow-hidden'>
						<Headset />
						<span>Engineer</span>
					</div>

					<div className='flex items-center justify-start gap-1 overflow-hidden'>
						<Calendar1 />
						<span>Date</span>
					</div>
				</div>

				{isLoading ? (
					<div>
						<ListGroup
							heading={
								<Skeleton className='w-1/8 h-4 brightness-150' />
							}
							className='top-0'
						>
							{Array.from({ length: 25 }).map((_, index) => (
								<ListItem
									key={index}
									className='grid grid-cols-[0.25fr_1fr_1fr_1fr_1fr_1fr] min-h-12 max-h-12 py-3 px-4 items-center max-w-full gap-8 flex-[1_1_auto] inset-shadow-[0px_-1px_0px_0px_var(--border)]'
								>
									<Skeleton className='size-5' />
									<Skeleton className='h-full w-full' />
									<Skeleton className='h-full w-full' />
									<Skeleton className='h-full w-full' />
									<Skeleton className='h-full w-full' />
									<Skeleton className='h-full w-full' />
								</ListItem>
							))}
						</ListGroup>
					</div>
				) : (
					<>
						{Object.entries(groupedDays).map(
							([day, engagements]) => (
								<ListGroup
									key={day}
									heading={day}
									className='top-0'
								>
									{engagements?.map((engagement) => {
										const { data: attributes, error } =
											voiceAttributesSchema.safeParse(
												engagement.attributes
											);

										if (error) console.error(error);

										return (
											<ListItem key={engagement.id}>
												<Link
													to='/engagements/$id'
													params={{
														id: engagement.id,
													}}
													className={cn(
														'grid grid-cols-[0.25fr_1fr_1fr_1fr_1fr_1fr] min-h-12 max-h-12 py-3 px-4 items-center max-w-full gap-8 flex-[1_1_auto] inset-shadow-[0px_-1px_0px_0px_var(--border)] text-sm text-muted-foreground',
														engagement.is_canceled &&
															'bg-yellow-200/20 dark:bg-yellow-500/40',
														engagement.is_voicemail &&
															'bg-destructive/20 dark:bg-destructive/80 hover:bg-destructive/25 dark:hover:bg-destructive/50'
													)}
												>
													<div className='flex items-center justify-start gap-1 overflow-hidden'>
														{engagement.is_canceled ||
														engagement.is_voicemail ? (
															<>
																{engagement.is_canceled && (
																	<PhoneMissed />
																)}

																{engagement.is_voicemail && (
																	<Voicemail />
																)}
															</>
														) : (
															<>
																{engagement.is_inbound ? (
																	<PhoneIncoming />
																) : (
																	<PhoneOutgoing />
																)}
															</>
														)}
													</div>

													<div className='flex items-center justify-start gap-1 overflow-hidden'>
														{attributes?.name ??
															(
																engagement.attributes as Record<
																	string,
																	any
																>
															)?.name}
														{/* {attributes?.direction === 'inbound'
												? attributes.from
												: attributes?.outbound_to} */}
													</div>

													<div className='flex items-center justify-start gap-1 overflow-hidden'>
														{(
															engagement.contact as Record<
																string,
																any
															>
														)?.name ?? '----'}
													</div>

													<div className='flex items-center justify-start gap-1 overflow-hidden'>
														{(
															engagement.company as Record<
																string,
																any
															>
														)?.name ?? '----'}
													</div>

													<div className='flex items-center justify-start gap-1 overflow-hidden'>
														{engagement.reservations
															?.length === 1 ? (
															<Avatar className='size-5 rounded-full'>
																<AvatarFallback className='size-5 text-xs rounded-full bg-amber-500 text-white'>
																	N
																</AvatarFallback>
															</Avatar>
														) : (
															<AvatarStack
																avatars={
																	engagement.reservations?.map(
																		(
																			e
																		) => ({
																			image: '',
																			name: e.worker_sid,
																		})
																	) ?? []
																}
																avatarSize='xs'
															/>
															// <ColoredBadge variant='green'>
															// 	{engagement.reservations
															// 		?.length ?? 0}
															// </ColoredBadge>
														)}
													</div>

													<div className='flex items-center justify-start gap-1 overflow-hidden capitalize'>
														{formatRelative(
															new Date(
																engagement.created_at
															),
															new Date()
														)}
													</div>
												</Link>
											</ListItem>
										);
									})}
								</ListGroup>
							)
						)}
					</>
				)}
			</div>
		</>
	);
}

import { zodResolver } from '@hookform/resolvers/zod';
import NumberFlow from '@number-flow/react';
import {
	endOfDay,
	endOfMonth,
	endOfWeek,
	type FormatRelativeToken,
	formatRelative,
	startOfDay,
	startOfMonth,
	startOfWeek,
	startOfYesterday,
	subWeeks,
} from 'date-fns';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AvatarStack } from '@/components/avatar-stack';
import { LiveModeButton } from '@/components/live-mode-button';
import Metric from '@/components/metric-tracker-header/metric';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Expandable from '@/components/ui/expandable';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { ListGroup, ListItem } from '@/components/ui/list';
import { Skeleton } from '@/components/ui/skeleton';
import type { EngagementQueryOptions } from '@/lib/supabase/read';
import { voiceAttributesSchema } from '@/types/twilio';

const formSchema = z.object({
	start_date: z.string().optional(),
	end_date: z.string().optional(),
	within_sla_hours: z.boolean(),
});

export default function DateRangeDisplay({
	defaultValues,
	navigate,
}: {
	defaultValues?: z.infer<typeof filterSchema>;
	navigate: UseNavigateResult<'/coordinator-view'>;
}) {
	const quickFilters = [
		{
			label: 'Today',
			start_date: new Date(),
			end_date: new Date(),
		},
		{
			label: 'Yesterday',
			start_date: startOfYesterday(),
			end_date: startOfYesterday(),
		},
		{
			label: 'This Week',
			start_date: startOfWeek(new Date()),
			end_date: endOfWeek(new Date()),
		},
		{
			label: 'Last Week',
			start_date: startOfWeek(subWeeks(new Date(), 1)),
			end_date: endOfWeek(subWeeks(new Date(), 1)),
		},
		{
			label: 'This Month',
			start_date: startOfMonth(new Date()),
			end_date: endOfMonth(new Date()),
		},
	];

	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			start_date: defaultValues?.find(
				(f) =>
					f.id === 'created_at' &&
					f.value.operator === 'greater_than_or_equal_to'
			)?.value.values,
			end_date: defaultValues?.find(
				(f) =>
					f.id === 'created_at' &&
					f.value.operator === 'less_than_or_equal_to'
			)?.value.values,
			within_sla_hours:
				defaultValues?.find((f) => f.id === 'within_sla_hours')?.value
					.values?.[0] ?? true,
		},
	});

	// defaultValues?.filter(f => f.id === 'created_at').map(f => f.value.values) ??

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
		navigate({
			search: {
				filter: [
					values.start_date
						? {
								id: 'created_at',
								value: {
									values: new Date(values.start_date ?? ''),
									operator: 'greater_than_or_equal_to',
								},
							}
						: null,
					values.end_date
						? {
								id: 'created_at',
								value: {
									values: new Date(values.end_date ?? ''),
									operator: 'less_than_or_equal_to',
								},
							}
						: null,
					{
						id: 'within_sla_hours',
						value: {
							operator: 'eq',
							values: [values.within_sla_hours],
						},
					},
				].filter(Boolean) as z.infer<typeof filterSchema>,
			},
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className='grid grid-cols-[140px_1fr]'>
					<div className='border-r'>
						<h2 className='border-b p-3 text-sm font-semibold'>
							Date Range
						</h2>

						{quickFilters.map((filter) => {
							return (
								<Button
									key={filter.label}
									variant='ghost'
									className='w-full justify-start font-normal'
									type='button'
									onClick={() => {
										form.setValue(
											'start_date',
											filter.start_date?.toISOString()
										);
										form.setValue(
											'end_date',
											filter.end_date?.toISOString()
										);
										form.setValue(
											'within_sla_hours',
											form.getValues('within_sla_hours')
										);
									}}
								>
									{filter.label}
								</Button>
							);
						})}
					</div>

					<div className='py-6 px-3 space-y-6'>
						<FormField
							control={form.control}
							name='start_date'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='flex items-center justify-between'>
										<span>Start date</span>

										<Button
											variant='link'
											className='h-auto py-0'
											onClick={() =>
												form.setValue(
													'start_date',
													undefined
												)
											}
											type='button'
										>
											Clear
										</Button>
									</FormLabel>

									<FormControl>
										<Input
											className='w-full justify-between'
											type='date'
											placeholder='MM/DD/YYYY'
											{...field}
											value={
												field.value
													? new Date(field.value)
															.toISOString()
															.split('T')[0]
													: ''
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='end_date'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='flex items-center justify-between'>
										<span>End date</span>
										<Button
											variant='link'
											className='h-auto py-0'
											type='button'
											onClick={() =>
												form.setValue(
													'end_date',
													undefined
												)
											}
										>
											Clear
										</Button>
									</FormLabel>

									<FormControl>
										<Input
											className='w-full justify-between'
											type='date'
											placeholder='MM/DD/YYYY'
											{...field}
											value={
												field.value
													? new Date(field.value)
															.toISOString()
															.split('T')[0]
													: ''
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name='within_sla_hours'
							render={({ field }) => (
								<FormItem className='flex flex-row items-center'>
									<FormLabel>Within SLA hours</FormLabel>

									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div className='border-t p-3 flex items-center gap-3'>
					<Button
						variant='outline'
						type='button'
						onClick={() => {
							form.reset();
							form.handleSubmit(onSubmit)();
						}}
					>
						Clear
					</Button>

					<Button
						variant='outline'
						className='ml-auto'
						type='button'
						onClick={() => {}}
					>
						Cancel
					</Button>

					<Button disabled={!form.formState.isValid}>Apply</Button>
				</div>
			</form>
		</Form>
	);
}
