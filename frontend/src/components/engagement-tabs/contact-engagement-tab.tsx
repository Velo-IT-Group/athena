import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { EditableArea, EditableInput, EditablePreview } from '@/components/ui/editable';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getCommunicationTypes, getContact, getContactImage, getTickets } from '@/lib/manage/read';
import { useQuery, useSuspenseQueries } from '@tanstack/react-query';
import { MoreHorizontal, Pen, Phone, Plus, TabletSmartphone, Tag, Tags, UserPen } from 'lucide-react';
import { Editable, EditableLabel } from '@/components/ui/editable';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ListSelector } from '@/components/status-selector';
import {
	getCommunicationTypesQuery,
	getContactImageBlobQuery,
	getContactQuery,
	getContactTicketsQuery,
	getTicketsQuery,
} from '@/lib/manage/api';

type Props = {
	id: number | string;
};

const ContactEngagementTab = ({ id }: Props) => {
	const [edit, setEdit] = useState(false);
	const [
		{ data: contact },
		{ data: communicationTypes },
		{ data: blob },
		{
			data: { data: tickets },
		},
	] = useSuspenseQueries({
		queries: [
			getContactQuery(Number(id)),
			getCommunicationTypesQuery(),
			getContactImageBlobQuery(Number(id)),
			getContactTicketsQuery(Number(id)),
		],
	});

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
				// { label: 'Phone', value: contact.phone_number },
			],
		},
	];

	return (
		<div className='space-y-3'>
			<header className='flex items-center gap-3 w-full'>
				<Avatar className='size-20 rounded-lg'>
					<AvatarFallback className='text-2xl font-semibold uppercase rounded-lg'>CN</AvatarFallback>
					<AvatarImage
						className='outline'
						src='https://github.com/shadcn.png'
					/>
				</Avatar>

				<div>
					<h2 className='text-2xl font-semibold'>
						{contact?.firstName} {contact?.lastName}
					</h2>

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

				<DropdownMenu>
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
				</DropdownMenu>
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
									defaultValue={d.value ?? undefined}
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
						<TabletSmartphone className='inline-block size-5' /> Communication Items
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
								defaultValue={item.type?.name ?? undefined}
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
								defaultValue={item.value ?? undefined}
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

			<Card className='flex flex-col'>
				<CardHeader>
					<CardTitle className='flex items-center gap-1.5'>
						<Tags className='inline-block size-5' /> Tickets
					</CardTitle>
				</CardHeader>

				<CardContent className='grid grid-cols-2 gap-6'>
					{tickets?.map((ticket) => (
						<div
							key={ticket.id}
							className='grid grid-cols-[1fr_3fr] items-center gap-1.5'
						>
							<span>{ticket.summary}</span>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
};

export default ContactEngagementTab;
