import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EditableArea, EditableInput, EditablePreview } from '@/components/ui/editable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { searchContacts } from '@/lib/manage/read';
import { useSuspenseQueries } from '@tanstack/react-query';
import { Cable, ChevronDown, Pen, Plus, ShieldCheck, TabletSmartphone, Tag, Tags, UserPen } from 'lucide-react';
import { Editable, EditableLabel } from '@/components/ui/editable';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ListSelector } from '@/components/list-selector';
import {
	getCommunicationTypesQuery,
	getConfigurationsQuery,
	getContactImageBlobQuery,
	getContactQuery,
	getContactTicketsQuery,
	getTicketQuery,
	getTicketsQuery,
} from '@/lib/manage/api';
import { AsyncSelect } from '@/components/ui/async-select';
import { CommandItem } from '@/components/ui/command';
import type { Contact } from '@/types/manage';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { columns } from '@/components/table-columns/ticket';
import { useNavigate } from '@tanstack/react-router';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Props {
	id: number | string;
	handleContactChange: (contact: Contact) => void;
	taskSid: string;
	reservationSid: string;
}

const ContactEngagementTab = ({ id, handleContactChange, taskSid, reservationSid }: Props) => {
	const [edit, setEdit] = useState(false);
	const [
		{ data: contact },
		{ data: communicationTypes },
		// { data: blob },
		{
			data: { data: tickets },
		},
		{
			data: { data: configurations },
		},
	] = useSuspenseQueries({
		queries: [
			getContactQuery(Number(id)),
			getCommunicationTypesQuery(),
			// getContactImageBlobQuery(Number(id)),
			getTicketsQuery({
				orderBy: { key: 'id', order: 'desc' },
				conditions: {
					closedFlag: false,
					parentTicketId: null,
					'contact/id': Number(id),
				},
				pageSize: 1000,
			}),
			getConfigurationsQuery({
				conditions: {
					'contact/id': Number(id),
					'status/id': 2,
				},
			}),
		],
	});
	const navigate = useNavigate();

	const details = [
		{
			items: [
				{ label: 'First Name', value: contact.firstName },
				{ label: 'Last Name', value: contact.lastName },
				{ label: 'Company', value: contact.company?.name },
			],
		},
		{
			items: [
				{ label: 'First Name', value: contact.firstName },
				{ label: 'Last Name', value: contact.lastName },
				{ label: 'Company', value: contact.company?.name },
			],
		},
	];

	const table = useReactTable({
		data: tickets,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className='flex flex-col gap-3 overflow-hidden'>
			<header className='flex items-center gap-3 w-full'>
				<Avatar className='size-20 rounded-lg'>
					<AvatarFallback className='text-2xl font-semibold uppercase rounded-lg'>CN</AvatarFallback>
					<AvatarImage
						className='outline'
						src='https://github.com/shadcn.png'
					/>
				</Avatar>

				<div>
					{edit ? (
						<AsyncSelect
							fetcher={async (query, page) => searchContacts({ data: { query, page } })}
							renderOption={(item) => (
								<CommandItem
									value={item.id.toString()}
									onSelect={() => handleContactChange(item)}
								>
									{item.firstName} {item.lastName}
								</CommandItem>
							)}
							defaultOpen
							label='Select Contact'
							placeholder='Search for a contact...'
							value={contact.id.toString()}
							onChange={() => {}}
							getOptionValue={(item) => item.id.toString()}
							getDisplayValue={(item) => `${item.firstName} ${item.lastName}`}
						>
							<div className='flex items-center gap-1.5'>
								<h2 className='text-2xl font-semibold'>
									{contact?.firstName} {contact?.lastName}
								</h2>
								<ShieldCheck className='text-green-500 size-8' />
							</div>
						</AsyncSelect>
					) : (
						<div className='flex items-center gap-1.5'>
							<h2 className='text-2xl font-semibold'>
								{contact?.firstName} {contact?.lastName}
							</h2>
							<ShieldCheck className='text-green-500 size-8' />
						</div>
					)}

					<p className='text-sm text-muted-foreground'>{contact?.company?.name}</p>
				</div>

				<Button
					variant={edit ? 'default' : 'outline'}
					size={edit ? 'sm' : 'icon'}
					className='ml-auto'
					onClick={() => setEdit((prev) => !prev)}
				>
					<Pen className={edit ? 'hidden' : undefined} />
					<span className={edit ? undefined : 'sr-only'}>{edit ? 'Save' : 'Edit'}</span>
				</Button>

				{/* <DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant='outline'
							size='icon'
							// className='ml-auto'
						>
							<MoreHorizontal className='size-5' />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent align='end'>
						<DropdownMenuItem>
							<Pen className='size-5' />
							<span>Edit</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu> */}
			</header>

			<Card className='flex flex-col'>
				<CardHeader>
					<CardTitle>
						<UserPen className='inline-block size-5 mr-1.5' /> Personal Details
					</CardTitle>
				</CardHeader>

				<CardContent className='grid grid-cols-2 gap-6'>
					{details.map(({ items }, index) => (
						<div
							key={items.length + index}
							className='space-y-1.5'
						>
							{items.map((d) => (
								<Editable
									key={d.label}
									editing={edit}
									value={d.value ?? undefined}
									className='grid grid-cols-[1fr_3fr] items-center gap-1.5'
								>
									<EditableLabel className='text-sm text-muted-foreground'>{d.label}</EditableLabel>

									<EditableArea>
										<EditablePreview className='px-1.5' />
										<EditableInput className='px-1.5' />
									</EditableArea>
								</Editable>
							))}
						</div>
					))}
				</CardContent>
			</Card>

			<Card className='flex flex-col'>
				<CardHeader>
					<CardTitle className='flex items-center gap-1.5'>
						<TabletSmartphone className='inline-block size-5' />
						<span>Communication Items</span>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='outline'
									size='smIcon'
								>
									<Plus />
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent align='end'>
								{communicationTypes
									?.filter(
										(type) =>
											!contact.communicationItems?.some((item) => item.type?.id === type.id) &&
											!type.disabled
									)
									.map((type) => (
										<DropdownMenuItem key={type.id}>{type.description}</DropdownMenuItem>
									))}
							</DropdownMenuContent>
						</DropdownMenu>
					</CardTitle>
				</CardHeader>

				<CardContent className='grid grid-cols-2 gap-6'>
					{contact?.communicationItems?.map((item) => (
						<div
							key={item.type?.id + item.id}
							className='grid grid-cols-[1fr_3fr] items-center gap-1.5'
						>
							<Editable
								editing={edit}
								value={item.type?.name ?? undefined}
							>
								{/* <EditableLabel className='text-sm text-muted-foreground'>{item.type?.name}</EditableLabel> */}

								<EditableArea>
									<EditablePreview className='text-sm text-muted-foreground' />
									<EditableInput asChild>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant='outline'
													size='sm'
													className='text-sm text-muted-foreground w-full justify-start'
												>
													{item.type?.name}
												</Button>
											</PopoverTrigger>

											<PopoverContent
												className='p-0'
												align='start'
											>
												<ListSelector
													items={communicationTypes ?? []}
													currentValue={communicationTypes?.find(
														(type) => type.id === item.type?.id
													)}
													itemView={(type) => <div>{type.description}</div>}
													value={(type) => `${type.id}-${type.description}`}
													onSelect={(item) => {
														console.log(item);
													}}
												/>
											</PopoverContent>
										</Popover>
									</EditableInput>
								</EditableArea>
							</Editable>

							<Editable
								editing={edit}
								value={item.value ?? undefined}
							>
								{/* <EditableLabel className='text-sm text-muted-foreground'>{item.type?.name}</EditableLabel> */}

								<EditableArea>
									<EditablePreview className='px-1.5' />
									<EditableInput className='px-1.5' />
								</EditableArea>
							</Editable>
						</div>
					))}
				</CardContent>
			</Card>

			{tickets.length > 0 && (
				<Collapsible>
					<Card className='flex flex-col overflow-hidden'>
						<CollapsibleTrigger className='cursor-pointer'>
							<CardHeader className='flex-row space-y-0'>
								<CardTitle className='flex items-center gap-1.5'>
									<Tags className='inline-block size-5' /> Tickets
								</CardTitle>

								<ChevronDown className='size-5 ml-auto' />
							</CardHeader>
						</CollapsibleTrigger>

						<CollapsibleContent>
							<CardContent className='p-0 overflow-hidden border-0 flex flex-col gap-1.5'>
								<ul className='space-y-6'>
									{tickets.map((ticket) => (
										<li
											key={ticket.id}
											className='relative flex gap-4 group'
										>
											<div className='absolute top-0 -bottom-6 left-0 flex w-6 justify-center'>
												<div className='w-[1px] group-last:hidden bg-muted-foreground' />
											</div>

											<div className='relative flex size-6 flex-none items-center justify-center bg-background'>
												<div className='size-1.5 rounded-full bg-muted-foreground' />
											</div>

											<Button
												key={ticket.id}
												variant='link'
												className='flex-auto py-0.5 text-sm text-muted-foreground leading-5 hover:underline hover:cursor-pointer'
												onClick={() =>
													navigate({
														to: '/engagements/$taskSid/$reservationSid',
														params: {
															taskSid,
															reservationSid,
														},
														search: { pane: 'ticket', itemId: ticket.id },
													})
												}
											>
												<span className='text-foreground font-medium'>
													#{ticket.id} - {ticket.summary}
												</span>
											</Button>
										</li>
									))}
								</ul>
								{/* <DataTableDisplay
						table={table}
						columns={columns}
					/> */}
							</CardContent>
						</CollapsibleContent>
					</Card>
				</Collapsible>
			)}

			{configurations.length > 0 && (
				<Card className='flex flex-col overflow-hidden'>
					<CardHeader>
						<CardTitle className='flex items-center gap-1.5'>
							<Cable className='inline-block size-5' /> Configurations
						</CardTitle>
					</CardHeader>

					<CardContent className='p-0 overflow-hidden border-0 flex flex-col gap-1.5'>
						<ul className='space-y-6'>
							{configurations
								?.filter((c) => c.type.name.includes('Server'))
								?.map((configuration) => (
									<li
										key={configuration.id}
										className='relative flex gap-4 group'
									>
										<div className='absolute top-0 -bottom-6 left-0 flex w-6 justify-center'>
											<div className='w-[1px] group-last:hidden bg-muted-foreground' />
										</div>

										<div className='relative flex size-6 flex-none items-center justify-center bg-background'>
											<div className='size-1.5 rounded-full bg-muted-foreground' />
										</div>

										{/* <DialogTrigger
											onClick={() => setQuestions(configuration.questions)}
											asChild
										>
										</DialogTrigger> */}
										<p className='flex-auto py-0.5 text-sm text-muted-foreground leading-5 hover:underline hover:cursor-pointer'>
											<span className='text-foreground font-medium'>{configuration.name}</span>
										</p>
									</li>
								))}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
};

export default ContactEngagementTab;
