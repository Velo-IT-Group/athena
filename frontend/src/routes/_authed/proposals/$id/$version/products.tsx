import { Suspense } from 'react';

import { z } from 'zod';

import SectionTabs from '@/components/section-tabs';

import { createFileRoute } from '@tanstack/react-router';
import { getProductsQuery } from '@/lib/supabase/api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/manage/read';
import { createClient } from '@/lib/supabase/server';
import { createServerFn } from '@tanstack/react-start';

const getProposalProducts = createServerFn()
	.validator((version: string) => version)
	.handler(async ({ data: version }) => {
		const supabase = createClient();
		const { data: products, error } = await supabase
			.from('products')
			.select('*, products(*)')
			.eq('version', version);

		if (error) {
			throw new Error(error.message);
		}

		return JSON.parse(JSON.stringify(products));
	});

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
	const { data: products } = useSuspenseQuery({
		queryKey: ['products'],
		queryFn: async () => getProposalProducts({ data: params.version }),
	});

	const flattendProducts: Product[] = products?.flatMap((product: NestedProduct) => product.products ?? []);

	const { data: opportunityProducts } = useSuspenseQuery({
		queryKey: ['product-items'],
		queryFn: () =>
			getProducts({
				data: {
					conditions: {
						'opportunity/id': 4885,
					},
				},
			}),
	});
	// Filter bundled products to update the sub items prices
	const bundledProducts = opportunityProducts.filter((product) =>
		flattendProducts.some((p) => p && p.catalog_item === product.catalogItem.id)
	);

	console.log(bundledProducts);

	return (
		<main className='grow px-6 py-4 w-full flex flex-col items-start space-y-3'>
			<h1 className='text-2xl font-semibold'>Products</h1>

			<Suspense fallback={<div>Loading...</div>}>
				<SectionTabs params={params} />
			</Suspense>
		</main>
	);
}
