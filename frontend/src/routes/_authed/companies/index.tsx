import { columns } from '@/components/table-columns/company';
import { DataTable } from '@/components/ui/data-table';
import TableSkeleton from '@/components/ui/data-table/skeleton';
import { getCompaniesQuery } from '@/lib/manage/api';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/_authed/companies/')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className='p-3 space-y-1.5'>
			<section>
				<h1 className='text-2xl font-semibold'>Companies</h1>
			</section>

			<Suspense
				fallback={
					<TableSkeleton
						columns={columns.length}
						rows={10}
					/>
				}
			>
				<DataTable
					options={getCompaniesQuery()}
					columns={columns}
				/>
			</Suspense>
		</main>
	);
}
