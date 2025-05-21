import { useState } from 'react';

import {
	BetweenHorizontalEnd,
	CalendarIcon,
	CalendarSync,
	ChartBarIncreasing,
	CircleDollarSign,
	Copy,
	Loader2,
	PenLine,
	Trash,
	Undo2,
	ChevronDown,
	Star,
} from 'lucide-react';

import { formatRelative } from 'date-fns';
import NumberFlow from '@number-flow/react';

import { createFileRoute, Outlet } from '@tanstack/react-router';
import TabsList from '@/components/tabs-list';
import { ProposalActions } from '@/components/proposal-actions';

import { Button } from '@/components/ui/button';
import { Editable, EditableArea, EditableInput, EditablePreview } from '@/components/ui/editable';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ColoredBadge } from '@/components/ui/badge';

import { ListSelector } from '@/components/list-selector';
import useProposal from '@/hooks/use-proposal';
import { cn } from '@/lib/utils';
import { useMutation, useSuspenseQueries } from '@tanstack/react-query';
import { proposalStatuses } from '@/routes/_authed/proposals/$id/$version/settings';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { createVersion } from '@/lib/supabase/create';
import { useProposals } from '@/hooks/use-proposals';
import { getCurrencyString } from '@/utils/money';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { linksConfig } from '@/config/links';
import { getPinnedItemQuery, getProposalQuery, getProposalTotalsQuery, getVersionsQuery } from '@/lib/supabase/api';
import { usePinnedItems } from '@/hooks/use-pinned-items';
import LabeledInput from '@/components/labeled-input';
import { formatRelativeLocale } from '@/components/overview-right';
import CurrencyInput from '@/components/currency-input';
import { Calendar } from '@/components/ui/calendar';
import { enUS } from 'date-fns/locale/en-US';
import useServiceTicket from '@/hooks/use-service-ticket';

