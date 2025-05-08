import { Plus } from 'lucide-react';
import { createFileRoute, Link } from '@tanstack/react-router';

import Search from '@/components/search';
import NewProposalForm from '@/components/new-proposal-form';

import { Button, buttonVariants } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';

import { useProposals } from '@/hooks/use-proposals';

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
