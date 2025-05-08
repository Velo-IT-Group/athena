import { Suspense } from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { columns } from '@/components/table-columns/ticket';

import { DataTable } from '@/components/ui/data-table';
import TableSkeleton from '@/components/ui/data-table/skeleton';

import { getTicketsQuery } from '@/lib/manage/api';

export const Route = createFileRoute('/_authed/companies/$id/tickets')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return (
		<Suspense fallback={<TableSkeleton columns={columns.length} />}>
			<DataTable
				columns={columns}
				options={getTicketsQuery({
					conditions: {
						'company/id': Number(id),
						closedFlag: false,
					},
				})}
			/>
		</Suspense>
	);
}
