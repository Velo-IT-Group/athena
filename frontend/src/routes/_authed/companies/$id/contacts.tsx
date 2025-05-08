import { columns } from '@/components/table-columns/contact';
import { DataTable } from '@/components/ui/data-table';
import TableSkeleton from '@/components/ui/data-table/skeleton';
import { getContactsQuery } from '@/lib/manage/api';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/_authed/companies/$id/contacts')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return (
		<Suspense fallback={<TableSkeleton columns={columns.length} />}>
			<DataTable
				columns={columns}
				options={getContactsQuery({
					conditions: {
						'company/id': Number(id),
					},
				})}
			/>
		</Suspense>
	);
}
