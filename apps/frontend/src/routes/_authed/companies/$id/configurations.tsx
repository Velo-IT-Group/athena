import { columns } from '@/components/table-columns/configuration';
import { DataTable } from '@/components/ui/data-table';
import TableSkeleton from '@/components/ui/data-table/skeleton';
import { getConfigurationsQuery } from '@/lib/manage/api';
import { getConfigurations, getTickets } from '@/lib/manage/read';
import type { Configuration } from '@/types/manage';
import type { Conditions } from '@/utils/manage/params';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/_authed/companies/$id/configurations')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return (
		<Suspense fallback={<TableSkeleton columns={columns.length} />}>
			<DataTable
				columns={columns}
				options={getConfigurationsQuery({
					conditions: {
						'company/id': Number(id),
						'status/id': [2],
					},
				})}
			/>
		</Suspense>
	);
}
