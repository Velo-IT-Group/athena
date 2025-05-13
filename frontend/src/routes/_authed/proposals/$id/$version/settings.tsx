import { createFileRoute } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useProposal from '@/hooks/use-proposal';
import LabeledInput from '@/components/labeled-input';
import { Button } from '@/components/ui/button';
import { ChevronDown, CircleX, type LucideIcon } from 'lucide-react';
import { CircleCheck, Timer } from 'lucide-react';
import { CircleIcon } from 'lucide-react';
import useServiceTicket from '@/hooks/use-service-ticket';
import type { VariantProps } from 'class-variance-authority';
import { ColoredBadge, type coloredBadgeVariants } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ListSelector } from '@/components/status-selector';
import { AsyncSelect } from '@/components/ui/async-select';
import type { Contact } from '@/types/manage';
import { getContacts, searchContacts } from '@/lib/manage/read';
import { CommandItem } from '@/components/ui/command';

export const Route = createFileRoute('/_authed/proposals/$id/$version/settings')({
	component: RouteComponent,
});

export const proposalStatuses: {
	value: StatusEnum;
	label: string;
	icon: LucideIcon;
	color: VariantProps<typeof coloredBadgeVariants>['variant'];
}[] = [
	{
		value: 'building',
		label: 'Building',
		icon: CircleIcon,
		color: 'yellow',
	},
	{
		value: 'inProgress',
		label: 'In Progress',
		icon: Timer,
		color: 'blue',
	},
	{
		value: 'signed',
		label: 'Signed',
		icon: CircleCheck,
		color: 'green',
	},
	{
		value: 'canceled',
		label: 'Canceled',
		icon: CircleX,
		color: 'red',
	},
];

function RouteComponent() {
	const { id, version } = Route.useParams();

	const { data: proposal, handleProposalUpdate } = useProposal({ id, version });
	const { data: ticket } = useServiceTicket({ id: proposal?.service_ticket ?? 0 });

	console.log(ticket);

	const selectedStatus = proposalStatuses.find((status) => status.value === proposal.status);

	return (
		<main className='grid grid-cols-2 gap-3 p-3'>
			<Card>
				<form
					action={async (data: FormData) =>
						handleProposalUpdate({
							proposal: { name: data.get('name') as string, status: data.get('status') as StatusEnum },
						})
					}
					className='flex flex-col h-full'
				>
					<CardHeader>
						<CardTitle>General Settings</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<LabeledInput
							label='Name'
							name='name'
							defaultValue={proposal.name}
							onBlur={(e) => handleProposalUpdate({ proposal: { name: e.currentTarget.value } })}
						/>

						<LabeledInput label='Status'>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										size='sm'
										className='capitalize w-full justify-between gap-1.5'
									>
										<ColoredBadge
											variant={selectedStatus?.color}
											className='capitalize'
										>
											{selectedStatus?.icon && <selectedStatus.icon className='size-3 mr-1.5' />}
											{selectedStatus?.label}
										</ColoredBadge>

										<ChevronDown />
									</Button>
								</PopoverTrigger>

								<PopoverContent
									className='p-0 capitalize'
									align='start'
								>
									<ListSelector
										items={proposalStatuses}
										currentValue={selectedStatus}
										onSelect={(status) =>
											handleProposalUpdate({ proposal: { status: status.value } })
										}
										itemView={(status) => (
											<ColoredBadge
												variant={status?.color}
												className='capitalize'
											>
												<status.icon className='size-3 mr-1.5' />
												{status?.label}
											</ColoredBadge>
										)}
									/>
								</PopoverContent>
							</Popover>
						</LabeledInput>

						<LabeledInput
							label='Labor Rate'
							defaultValue={proposal.labor_rate}
						/>
					</CardContent>
				</form>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Service Ticket</CardTitle>
					<CardDescription>The ticket that the proposal was made for.</CardDescription>
				</CardHeader>

				<CardContent className='grid grid-cols-2 gap-4'>
					<div className='grid grid-cols-5 items-center gap-2 col-span-2'>
						<h3 className='text-sm text-muted-foreground'>Ticket</h3>
						<div className='col-span-4'>
							{/* <TicketSelector
                                    tickets={tickets ?? []}
                                    ticket={proposal.service_ticket}
                                /> */}
						</div>
					</div>
					<div className='grid gap-2 col-span-2'>
						<h3 className='text-sm text-muted-foreground'>Summary</h3>
						<p className='font-medium'>{ticket?.summary}</p>
					</div>

					<div className='grid gap-2'>
						<h3 className='text-sm text-muted-foreground'>Company</h3>
						<p className='font-medium'>{ticket?.company?.name ?? ''}</p>
					</div>
					<div className='grid gap-2'>
						<h3 className='text-sm text-muted-foreground'>Contact</h3>
						<AsyncSelect
							fetcher={async (value, page) => {
								const searchValue = value ?? '';
								const splitValue = searchValue.split(' ');
								console.log(searchValue);

								const firstName = splitValue.length > 1 ? splitValue[0] : value;
								const lastName = splitValue.length > 1 ? splitValue[1] : value;
								const operator = splitValue.length > 1 ? 'and' : 'or';

								console.log(
									firstName,
									lastName,
									operator,
									`firstName CONTAINS '${firstName}' ${operator} lastName CONTAINS '${lastName}' and company/id = ${
										ticket?.company?.id ?? 250
									}`
								);

								const { data } = await getContacts({
									data: {
										conditions: `firstName CONTAINS '${firstName}' ${operator} lastName CONTAINS '${lastName}' and company/id = ${
											ticket?.company?.id ?? 250
										}`,
										fields: ['id', 'firstName', 'lastName', 'communicationItems'],
										page,
										orderBy: { key: 'firstName', order: 'asc' },
									},
								});

								return data;
							}}
							renderOption={(item) => (
								<CommandItem value={item.id.toString()}>
									<div className='flex flex-col'>
										<div className='font-medium'>
											{item.firstName} {item.lastName}
										</div>
									</div>
								</CommandItem>
							)}
							getOptionValue={(item) => item.id.toString()}
							getDisplayValue={(item) => (
								<CommandItem value={item.id.toString()}>
									<div className='flex flex-col'>
										<div className='font-medium'>
											{item.firstName} {item.lastName}
										</div>
										<div className='text-xs text-muted-foreground'>{item.company?.name}</div>
									</div>
								</CommandItem>
							)}
							notFound={<div className='py-6 text-center text-sm'>No contacts found</div>}
							label='Contacts'
							placeholder='Search contacts...'
							value={ticket?.contact?.id.toString() ?? ''}
							onChange={(value) => {
								if (!value) {
									// setSelectedTicket(undefined);
									return;
								}
								handleProposalUpdate({
									proposal: {
										contact: {
											id: value.id,
											name: `${value.firstName} ${value.lastName}`,
										},
									},
								});
							}}
							className='w-[var(--radix-popover-trigger-width)]'
						>
							<Button
								variant='outline'
								role='combobox'
								className='justify-between'
							>
								{proposal?.contact?.name}
								{/* {selectedTicket
									? `#${selectedTicket.id} - ${selectedTicket.summary}`
									: 'Select a ticket...'}
								<ChevronsUpDown className='opacity-50' /> */}
							</Button>
						</AsyncSelect>
						{/* <p className='font-medium'>{ticket?.contact?.name ?? ''}</p> */}
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
