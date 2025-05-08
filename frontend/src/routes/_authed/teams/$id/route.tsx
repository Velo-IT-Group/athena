import TabsList from '@/components/tabs-list';
import { linksConfig } from '@/config/links';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authed/teams/$id')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<TabsList
				links={linksConfig.teamTabs}
				className='px-3 mt-1.5 border-b'
			/>

			<main className='p-3'>
				<Outlet />
			</main>
		</>
	);
}
