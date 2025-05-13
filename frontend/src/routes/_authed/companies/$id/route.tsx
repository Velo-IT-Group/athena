import CompanyHeader from '@/components/company-header';
import TabsList from '@/components/tabs-list';
import { linksConfig } from '@/config/links';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/_authed/companies/$id')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { companyTabs } = linksConfig;

	const tabs = companyTabs.map((t) => ({ ...t, params: { id } }));

	return (
		<>
			<Suspense fallback={<div>Loading...</div>}>
				<CompanyHeader id={id} />
			</Suspense>

			<TabsList
				links={tabs}
				className='border-b w-full mt-3 mx-3'
			/>

			<main className='p-3'>
				<Outlet />
			</main>
		</>
	);
}
