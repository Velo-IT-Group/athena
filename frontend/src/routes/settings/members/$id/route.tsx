import LabeledInput from '@/components/labeled-input';
import TabsList from '@/components/tabs-list';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getProfile } from '@/lib/supabase/read';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { formatDate } from 'date-fns';
import { DoorClosed, Pencil, SquareUser } from 'lucide-react';

export const Route = createFileRoute('/settings/members/$id')({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = Route.useNavigate();
	const { id } = Route.useParams();
	const { edit } = Route.useSearch();

	const { data } = useSuspenseQuery({
		queryKey: ['profiles', id],
		queryFn: () => getProfile({ data: id }),
	});

	const overviewData = [
		{
			label: 'Username',
			value: data.username,
		},
		{
			label: 'Job Title',
			value: 'Full Stack Developer',
		},
		{
			label: 'Groups',
			value: (
				<div className='flex items-center gap-1.5'>
					<Button
						variant='link'
						className='px-0 underline'
					>
						Engineering
					</Button>
					•
					<Button
						variant='link'
						className='px-0 underline'
					>
						Product
					</Button>
				</div>
			),
		},
		{
			label: 'Start Date',
			value: formatDate(new Date(), 'MMM dd, yyyy'),
		},
		{
			label: 'Status',
			value: 'Current',
		},
		{
			label: 'Account Type',
			value: (
				<div className='flex items-center gap-1.5'>
					<DoorClosed />
					<span>Employee</span>
				</div>
			),
		},
		{
			label: 'Access',
			value: (
				<div className='flex items-center gap-1.5'>
					<SquareUser />
					<span>Member</span>
				</div>
			),
		},
		{
			label: 'Access',
			value: 'n/a',
		},
	];

	return (
		<main className='space-y-6'>
			<header className='flex items-center gap-1.5 w-full'>
				<Avatar>
					<AvatarFallback>
						{data.first_name?.[0]}
						{data.last_name?.[0]}
					</AvatarFallback>
				</Avatar>

				<h1 className='text-2xl font-semibold'>
					{data.first_name} {data.last_name}
				</h1>

				<p className='text-sm text-muted-foreground'>Last updated 12 hours ago</p>

				{edit === true ? (
					<Button
						className='ml-auto'
						onClick={() => navigate({ to: '/settings/members/$id' })}
					>
						Save
					</Button>
				) : (
					<Button
						className='ml-auto'
						variant='secondary'
						onClick={() => navigate({ to: '/settings/members/$id', search: () => ({ edit: true }) })}
					>
						<Pencil />
						<span>Edit details</span>
					</Button>
				)}
			</header>

			<section>
				<Card>
					<CardContent className='grid grid-cols-4 gap-3'>
						{overviewData.map((item) => (
							<LabeledInput
								key={item.label}
								label={item.label}
							>
								{typeof item.value === 'string' ? <p>{item.value}</p> : item.value}
							</LabeledInput>
						))}
					</CardContent>
				</Card>
			</section>

			<TabsList
				links={[
					{ title: 'Profile', icon: SquareUser, to: '/settings/members/$id', params: { id } },
					{ title: 'Accounts', icon: SquareUser, to: '/settings/members/$id', params: { id } },
				]}
			/>

			<Outlet />
		</main>
	);
}