export const Route = createFileRoute('/_authed/proposals/$id/$version')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id, version } = Route.useParams();

	const [{ data: initialData }, { data: pinnedItem }, { data: versions }, { data: totals }] = useSuspenseQueries({
		queries: [
			getProposalQuery(id, version),
			getPinnedItemQuery({
				record_type: 'proposals',
				identifier: id,
			}),
			getVersionsQuery(id),
			getProposalTotalsQuery(id, version),
		],
	});

	const {
		data: proposal,
		handleProposalUpdate,
		handleProposalConversion,
	} = useProposal({ id, version, initialData });
	const { data: ticket } = useServiceTicket({ id: proposal?.service_ticket ?? 0 });
	const { handleProposalDeletion } = useProposals({ initialData: [] });
	const navigate = Route.useNavigate();

	const [dialogContent, setDialogContent] = useState<
		'opportunity' | 'version' | 'revertVersion' | 'delete' | 'settings' | undefined
	>();

	const [open, setOpen] = useState(false);

	const { data, handlePinnedItemDeletion, handlePinnedItemCreation } = usePinnedItems();

	const { mutate: handleNewVersion, isPending: isNewVersionPending } = useMutation({
		mutationFn: async () => await createVersion({ data: proposal?.id ?? '' }),
		onSuccess: (newVersionId) => {
			setDialogContent(undefined);
			navigate({
				to: '/proposals/$id/$version',
				params: {
					id,
					version: newVersionId,
				},
			});
		},
	});

	const selectedStatus = proposalStatuses.find((status) => status.value === proposal?.status);

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<Collapsible className='sticky top-0 bg-background z-50'>
				<header className='flex min-h-16 items-center justify-start px-3 border-b'>
					<div className='flex flex-1 flex-col items-stretch justify-around'>
						<div className='flex w-full flex-1 items-stretch justify-start'>
							<div className='flex-1 pt-3'>
								<div className='flex space-x-3 pb-2'>
									<div className='flex flex-1 flex-col items-start justify-center'>
										<div className='flex max-w-full items-center justify-start'>
											<h1 className='mr-1 text-2xl font-medium'>
												<Editable
													defaultValue={proposal?.name}
													className='md:text-2xl cursor-pointer'
													autosize
													onSubmit={(name) =>
														handleProposalUpdate.mutate({ proposal: { name } })
													}
												>
													<EditableArea>
														<EditablePreview className='md:text-2xl px-1.5 -ml-1.5 -mr-1.5' />
														<EditableInput
															className='md:text-2xl px-1.5 -ml-1.5 -mr-1.5'
															placeholder='Search'
														/>
													</EditableArea>
												</Editable>
											</h1>

											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														size='icon'
														variant='ghost'
													>
														<ChevronDown className='shrink-0' />
													</Button>
												</DropdownMenuTrigger>

												<DropdownMenuContent align='start'>
													<DialogTrigger asChild>
														<DropdownMenuItem
															onSelect={() => setDialogContent('settings')}
															disabled={proposal?.status === 'signed'}
														>
															<PenLine className='mr-1.5' />
															<span>Edit proposal details</span>
														</DropdownMenuItem>
													</DialogTrigger>

													<DialogTrigger asChild>
														<DropdownMenuItem
															onSelect={() => setDialogContent('opportunity')}
															disabled={proposal?.status !== 'signed'}
														>
															<BetweenHorizontalEnd className='mr-1.5' />
															<span>Transfer to Manage</span>
														</DropdownMenuItem>
													</DialogTrigger>

													<DropdownMenuSeparator />

													<DialogTrigger asChild>
														<DropdownMenuItem onSelect={() => setDialogContent('version')}>
															<Copy className='mr-1.5' />
															<span>Create New Version</span>
														</DropdownMenuItem>
													</DialogTrigger>

													{versions && versions.length > 1 && (
														<DropdownMenuSub>
															<DropdownMenuSubTrigger>
																<Undo2 className=' mr-1.5' />
																<span>Revert back</span>
															</DropdownMenuSubTrigger>
															<DropdownMenuSubContent className='p-0'>
																<ListSelector
																	items={versions}
																	currentValue={versions.find(
																		({ id }) => id === version
																	)}
																	value={(version) =>
																		`${version.id}-Version ${version.number}`
																	}
																	itemView={(version) => (
																		<p>Version {version.number}</p>
																	)}
																	onSelect={({ id: versionId }) => {
																		if (versionId !== version) {
																			handleProposalUpdate.mutate({
																				proposal: {
																					working_version: versionId,
																				},
																			});

																			navigate({
																				to: '/proposals/$id/$version',
																				params: { id, version: versionId },
																			});
																		}
																	}}
																/>
															</DropdownMenuSubContent>
														</DropdownMenuSub>
													)}

													<DropdownMenuSeparator />

													<DialogTrigger asChild>
														<DropdownMenuItem
															onSelect={() => setDialogContent('delete')}
															className='text-red-600 focus:text-red-600 focus:bg-red-50'
														>
															<Trash className='mr-1.5' />
															<span>Delete proposal</span>
														</DropdownMenuItem>
													</DialogTrigger>
												</DropdownMenuContent>
											</DropdownMenu>

											<Button
												size='icon'
												variant='ghost'
												onClick={() =>
													pinnedItem
														? handlePinnedItemDeletion.mutate(pinnedItem.id)
														: handlePinnedItemCreation.mutate({
																pinnedItem: {
																	record_type: 'proposals',
																	identifier: proposal?.id ?? '',
																	helper_name: proposal?.name ?? '',
																	params: { id, version },
																	path: '/proposals/$id/$version',
																},
														  })
												}
											>
												<Star
													className={cn(
														'shrink-0 size-5',
														pinnedItem &&
															'text-yellow-300 fill-yellow-300 stroke-yellow-300'
													)}
												/>
											</Button>

											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant='ghost'
														size='sm'
														className='group'
													>
														{selectedStatus && (
															<ColoredBadge
																variant={selectedStatus.color}
																className='capitalize'
															>
																<selectedStatus.icon className='size-3 mr-1.5' />
																{selectedStatus.label}
															</ColoredBadge>
														)}

														<ChevronDown className='group-hover:block hidden size-3.5 stroke-2' />
													</Button>
												</PopoverTrigger>

												<PopoverContent
													className='p-0 w-fit'
													align='start'
												>
													<ListSelector
														currentValue={selectedStatus}
														onSelect={(status) =>
															handleProposalUpdate.mutate({
																proposal: { status: status.value as StatusEnum },
															})
														}
														value={(status) => status.label}
														items={proposalStatuses}
														itemView={(status) => (
															<ColoredBadge
																variant={status.color}
																className='capitalize'
															>
																<status.icon className='size-3 mr-1.5' />
																{status.label}
															</ColoredBadge>
														)}
													/>

													<Separator />
												</PopoverContent>
											</Popover>

											{proposal?.status === 'signed' && (
												<DialogTrigger asChild>
													<Button
														variant='secondary'
														size='sm'
														onClick={() => setDialogContent('opportunity')}
													>
														{proposal.is_getting_converted ? (
															<Loader2 className='animate-spin mr-1.5' />
														) : (
															<BetweenHorizontalEnd className='mr-1.5' />
														)}
														<span>
															{proposal.is_getting_converted
																? 'Converting...'
																: 'Transfer to Manage'}
														</span>
													</Button>
												</DialogTrigger>
											)}
										</div>
									</div>
								</div>
							</div>

							{proposal ? (
								<ProposalActions
									proposalId={proposal?.id ?? ''}
									versionId={version}
									serviceTicketId={proposal.service_ticket ?? 0}
									total={totals?.total_price ?? 0}
								/>
							) : (
								<div className='flex items-center justify-end'>
									<Button
										variant='secondary'
										size='sm'
									>
										Create proposal
									</Button>
								</div>
							)}
						</div>

						<CollapsibleContent className='grid grid-cols-4 gap-3 mb-1.5'>
							<Card>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
									<CardTitle className='text-sm font-medium'>Labor</CardTitle>

									<ChartBarIncreasing className='text-muted-foreground' />
								</CardHeader>

								<CardContent className='px-3 pb-3'>
									<div className='text-2xl font-bold'>
										<NumberFlow
											value={totals?.labor_cost ?? 0}
											locales='en-US'
											format={{ style: 'currency', currency: 'USD' }}
										/>
										{/* {getCurrencyString(totals?.labor_cost ?? 0)} */}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
									<CardTitle className='text-sm font-medium'>Recurring</CardTitle>

									<CalendarSync className='text-muted-foreground' />
								</CardHeader>

								<CardContent className='px-3 pb-3'>
									<div className='text-2xl font-bold'>
										<NumberFlow
											value={totals?.recurring_total ?? 0}
											locales='en-US'
											format={{ style: 'currency', currency: 'USD' }}
										/>
										{/* {getCurrencyString(totals?.recurring_total ?? 0)} */}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
									<CardTitle className='text-sm font-medium'>Product</CardTitle>

									<CalendarSync className='text-muted-foreground' />
								</CardHeader>

								<CardContent className='px-3 pb-3'>
									<div className='text-2xl font-bold'>
										<NumberFlow
											value={totals?.non_recurring_product_total ?? 0}
											locales='en-US'
											format={{ style: 'currency', currency: 'USD' }}
										/>
										{/* {getCurrencyString(totals?.non_recurring_product_total ?? 0)} */}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 p-3 pb-2'>
									<CardTitle className='text-sm font-medium'>Total Quote Value</CardTitle>

									<CircleDollarSign className='text-muted-foreground' />
								</CardHeader>

								<CardContent className='px-3 pb-3'>
									<div className='text-2xl font-bold'>
										<NumberFlow
											value={totals?.total_price ?? 0}
											locales='en-US'
											format={{ style: 'currency', currency: 'USD' }}
										/>
										{/* {getCurrencyString(totals?.total_price ?? 0)} */}
									</div>
								</CardContent>
							</Card>
						</CollapsibleContent>

						<TabsList
							links={linksConfig.proposalTabs.map((tab) => ({
								...tab,
								params: { id: proposal?.id ?? '', version: proposal?.working_version ?? '' },
							}))}
							className='border-b-0'
						/>
					</div>
				</header>
			</Collapsible>

			<Outlet />

			<DialogContent className='max-h-w-padding-padding min-h-0 flex flex-col overflow-auto'>
				{dialogContent === 'opportunity' && (
					<>
						<DialogHeader>
							<DialogTitle>Are you sure you want to transfer this project?</DialogTitle>
						</DialogHeader>

						<div className='text-sm text-muted-foreground'>
							This will create a new opportunity, and transfer all the products, phases, and labor from
							this proposal.
						</div>

						<DialogFooter>
							<DialogClose asChild>
								<Button
									variant='secondary'
									type='button'
								>
									Keep editing
								</Button>
							</DialogClose>

							<Button
								onClick={() => {
									handleProposalConversion.mutate({ id: proposal?.id ?? '' });
									setOpen(false);
								}}
							>
								Transfer
							</Button>
						</DialogFooter>

						{/* <ConversionModal
					proposal={proposal}
					ticket={ticket}
					phases={phases}
					products={products}
				/> */}
					</>
				)}

				{dialogContent === 'version' && (
					<form
						className='grid gap-3'
						action={async () => handleNewVersion()}
					>
						<DialogHeader>
							<DialogTitle>Are you sure?</DialogTitle>
							<DialogDescription>Are you sure you want to make a new version?</DialogDescription>
						</DialogHeader>

						<DialogFooter>
							<Button
								variant='secondary'
								type='button'
							>
								Close
							</Button>

							<Button>
								{isNewVersionPending && <Loader2 className='animate-spin mr-1.5' />} Yes, I Want To
								Create Version {versions?.length ? versions?.length + 1 : 2}
							</Button>
						</DialogFooter>
					</form>
				)}

				{dialogContent === 'delete' && (
					<>
						<DialogHeader>
							<DialogTitle>Are you sure?</DialogTitle>
							<DialogDescription>Are you sure you want to delete this proposal?</DialogDescription>
						</DialogHeader>

						<DialogFooter>
							<Button
								variant='secondary'
								type='button'
							>
								Close
							</Button>

							<Button
								variant='destructive'
								onClick={() => handleProposalDeletion.mutate({ id: proposal?.id ?? '' })}
								disabled={handleProposalDeletion.isPending}
							>
								{handleProposalDeletion.isPending && <Loader2 className='animate-spin mr-1.5' />}
								<span>Yes, I Want To Delete This Proposal</span>
							</Button>
						</DialogFooter>
					</>
				)}

				{dialogContent === 'settings' && (
					<>
						<DialogHeader>
							<DialogTitle>Proposal details</DialogTitle>
						</DialogHeader>

						<div className='space-y-6'>
							<Card>
								<CardContent className='grid grid-cols-2 gap-3'>
									<LabeledInput
										label='Name'
										className='col-span-2 w-full'
										value={proposal?.name}
										onChange={(e) =>
											handleProposalUpdate.mutate({ proposal: { name: e.target.value } })
										}
									/>

									<LabeledInput
										label='Expiration date'
										className=''
									>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant='ghost'
													size='sm'
													className={cn(
														'h-auto py-1.5 border-gray-600 text-muted-foreground justify-start items-center gap-3',
														proposal?.expiration_date
															? new Date(proposal?.expiration_date) < new Date()
																? 'text-red-500 border-red-500 hover:border-red-500 hover:text-red-500'
																: 'text-green-500 border-green-500 hover:border-green-500 hover:text-green-500'
															: undefined
													)}
												>
													<div
														className={cn(
															'size-7 border border-dashed border-inherit rounded-full inline-flex items-center justify-center'
														)}
														style={{
															// border: '1px dashed #6d6e6f',
															width: '28px',
															height: '28px',
														}}
													>
														<CalendarIcon className='size-5' />
													</div>

													<span className='whitespace-nowrap overflow-hidden text-ellipsis text-base font-medium'>
														{proposal?.expiration_date
															? formatRelative(
																	new Date(proposal?.expiration_date),
																	new Date(),
																	{
																		locale: {
																			...enUS,
																			formatRelative: (token) =>
																				formatRelativeLocale[token],
																		},
																	}
															  )
															: 'No due date'}
													</span>
												</Button>
											</PopoverTrigger>

											<PopoverContent
												className='p-0 w-fit'
												align='start'
											>
												<Calendar
													mode='single'
													defaultMonth={
														proposal?.expiration_date
															? new Date(proposal?.expiration_date)
															: undefined
													}
													selected={
														proposal?.expiration_date
															? new Date(proposal?.expiration_date)
															: undefined
													}
													onSelect={(date) =>
														handleProposalUpdate.mutate({
															proposal: { expiration_date: date?.toISOString() },
														})
													}
												/>
											</PopoverContent>
										</Popover>
									</LabeledInput>

									<LabeledInput label='Labor rate'>
										<CurrencyInput
											defaultValue={proposal?.labor_rate}
											onChange={(e) =>
												handleProposalUpdate.mutate({
													proposal: { labor_rate: e.target.valueAsNumber },
												})
											}
										/>
									</LabeledInput>
								</CardContent>
							</Card>

							<Card className='col-span-2'>
								<CardHeader>
									<CardTitle>Ticket</CardTitle>
								</CardHeader>

								<CardContent className='grid grid-cols-2 gap-3'>
									<div className='grid gap-2 col-span-2'>
										<h3 className='text-sm text-muted-foreground'>Summary</h3>
										<p className='font-medium'>{ticket?.summary ?? ''}</p>
									</div>

									<div className='grid gap-2'>
										<h3 className='text-sm text-muted-foreground'>Company</h3>
										<p className='font-medium'>{ticket?.company?.name ?? ''}</p>
									</div>
									<div className='grid gap-2'>
										<h3 className='text-sm text-muted-foreground'>Contact</h3>
										<p className='font-medium'>{ticket?.contact?.name ?? ''}</p>
									</div>
								</CardContent>
							</Card>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
