import SectionTabs from '@/components/section-tabs';
import { Separator } from '@/components/ui/separator';
import { getCatalogItems } from '@/lib/manage/read';
import { getProposal, getSections } from '@/lib/supabase/read';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import { z } from 'zod';

const addProductSchema = z.object({
	addProduct: z.string().optional(),
	section: z.string().optional(),
});

export const Route = createFileRoute('/_authed/proposals/$id/$version/products')({
	component: RouteComponent,
	validateSearch: addProductSchema,
	loader: async ({ params, ...props }) => {
		console.log(props);
		const [{ data: catalogItems, count }, proposal, sections] = await Promise.all([
			getCatalogItems(),
			getProposal({ data: params.id }),
			getSections({ data: params.version }),
		]);

		if (!proposal) {
			throw new Error('Proposal not found');
		}

		return { catalogItems, proposal, sections, count };
	},
});

function RouteComponent() {
	const params = Route.useParams();

	return (
		<main className='grow px-6 py-4 w-full flex flex-col items-start space-y-3'>
			<h1 className='text-2xl font-semibold'>Products</h1>

			{/* <Separator /> */}

			<Suspense fallback={<div>Loading...</div>}>
				<SectionTabs params={params} />
			</Suspense>
		</main>
	);
}
