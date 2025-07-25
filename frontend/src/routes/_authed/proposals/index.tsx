import { Plus } from 'lucide-react';
import { createFileRoute, Link } from '@tanstack/react-router';

import Search from '@/components/search';

import { buttonVariants } from '@/components/ui/button';

import { Suspense } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { getProposalsQuery } from '@/lib/supabase/api';
import { columns } from '@/components/table-columns/proposal';
import TableSkeleton from '@/components/ui/data-table/skeleton';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { filterSchema } from '@/lib/utils';

export const Route = createFileRoute('/_authed/proposals/')({
	component: Proposals,
	validateSearch: zodValidator(z.object({ filter: filterSchema.optional() })),
});

function Proposals() {
	const { filter } = Route.useSearch();
	console.log('not triggering actions');

	return (
		<main className='p-6 space-y-6'>
			<section className='flex items-center justify-between'>
				<h1 className='text-2xl font-semibold'>Proposals</h1>

				<Link
					to='/proposals/new/blank'
					className={buttonVariants()}
				>
					<Plus /> <span>Create Proposal</span>
				</Link>
			</section>

			<section>
				<Search
					baseUrl='/proposals'
					placeholder='Find a proposal'
					className='rounded-full shadow-none'
				/>
			</section>

			<Suspense fallback={<TableSkeleton columns={columns.length} />}>
				<DataTable
					options={getProposalsQuery({ searchText: filter?.[0]?.value?.values?.[0] || '' })}
					columns={columns}
					hideFilter
				/>
			</Suspense>
		</main>
	);
}
