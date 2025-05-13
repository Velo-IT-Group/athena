import { Suspense } from 'react';

import { z } from 'zod';

import SectionTabs from '@/components/section-tabs';

import { createFileRoute } from '@tanstack/react-router';

const addProductSchema = z.object({
	addProduct: z.string().optional(),
	section: z.string().optional(),
});

export const Route = createFileRoute('/_authed/proposals/$id/$version/products')({
	component: RouteComponent,
	validateSearch: addProductSchema,
});

function RouteComponent() {
	const params = Route.useParams();

	return (
		<main className='grow px-6 py-4 w-full flex flex-col items-start space-y-3'>
			<h1 className='text-2xl font-semibold'>Products</h1>

			<Suspense fallback={<div>Loading...</div>}>
				<SectionTabs params={params} />
			</Suspense>
		</main>
	);
}
