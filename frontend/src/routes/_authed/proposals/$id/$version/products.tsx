import { Suspense } from 'react';

import { z } from 'zod';

import SectionTabs from '@/components/section-tabs';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { createFileRoute } from '@tanstack/react-router';
import { ChevronUp } from 'lucide-react';

const addProductSchema = z.object({
	addProduct: z.string().optional(),
	section: z.string().optional(),
});

export const Route = createFileRoute(
	'/_authed/proposals/$id/$version/products'
)({
	component: RouteComponent,
	validateSearch: addProductSchema,
});

function RouteComponent() {
	const { invoice } = Route.useRouteContext();

	console.log(invoice.lines.data);

	return (
		<main className='grow px-6 py-4 w-full flex flex-col items-start space-y-3'>
			<h1 className='text-2xl font-semibold'>Products</h1>

			<Suspense
				fallback={
					<div className='w-full'>
						{Array.from({ length: 10 }).map((_, index) => (
							<div
								key={index}
								className='h-12 flex items-center'
							>
								<Button
									variant='ghost'
									size='icon'
								>
									{/* <ChevronUp /> */}
								</Button>

								<Button
									variant='ghost'
									size='icon'
								>
									<ChevronUp />
								</Button>

								<Skeleton className='h-6 w-48' />
							</div>
						))}
					</div>
				}
			>
				<SectionTabs params={Route.useParams()} />
			</Suspense>
		</main>
	);
}
