import { CommandMenu } from '@/components/command-menu';
import TabsList from '@/components/tabs-list';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ColoredBadge } from '@/components/ui/badge';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { linksConfig } from '@/config/links';
import { getContact } from '@/lib/manage/read';
import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { Circle } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/_authed/contacts/$id')({
	component: RouteComponent,
	loader: async ({ params }) => {
		const contact = await getContact({
			data: {
				id: Number(params.id),
				conditions: { fields: ['id', 'firstName', 'lastName', 'types', 'company'] },
			},
		});
		return { contact };
	},
});

function RouteComponent() {
	const [open, setOpen] = useState(false);
	const [dialogData, setDialogData] = useState<{
		title: string;
		description?: string;
	}>({
		title: '',
	});
	const { id } = Route.useParams();
	const { contact } = Route.useLoaderData();
	const { contactTabs } = linksConfig;

	const tabs = contactTabs.map((t) => ({ ...t, params: { id } }));

	return (
		<div className='grid gap-3'>
			<header className='flex items-center gap-3 px-3 mt-3'>
				<Avatar className='size-20'>
					<AvatarFallback className='text-2xl font-semibold uppercase'>
						{contact?.firstName?.[0]}
						{contact?.firstName?.[1]}
					</AvatarFallback>
				</Avatar>
				<div className='space-y-3'>
					<div className='flex items-center gap-3'>
						<h1 className='text-2xl font-semibold'>
							{contact?.firstName} {contact?.lastName}
						</h1>

						{contact?.types?.map((type) => (
							<ColoredBadge
								variant={type.name === 'VIP' ? 'yellow' : 'gray'}
								key={type.id + (type?.identity ?? '')}
							>
								<Circle className='size-1.5 mr-1.5 fill-inherit' /> {type.name}
							</ColoredBadge>
						))}
					</div>

					<div className='flex items-center gap-3'>
						{contact?.company && (
							<Link
								to='/companies/$id'
								params={{ id: contact.company.id.toString() }}
								className='text-sm text-muted-foreground relative grow-0 shrink hover:underline'
							>
								{contact.title
									? '${contact.title} at ${contact?.company?.name}'
									: contact?.company?.name}
							</Link>
						)}
					</div>
				</div>
			</header>

			<TabsList links={tabs} />

			<Outlet />

			<Dialog
				open={open}
				onOpenChange={setOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{dialogData.title}</DialogTitle>
						{dialogData.description && <DialogDescription>{dialogData.description}</DialogDescription>}
					</DialogHeader>

					<form>
						<div className='grid gap-3'></div>
					</form>

					<DialogFooter></DialogFooter>
				</DialogContent>
			</Dialog>

			<CommandMenu
				sections={[
					{
						heading: 'Duo',
						items: [
							{
								icon: (
									<img
										src='/duo-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Send duo prompt...',
								value: 'send-duo-prompt',
								action: () => {},
							},
						],
					},
					{
						heading: 'Timezest',
						items: [
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Schedule onsite appointment (1 hour)...',
								value: 'schedule-onsite-appointment',
								action: () => {
									setOpen(true);
									setDialogData((prev) => ({
										...prev,
										title: 'Schedule onsite appointment (1 hour)',
										description: 'Schedule an onsite appointment with the contact',
									}));
								},
							},
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Schedule phone call (1 hour)...',
								value: 'schedule-phone-call',
								action: () => {
									setOpen(true);
									setDialogData((prev) => ({
										...prev,
										title: 'Schedule phone call (1 hour)',
										description: 'Schedule a phone call with the contact',
									}));
								},
							},
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Schedule phone call (30 minutes)...',
								value: 'schedule-phone-call-30-minutes',
								action: () => {
									setOpen(true);
									setDialogData((prev) => ({
										...prev,
										title: 'Schedule phone call (30 minutes)',
										description: 'Schedule a phone call with the contact',
									}));
								},
							},
							{
								icon: (
									<img
										src='/timezest-logo.png'
										className='size-6 rounded-sm'
									/>
								),
								label: 'Strength meeting (1 hour)...',
								value: 'strength-meeting',
								action: () => {
									setOpen(true);
									setDialogData((prev) => ({
										...prev,
										title: 'Strength meeting (1 hour)',
										description: 'Schedule a strength meeting with the contact',
									}));
								},
							},
						],
					},
				]}
			/>
		</div>
	);
}
