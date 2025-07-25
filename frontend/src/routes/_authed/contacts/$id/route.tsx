import { Highlights } from '@/components/highlights';
import LabeledInput from '@/components/labeled-input';
import QueryList from '@/components/query-list';
import RecordDetail, { RecordDetailProps } from '@/components/record-detail';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, ColoredBadge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
	Editable,
	EditableInput,
	EditablePreview,
} from '@/components/ui/editable';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { linksConfig } from '@/config/links';
import {
	getCompanySitesQuery,
	getConfigurationsCountQuery,
	getContactQuery,
	getTicketsCountQuery,
} from '@/lib/manage/api';
import { getEngagementsQuery } from '@/lib/supabase/api';
import { slug } from '@/lib/utils';
import { RecordDetailsHeader } from '@/routes/_authed/companies/$id/route';
import { useSuspenseQueries } from '@tanstack/react-query';
import {
	createFileRoute,
	Link,
	Outlet,
	useLocation,
} from '@tanstack/react-router';
import {
	AtSign,
	BriefcaseBusinessIcon,
	Building,
	Circle,
	Contact,
	Facebook,
	FilePlus,
	IdCard,
	ImagePlus,
	LayoutGrid,
	Linkedin,
	MailPlus,
	MapPin,
	Phone,
	Star,
	Twitter,
	UserPlus,
	Workflow,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/_authed/contacts/$id')({
	component: RouteComponent,
});

