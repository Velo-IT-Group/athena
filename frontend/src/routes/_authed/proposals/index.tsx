import { Building, Calendar, User } from 'lucide-react';
import { createFileRoute, Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';

import { getProposalsQuery } from '@/lib/supabase/api';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { cn, filterSchema } from '@/lib/utils';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import Expandable from '@/components/ui/expandable';
import { ListGroup, ListItem } from '@/components/ui/list';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { Badge, ColoredBadge } from '@/components/ui/badge';
import { proposalStatuses } from '@/routes/_authed/proposals/$id/$version/settings';
import { format } from 'date-fns';
import { debounce } from '@tanstack/pacer';
import { useState } from 'react';

export const Route = createFileRoute('/_authed/proposals/')({
	component: Proposals,
	validateSearch: zodValidator(z.object({ filter: filterSchema.optional() })),
});

function Proposals() {
	// const { filter } = Route.useSearch();
	const [searchText, setSearchText] = useState<string | undefined>(undefined);

	const { data, isLoading } = useQuery({
		...getProposalsQuery({ searchText }),
		placeholderData: (prev) => prev,
	});

	const proposals = data?.data ?? [];
	const debounced = debounce(
		(value: string) => {
			// saveChanges();
			setSearchText(value);
		},
		{ wait: 250 }
	);

	const groupedProposals = Object.groupBy(
		proposals,
		(proposal) => proposal.status
	);

	return (
		<>
			<div className='min-h-12 max-h-12 flex items-center px-3 inset-shadow-[0px_-1px_0px_0px_var(--border)] '>
				<Popover>
					<PopoverTrigger asChild>
						<Button variant='outline'>
							<Calendar />
							{/* {startDate &&
								!endDate &&
								`After ${dateFormatter.format(new Date(startDate))}`}
							{startDate &&
								endDate &&
								`${dateFormatter.formatRange(new Date(startDate), new Date(endDate))}`}
							{!startDate &&
								endDate &&
								`Before ${dateFormatter.format(new Date(endDate))}`}
							{!startDate && !endDate && 'Date'} */}
						</Button>
					</PopoverTrigger>

					<PopoverContent
						align='start'
						className='w-[500px] p-0'
					>
						{/* <DateRangeDisplay
							defaultValues={filter}
							navigate={navigate}
						/> */}
					</PopoverContent>
				</Popover>

				<div className='ml-auto flex items-center gap-2'>
					<Expandable
						placeholder='Search proposals...'
						onChange={(value) => debounced(value)}
					/>

					<Button
						variant='outline'
						// className={cn(
						// 	// 'ml-auto',
						// 	live && 'border-primary text-primary'
						// )}
						// onClick={() => {
						// 	setLive((prev) => !prev);
						// }}
					>
						{/* {live ? (
							<PauseCircle className='stroke-current' />
						) : (
							<PlayCircle className='stroke-current' />
						)}
						<span>{live ? 'Pause' : 'Live'}</span> */}
					</Button>
				</div>
			</div>

			<div className='w-full relative'>
				<div className='sticky top-0 z-[2] min-h-8 max-h-8 px-4 py-1.5 items-center gap-8 grid grid-cols-[2fr_1fr_1fr_1fr] max-w-full flex-[1_1_auto] inset-shadow-[0px_-1px_0px_0px_var(--border)] text-xs text-muted-foreground bg-background'>
					<div className='flex items-center justify-start gap-1 overflow-hidden'>
						<span>Proposal</span>
					</div>

					<div className='flex items-center justify-start gap-1 overflow-hidden'>
						<Building />
						<span>Company</span>
					</div>

					<div className='flex items-center justify-start gap-1 overflow-hidden'>
						<User />
						<span>Contact</span>
					</div>

					<div className='flex items-center justify-start gap-1 overflow-hidden'>
						{/* <Calendar1 /> */}
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
									className='grid grid-cols-[2fr_1fr_1fr_1fr_1fr] min-h-12 max-h-12 py-3 px-4 items-center max-w-full gap-8 flex-[1_1_auto] inset-shadow-[0px_-1px_0px_0px_var(--border)]'
								>
									{/* <Skeleton className='size-5' /> */}
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
						{/* @ts-ignore */}
						{Object.entries(groupedProposals).map(
							([status, proposals]) => {
								{
									/* @ts-ignore */
								}
								const selectedStatus = proposalStatuses.find(
									(s) => s.value === status
								);

								return (
									<ListGroup
										key={selectedStatus?.label ?? status}
										heading={
											selectedStatus?.label ?? status
										}
										className='top-0'
									>
										{proposals?.map((proposal) => {
											return (
												<ListItem key={proposal.id}>
													<Link
														to='/proposals/$id/$version'
														params={{
															id: proposal.id,
															version:
																proposal.working_version ||
																'latest',
														}}
														className={cn(
															'grid grid-cols-[2fr_1fr_1fr_1fr] min-h-12 max-h-12 py-3 px-4 items-center max-w-full gap-8 flex-[1_1_auto] inset-shadow-[0px_-1px_0px_0px_var(--border)] text-sm hover:bg-muted/50'
															// proposal.is_canceled &&
															// 	'bg-yellow-200/20 dark:bg-yellow-500/40',
															// engagement.is_voicemail &&
															// 	'bg-destructive/20 dark:bg-destructive/80 hover:bg-destructive/25 dark:hover:bg-destructive/50'
														)}
													>
														{/* <div className='flex items-center justify-start gap-1 overflow-hidden'></div> */}

														<div className='overflow-hidden'>
															<h3 className='truncate'>
																{proposal.name}
															</h3>
														</div>

														<div className='flex items-center justify-start gap-1 overflow-hidden'>
															<ColoredBadge
																variant='gray'
																className='overflow-hidden'
															>
																<Building />
																<span className='truncate'>
																	{proposal.company_name ??
																		(
																			proposal.company as Record<
																				string,
																				any
																			>
																		)?.name}
																</span>
															</ColoredBadge>
														</div>

														<div className='flex items-center justify-start gap-1 overflow-hidden'>
															<Badge
																variant='outline'
																className='overflow-hidden'
															>
																<User />
																<span className='truncate'>
																	{proposal.contact_name ??
																		(
																			proposal.contact as Record<
																				string,
																				any
																			>
																		)?.name}
																</span>
															</Badge>
														</div>

														{/* <div className='flex items-center justify-start gap-1 overflow-hidden'>
														<ColoredBadge
															variant={
																selectedStatus?.color
															}
														>
															{selectedStatus && (
																<selectedStatus.icon />
															)}
															<span>
																{
																	selectedStatus?.label
																}
															</span>
														</ColoredBadge>
													</div> */}

														<div className='flex items-center justify-start gap-1 overflow-hidden capitalize'>
															<span className='text-muted-foreground text-xs'>
																{format(
																	new Date(
																		proposal.expiration_date ??
																			new Date()
																	),
																	'MMM dd, yyyy'
																)}
															</span>
														</div>
													</Link>
												</ListItem>
											);
										})}
									</ListGroup>
								);
							}
						)}
					</>
				)}
			</div>
		</>
		// <main className='p-6 space-y-6'>
		// 	<section className='flex items-center justify-between'>
		// 		<h1 className='text-2xl font-semibold'>Proposals</h1>

		// 		<Link
		// 			to='/proposals/new/blank'
		// 			className={buttonVariants()}
		// 		>
		// 			<Plus /> <span>Create Proposal</span>
		// 		</Link>
		// 	</section>

		// 	<section>
		// 		<Search
		// 			baseUrl='/proposals'
		// 			placeholder='Find a proposal'
		// 			className='rounded-full shadow-none'
		// 		/>
		// 	</section>

		// 	<Suspense fallback={<TableSkeleton columns={columns.length} />}>
		// 		<DataTable
		// 			options={getProposalsQuery({
		// 				searchText: filter?.[0]?.value?.values?.[0] || '',
		// 			})}
		// 			columns={columns}
		// 			hideFilter
		// 		/>
		// 	</Suspense>
		// </main>
	);
}
