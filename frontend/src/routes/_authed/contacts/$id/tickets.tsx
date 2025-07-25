import { columns } from '@/components/table-columns/ticket';
import { DataTable } from '@/components/ui/data-table';
import TableSkeleton from '@/components/ui/data-table/skeleton';
import { getTicketsQuery } from '@/lib/manage/api';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/_authed/contacts/$id/tickets')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return (
		<div className='overlfow-x-hidden'>
			<Suspense fallback={<TableSkeleton columns={columns.length} />}>
				<DataTable
					columns={columns}
					options={getTicketsQuery({
						conditions: {
							parentTicketId: null,
							'board/id': [22, 26, 30, 31],
							'contact/id': Number(id),
						},
					})}
				/>
			</Suspense>
		</div>
	);
}
