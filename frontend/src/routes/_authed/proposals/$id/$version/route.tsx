import { Button } from '@/components/ui/button';
import {
	BetweenHorizontalEnd,
	ClipboardList,
	Copy,
	ListChecks,
	Loader2,
	Settings,
	ShoppingBag,
	Trash,
	Undo2,
} from 'lucide-react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { getPinnedItem, getProposal, getVersions } from '@/lib/supabase/read';
import { ChevronDown, Star } from 'lucide-react';
import TabsList from '@/components/tabs-list';
import { ProposalActions } from '@/components/proposal-actions';
import { Editable, EditableArea, EditableInput, EditablePreview } from '@/components/ui/editable';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ListSelector } from '@/components/status-selector';
import { Separator } from '@/components/ui/separator';
import { ColoredBadge } from '@/components/ui/badge';
import useProposal from '@/hooks/use-proposal';
import { cn } from '@/lib/utils';
import { useMutation, useQueryClient, useSuspenseQueries } from '@tanstack/react-query';
import { deletePinnedItem } from '@/lib/supabase/delete';
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
import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { createPinnedItem, createVersion } from '@/lib/supabase/create';
import { useProposals } from '@/hooks/use-proposals';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { getCurrencyString } from '@/utils/money';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_authed/proposals/$id/$version')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id, version } = Route.useParams();

	const [{ data: initialData }, { data: pinnedItem }, { data: versions }] = useSuspenseQueries({
		queries: [
			{
				queryKey: ['proposals', id, version],
				queryFn: () => getProposal({ data: id }) as Promise<NestedProposal>,
				staleTime: Infinity,
			},
			{
				queryKey: ['pinned_items', id, version],
				queryFn: () =>
					getPinnedItem({
						data: {
							record_type: 'proposals',
							identifier: id,
						},
					}) as Promise<PinnedItem>,
				staleTime: Infinity,
			},
			{
				queryKey: ['versions'],
				queryFn: () => getVersions({ data: id }) as Promise<Version[]>,
				staleTime: Infinity,
			},
		],
	});

	const queryClient = useQueryClient();
	const { data: proposal, handleProposalUpdate } = useProposal({ id, version, initialData });
	const { handleProposalDeletion } = useProposals({ initialData: [] });
	const navigate = Route.useNavigate();

	const [dialogContent, setDialogContent] = useState<
		'opportunity' | 'version' | 'revertVersion' | 'delete' | undefined
	>();

	const { mutate: handlePinnedItemCreation } = useMutation({
		mutationKey: ['pinned_items', 'create'],
		mutationFn: async ({ pinnedItem }: { pinnedItem: PinnedItemInsert }) =>
			await createPinnedItem({
				data: pinnedItem,
			}),
		onMutate: async () => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: ['pinned_items'],
			});

			const previousItems = queryClient.getQueryData<PinnedItem[]>(['pinned_items']) ?? [];

			if (pinnedItem) {
				queryClient.setQueryData(
					['pinned_items'],
					previousItems.filter((item) => item.id !== pinnedItem.id)
				);
			} else {
				queryClient.setQueryData(
					['pinned_items'],
					[
						...previousItems,
						{
							id: proposal.id,
							record_type: 'proposals',
							identifier: proposal.id,
							helper_name: proposal.name,
						},
					]
				);
			}

			return { previousItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(['pinned_items'], context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['pinned_items'],
			});
		},
	});

	const { mutate: handlePinnedItemDeletion, isPending: isDeletePending } = useMutation({
		mutationKey: ['pinned_items', 'delete'],
		mutationFn: (id: string) => deletePinnedItem({ data: id }),
		onMutate: async () => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: ['pinned_items'],
			});

			const previousItems = queryClient.getQueryData<PinnedItem[]>(['pinned_items']) ?? [];

			if (pinnedItem) {
				queryClient.setQueryData(
					['pinned_items'],
					previousItems.filter((item) => item.id !== pinnedItem.id)
				);
			} else {
				queryClient.setQueryData(
					['pinned_items'],
					[
						...previousItems,
						{
							id: proposal.id,
							record_type: 'proposals',
							identifier: proposal.id,
							helper_name: proposal.name,
						},
					]
				);
			}

			return { previousItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(['pinned_items'], context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['pinned_items'],
			});
		},
	});

	const { mutate: handleNewVersion, isPending: isNewVersionPending } = useMutation({
		mutationFn: async () => await createVersion({ data: proposal.id }),
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
		// 	{
		// 	const createdVersion = await createVersion({ data: proposal.id });
		// 	// router.replace(`/proposals/${params.id}/${createdVersion}`);
		// 	// setShowNewVersionDialog(false);
		// }
	});

	const selectedStatus = proposalStatuses.find((status) => status.value === proposal.status);

	return (
		<Dialog>
			<header className='sticky top-0 flex min-h-16 items-center justify-start bg-background px-3 z-50 border-b'>
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
												onSubmit={(name) => handleProposalUpdate({ proposal: { name } })}
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
														onSelect={() => setDialogContent('opportunity')}
														disabled={proposal.status !== 'signed'}
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
																currentValue={versions.find(({ id }) => id === version)}
																value={(version) =>
																	`${version.id}-Version ${version.number}`
																}
																itemView={(version) => <p>Version {version.number}</p>}
																onSelect={({ id: versionId }) => {
																	if (versionId !== version) {
																		handleProposalUpdate({
																			proposal: { working_version: versionId },
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
													? handlePinnedItemDeletion(pinnedItem.id)
													: handlePinnedItemCreation({
															pinnedItem: {
																record_type: 'proposals',
																identifier: proposal.id,
																helper_name: proposal.name,
																params: { id, version },
																path: '/proposals/$id/$version',
															},
													  })
											}
										>
											<Star
												className={cn(
													'shrink-0 size-5',
													pinnedItem && 'text-yellow-300 fill-yellow-300 stroke-yellow-300'
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
														handleProposalUpdate({
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
									</div>
								</div>
							</div>
						</div>

						<ProposalActions
							proposalId={proposal.id}
							versionId={version}
						/>
					</div>

					<TabsList
						links={[
							{
								title: 'Overview',
								icon: ClipboardList,
								to: '/proposals/$id/$version',
								params: { id: proposal.id, version: proposal.working_version },
							},
							{
								title: 'Workplan',
								to: '/proposals/$id/$version/workplan',
								params: { id: proposal.id, version: proposal.working_version },
								icon: ListChecks,
							},
							{
								title: 'Products',
								to: '/proposals/$id/$version/products',
								params: { id: proposal.id, version: proposal.working_version },
								icon: ShoppingBag,
							},

							{
								title: 'Settings',
								to: '/proposals/$id/$version/settings',
								params: { id: proposal.id, version: proposal.working_version },
								icon: Settings,
							},
						]}
						className='border-b-0'
					/>
				</div>
			</header>

			<main>
				<Outlet />
			</main>

			<DialogContent className='max-h-w-padding-padding min-h-0 flex flex-col overflow-auto'>
				{dialogContent === 'opportunity' && (
					<>
						<DialogHeader>
							<DialogTitle>Transfer To Manage</DialogTitle>
						</DialogHeader>

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
								onClick={() => handleProposalDeletion.mutate({ id: proposal.id })}
								disabled={handleProposalDeletion.isPending}
							>
								{handleProposalDeletion.isPending && <Loader2 className='animate-spin mr-1.5' />}
								<span>Yes, I Want To Delete This Proposal</span>
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