function RouteComponent() {
	const pathname = useLocation({ select: (l) => l.pathname });
	const navigate = Route.useNavigate();

	const [open, setOpen] = useState(false);
	const [dialogData, setDialogData] = useState<{
		title: string;
		description?: string;
	}>({
		title: '',
	});
	const { id } = Route.useParams();
	const [
		{ data: contact },
		{ data: ticketCount },
		{ data: configurationCount },
		{
			data: { count: engagementCount },
		},
	] = useSuspenseQueries({
		queries: [
			getContactQuery(Number(id), { fields: undefined }),
			getTicketsCountQuery({
				conditions: {
					'contact/id': Number(id),
					closedFlag: false,
				},
			}),
			getConfigurationsCountQuery({
				conditions: {
					'contact/id': Number(id),
					activeFlag: true,
				},
			}),
			getEngagementsQuery({
				contactId: Number(id),
			}),
		],
	});
	const { contactTabs } = linksConfig;

	const fullName = `${contact?.firstName ?? ''} ${contact?.lastName ?? ''}`;

	const getBadgeCount = (
		title: string | undefined
	): string | number | undefined => {
		switch (title) {
			case 'Overview':
				return undefined;
			case 'Tickets':
				return ticketCount.count;
			case 'Engagements':
				return engagementCount;
			case 'Configurations':
				return configurationCount.count;
			default:
				return '-';
		}
	};

	const tabs = contactTabs.map((t) => ({
		...t,
		params: { id },
		badge: getBadgeCount(t.title),
	}));

	const details: RecordDetailProps[] = [
		{
			icon: IdCard,
			title: 'Name',
			value: fullName,
			children: (
				<form className='flex flex-col gap-3 py-3 pl-3 pr-4'>
					<LabeledInput
						label='First Name'
						defaultValue={contact?.firstName}
					/>
					<LabeledInput
						label='Last Name'
						defaultValue={contact?.lastName}
					/>
				</form>
			),
		},
		{
			icon: AtSign,
			title: 'Email addresses',
			value: (
				<div className='w-full relative'>
					<div className='w-full'>
						<div className='px- py-[5px]'>
							<div className='flex items-center justify-start gap-1 min-w-0'>
								{contact?.communicationItems
									?.filter(
										(i) => i.communicationType === 'Email'
									)
									?.map((item) => (
										<ColoredBadge
											key={item.id}
											variant='blue'
											className='truncate'
										>
											<a href={`mailto:${item.value}`}>
												{item.value}
											</a>
										</ColoredBadge>
									))}
							</div>
						</div>
					</div>
				</div>
			),
			children: (
				<form className='flex flex-col gap-3 py-3 pl-3 pr-4'>
					{/* <LabeledInput
						label='First Name'
						defaultValue={contact?.firstName}
					/>
					<LabeledInput
						label='Last Name'
						defaultValue={contact?.lastName}
					/> */}
				</form>
			),
		},
		{
			icon: Building,
			title: 'Company',
			value: (
				<Link
					to='/companies/$id'
					params={{ id: contact?.company!.id!.toString() }}
				>
					<Badge
						variant='outline'
						className='h-5 pr-1.5 pl-1'
					>
						<Avatar className='size-3'>
							<AvatarFallback>V</AvatarFallback>
							<AvatarImage
								className='size-3'
								src='https://img.logo.dev/velomethod.com?token=pk_We89CNc6T1-QRD4CkOUhww'
							/>
						</Avatar>
						<span>{contact?.company?.name}</span>
					</Badge>
				</Link>
			),
		},
		{
			icon: BriefcaseBusinessIcon,
			title: 'Job title',
			value: contact.title,
		},
		{
			icon: Phone,
			title: 'Phone number',
			value: (
				<div className='w-full relative'>
					<div className='w-full'>
						<div className='px- py-[5px]'>
							<div className='flex items-center justify-start gap-1 min-w-0'>
								{contact?.communicationItems
									?.filter(
										(i) => i.communicationType === 'Phone'
									)
									?.map((item) => (
										<ColoredBadge
											key={item.id}
											variant='blue'
											className='truncate'
										>
											<a href={`tel:${item.value}`}>
												{item.value}
											</a>
										</ColoredBadge>
									))}
							</div>
						</div>
					</div>
				</div>
			),
		},
		{
			icon: MapPin,
			title: 'Primary site',
			value: contact.site?.name,
			children: (
				<Command>
					<CommandInput placeholder='Find a site...' />
					<CommandList>
						<QueryList
							options={getCompanySitesQuery(contact.company.id, {
								conditions: {
									name: { value: `''`, comparison: '!=' },
								},
							})}
							itemView={(site) => (
								<CommandItem value={site.id}>
									{site.name}
								</CommandItem>
							)}
						/>
					</CommandList>
				</Command>
			),
		},
		{
			icon: Twitter,
			title: 'Twitter',
			value: (
				<a
					href={contact.twitterUrl}
					className='text-primary relative after:absolute after:bottom-0 after:left-0 after:bg-primary after:rounded-sm after:h-[1px] after:w-full after:block'
					target='_blank'
				>
					{slug(contact.twitterUrl)}
				</a>
			),
		},
		{
			icon: Linkedin,
			title: 'LinkedIn',
			value: (
				<a
					href={contact.linkedInUrl}
					className='text-primary relative after:absolute after:bottom-0 after:left-0 after:bg-primary after:rounded-sm after:h-[1px] after:w-full after:block'
					target='_blank'
				>
					{slug(contact.linkedInUrl)}
				</a>
			),
		},
	];

	return (
		<div className='flex flex-col w-full h-[calc(100vh-var(--navbar-height))]'>
			<div className='py-[10px] px-[12px] flex justify-between items-center gap-10 border-b'>
				<div className='flex items-center justify-start min-w-[300px] gap-0'>
					<div className='flex items-center justify-start gap-[6px]'>
						<Avatar className='size-[28px]'>
							<AvatarFallback>V</AvatarFallback>
							<AvatarImage
								className='size-[28px]'
								src='https://img.logo.dev/velomethod.com?token=pk_We89CNc6T1-QRD4CkOUhww'
							/>
						</Avatar>

						<Editable
							defaultValue={fullName}
							autosize
						>
							<EditablePreview
								className={buttonVariants({
									variant: 'ghost',
									className: 'px-[4px] py-[6px]',
								})}
							/>

							<EditableInput
								className='px-[4px] py-[6px] text-[16px] font-semibold h-9 border-none'
								asChild
							>
								<div className='flex items-center gap-1.5'>
									<Input
										// className='px-[4px] py-[6px] text-[16px] font-semibold h-9'
										className='sm:w-fit'
										defaultValue={contact?.firstName}
									/>
									<Input
										// className='px-[4px] py-[6px] text-[16px] font-semibold h-9'
										className='sm:w-fit'
										defaultValue={contact?.lastName}
									/>
								</div>
							</EditableInput>
						</Editable>
					</div>

					<Button
						size='icon'
						variant='ghost'
					>
						<Star size={14} />
					</Button>
				</div>

				<div className='flex items-center gap-2'>
					<Button
						variant='outline'
						size='sm'
					>
						<MailPlus />
						<span>Compose email</span>
					</Button>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
							>
								<MailPlus />
								<span className='sr-only'>Add to list</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Add to list</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
								onClick={() =>
									navigate({
										// to: '/',
										search: {
											modal: 'note',
											id: contact?.id?.toString(),
										},
									})
								}
							>
								<FilePlus />
								<span className='sr-only'>New note</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>New note</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
							>
								<Workflow />
								<span className='sr-only'>Run to workflow</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Run to workflow</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant='outline'
								size='icon'
							>
								<ImagePlus />
								<span className='sr-only'>Add to list</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent>Add to list</TooltipContent>
					</Tooltip>

					<Dialog>
						<DialogTrigger asChild>
							<Button
								variant='outline'
								size='sm'
							>
								<Phone />
								<span>Call</span>
							</Button>
						</DialogTrigger>
					</Dialog>
				</div>
			</div>

			<div className='flex flex-[1_1_auto]'>
				<div className='flex flex-[1_1_auto] min-w-[350px] w-[61.803%]'>
					<Highlights tabs={tabs}>
						<Outlet />
					</Highlights>
				</div>

				<div className='flex flex-[1_1_auto] min-w-[250px] w-[38.197%]'>
					<div className='w-full flex flex-col items-start justify-start gap-0'>
						<RecordDetailsHeader />
						{/* <RecordDetails /> */}
						<div className='flex flex-col w-full overflow-x-hidden overflow-y-auto'>
							<ScrollArea className='flex flex-col w-full h-full overflow-hidden'>
								<div className='flex flex-col items-stretch justify-start gap-0'>
									<div className='mx-3 border-b'>
										{details.map((detail, index) => (
											<RecordDetail
												icon={detail.icon}
												title={detail.title}
												value={detail.value}
												key={`${detail.title}-${index}`}
											>
												{detail.children}
											</RecordDetail>
										))}
									</div>
								</div>
							</ScrollArea>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
