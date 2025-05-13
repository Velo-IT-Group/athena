import { Plus } from 'lucide-react';
import { createFileRoute, Link } from '@tanstack/react-router';

import Search from '@/components/search';

import { buttonVariants } from '@/components/ui/button';

import { Suspense } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { getProposalsQuery } from '@/lib/supabase/api';
import { columns } from '@/components/table-columns/proposal';
import TableSkeleton from '@/components/ui/data-table/skeleton';

export const Route = createFileRoute('/_authed/proposals/')({
	component: Proposals,
	search: {},
});

function Proposals() {
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
					options={getProposalsQuery()}
					columns={columns}
					hideFilter
				/>
			</Suspense>
		</main>
	);
}
