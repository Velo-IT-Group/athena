import LabeledInput from '@/components/labeled-input';
import ProductCard from '@/components/product-card';
import Tiptap from '@/components/tip-tap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import useProposal from '@/hooks/use-proposal';
import { getPhases, getProposal, getProposalSettings, getProposalTotals, getSections } from '@/lib/supabase/read';
import { updateProposal } from '@/lib/supabase/update';
import { calculateTotals } from '@/utils/helpers';
import { getCurrencyString } from '@/utils/money';
import { useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { ClockIcon } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';

export const Route = createFileRoute('/review/$id/$version/')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id, version: versionParam } = Route.useParams();

	const [{ data: initialProposal }, { data: sections }, { data: totals }, { data: settings }, { data: phases }] =
		useSuspenseQueries({
			queries: [
				{
					queryKey: ['proposals', id, versionParam],
					queryFn: () => getProposal({ data: id }),
				},
				{
					queryKey: ['proposals', id, versionParam, 'sections'],
					queryFn: () => getSections({ data: { proposalId: id, versionId: versionParam } }),
				},
				{
					queryKey: ['proposals', id, versionParam, 'totals'],
					queryFn: () => getProposalTotals({ data: { id, version: versionParam } }),
				},
				{
					queryKey: ['proposals', id, versionParam, 'settings'],
					queryFn: () => getProposalSettings({ data: { id, version: versionParam } }),
				},
				{
					queryKey: ['phases', id, versionParam],
					queryFn: () =>
						getPhases({ data: { proposalId: id, versionId: versionParam } }) as Promise<NestedPhase[]>,
				},
			],
		});

	const { data: proposal, handleProposalUpdate } = useProposal({
		id,
		version: versionParam,
		initialData: initialProposal,
	});
	const proposalExpirationDate = new Date(proposal.expiration_date ?? '');

	const today = new Date(); // Get today's date

	// const { recurringTotal, laborTotal, totalPrice } = calculateTotals(
	// 	(sections as NestedSection[]).flatMap((s) => s.products).filter(Boolean) as NestedProduct[],
	// 	phases ?? [],
	// 	proposal.labor_rate
	// );

	const todayWithoutTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const dateToCompareWithoutTime = new Date(
		proposalExpirationDate.getFullYear(),
		proposalExpirationDate.getMonth(),
		proposalExpirationDate.getDate()
	);

	if (proposal.status === 'signed')
		return <div className='relative bg-secondary/25 dark:bg-background flex-1 min-h-screen'>Approved</div>;

	if (todayWithoutTime > dateToCompareWithoutTime)
		return (
			<div className='absolute p-4 z-50 grid place-items-center bg-black/25 h-screen w-screen backdrop-blur-md'>
				<div className='flex flex-col items-center gap-2 justify-center bg-card py-16 px-8 rounded-md text-center'>
					<div className='bg-yellow-100 p-1 rounded-full'>
						<ClockIcon className='w-12 h-12 text-yellow-400' />
					</div>
					<h1 className='text-2xl font-semibold'>The proposal has expired.</h1>
					<p className='text-muted-foreground'>
						This proposal has expired.
						<br />
						Please reach out to your contact for assistance.
					</p>
				</div>
			</div>
		);

	return (
		<div className='relative bg-secondary/25 dark:bg-background flex-1 min-h-screen'>
			<div className='absolute p-4 z-50 grid place-items-center bg-black/25 h-screen w-screen backdrop-blur-md sm:hidden'>
				<div className='bg-card p-4 rounded-md text-center'>
					<h1 className='text-lg font-semibold'>Please use computer browser</h1>
					<p>Please use a screen that&apos;s bigger than 450px.</p>
				</div>
			</div>

			<header className='sticky top-0 z-50 flex h-[var(--navbar-height)] w-full shrink-0 items-center gap-3 border-b bg-sidebar px-3 justify-between'>
				<Dialog>
					<DialogTrigger asChild>
						<Button
							className='ml-auto'
							size='sm'
						>
							Approve
						</Button>
					</DialogTrigger>

					<DialogContent>
						<DialogHeader>
							<DialogTitle>Approve Proposal</DialogTitle>
						</DialogHeader>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								const data = new FormData(e.currentTarget);
								handleProposalUpdate({
									proposal: {
										status: 'signed',
										approval_info: {
											po: data.get('po') as string,
											name: data.get('name') as string,
											initials: data.get('initials') as string,
											dateSigned: new Date().toISOString(),
										},
									},
								});
							}}
						>
							<div className='grid w-full items-center gap-4'>
								<div className='flex flex-col space-y-1.5'>
									<LabeledInput
										label='Name'
										name='name'
										required
										placeholder='John Doe'
									/>
								</div>

								<div className='flex flex-col space-y-1.5'>
									<LabeledInput
										label='Initals'
										name='initals'
										required
										placeholder='JD'
									/>
								</div>

								<div className='flex flex-col space-y-1.5'>
									<LabeledInput
										label='PO Number (optional)'
										name='po'
										placeholder='123-45678'
									/>
								</div>
							</div>

							<DialogFooter className='pt-3'>
								<DialogClose asChild>
									<Button variant={'secondary'}>Cancel</Button>
								</DialogClose>

								<Button>Sign</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</header>

			<div className='border-t'>
				<div className='grid items-start gap-6 py-6 sm:grid-cols-5 sm:gap-12 sm:py-12 container mx-auto'>
					<div className='sm:col-span-3'>
						<div className='space-y-4'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='space-y-4'>
									<h1 className='text-lg font-semibold'>Ship To</h1>

									<div>
										<div className='font-medium'>
											{(proposal?.contact as Record<string, string>)?.name}
										</div>
										<div className='text-muted-foreground text-sm'>
											{(proposal?.contact as Record<string, string>)?.name}
										</div>
									</div>
								</div>

								<div className='space-y-4'>
									<h1 className='text-lg font-semibold'>Prepared By</h1>

									<div>
										<div className='font-medium'>
											{(proposal?.created_by as unknown as Record<string, string>)?.first_name}{' '}
											{(proposal?.created_by as unknown as Record<string, string>)?.last_name}
										</div>
									</div>
								</div>
							</div>

							<Separator />

							<h1 className='font-semibold text-lg'>Proposal Details</h1>

							<div className='rounded-xl border bg-background p-4 space-y-4'>
								{(sections as NestedSection[])?.map((section) => {
									return (
										<ProductCard
											key={section.id}
											title={section.name}
											products={section.products ?? []}
										/>
									);
								})}

								<Card>
									<CardHeader>
										<CardTitle>Overview</CardTitle>
									</CardHeader>

									<CardContent className='space-y-2.5'>
										<div className='grid gap-2 grid-cols-7'>
											<div className='max-w-96 col-span-4'>
												<span className='text-sm text-muted-foreground'>Description</span>
											</div>
											<div className='grid gap-2 justify-items-end grid-cols-5 col-span-3'>
												<span className='text-sm text-muted-foreground text-right col-span-2'>
													Recurring Price
												</span>
												<span className='text-sm text-muted-foreground col-span-3 text-right whitespace-nowrap'>
													Non-Recurring Price
												</span>
											</div>
										</div>
										{(sections as NestedSection[])?.map((section) => {
											const {
												productTotal: sectionProductSubTotal,
												recurringTotal: sectionRecurringProductSubTotal,
											} = calculateTotals(section?.products ?? [], [], 250);

											return (
												<div
													key={section.id}
													className='grid gap-2 grid-cols-7'
												>
													<div className='font-medium text-sm col-span-4'>
														{section.name} Total
													</div>

													<div className='grid gap-2 justify-items-end grid-cols-3 col-span-3'>
														<p className='text-sm text-muted-foreground text-right'>
															{getCurrencyString(sectionRecurringProductSubTotal)}
															/mo
														</p>
														<p className='text-sm text-muted-foreground text-right col-span-2'>
															{getCurrencyString(sectionProductSubTotal)}
														</p>
													</div>
												</div>
											);
										})}

										<Separator />

										<div className='grid gap-2 grid-cols-7'>
											<div className='font-medium text-sm col-span-4'>Services Total</div>

											<div className='grid gap-2 justify-items-end grid-cols-3 col-span-3'>
												<p className='text-sm text-muted-foreground text-right'>
													{getCurrencyString(0)}
													/mo
												</p>
												<p className='text-sm text-muted-foreground text-right col-span-2'>
													{getCurrencyString(totals.labor_cost ?? 0)}
												</p>
											</div>
										</div>

										<Separator />

										<div className='grid gap-2 grid-cols-7'>
											<p className='text-sm text-muted-foreground col-span-4'>Total</p>
											<div className='grid gap-2 justify-items-end grid-cols-3 col-span-3'>
												<p className='text-sm text-muted-foreground text-right'>
													<span className='font-medium'>
														{getCurrencyString(totals.recurring_total ?? 0)}
														/mo
													</span>
												</p>
												<p className='text-sm text-muted-foreground text-right col-span-2'>
													<span className='font-medium'>
														{getCurrencyString(totals.total_price ?? 0)}
													</span>
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							<p className='text-sm text-muted-foreground pr-4'>
								Taxes, shipping, handling and other fees may apply. We reserve the right to cancel
								orders arising from pricing or other errors.
							</p>
						</div>
					</div>

					<div className='sm:col-span-2 space-y-4'>
						{settings?.description && (
							<>
								<h2 className='text-lg font-semibold'>Summary</h2>
								<Tiptap
									editable={false}
									content={settings?.description}
									className='p-0'
								/>
							</>
						)}

						<h2 className='text-lg font-semibold'>Scope of Work</h2>

						<Card>
							<CardContent className='p-4'>
								<div className='space-y-4'>
									{phases
										?.sort((a, b) => a.order - b.order)
										.map((phase) => (
											<Fragment key={phase.id}>
												<div
													className='space-y-4'
													key={phase.id}
												>
													<div className='flex items-center gap-2'>
														<h3 className='font-medium tracking-tight'>
															{phase.description}
															{phase.hours > 0 &&
																` - ${phase.hours}${phase.hours > 1 ? 'hrs' : 'hr'}`}
														</h3>
													</div>

													<ul className='list-disc list-inside px-4'>
														{phase.tickets
															?.sort((a, b) => a.order - b.order)
															.map((ticket) => (
																<>
																	<li
																		key={ticket.id}
																		// className='text-sm'
																	>
																		{ticket.summary}
																	</li>
																	{ticket?.tasks && ticket?.tasks?.length > 0 && (
																		<ul className='list-disc list-inside pl-6'>
																			{ticket.tasks
																				?.sort((a, b) => a.order - b.order)
																				.map((task) => (
																					<li
																						key={task.id}
																						className='text-sm'
																					>
																						{task.notes}
																					</li>
																				))}
																		</ul>
																	)}
																</>
															))}
													</ul>
												</div>
												{/* {!phase.description.includes('Backoffice Coordination') && (
													
												)} */}
											</Fragment>
										))}
								</div>
							</CardContent>
						</Card>

						<h2 className='font-semibold'>Assumptions</h2>

						<Tiptap
							editable={false}
							content={settings?.assumptions ?? ''}
							className='p-0'
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
