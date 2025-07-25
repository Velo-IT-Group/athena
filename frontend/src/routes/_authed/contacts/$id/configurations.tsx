import { createFileRoute } from '@tanstack/react-router';

import { columns } from '@/components/table-columns/configuration';
import { DataTable } from '@/components/ui/data-table';

import { getConfigurationsQuery } from '@/lib/manage/api';
import { Suspense } from 'react';
import TableSkeleton from '@/components/ui/data-table/skeleton';

export const Route = createFileRoute('/_authed/contacts/$id/configurations')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return (
		<Suspense
			fallback={
				<TableSkeleton
					columns={columns.length}
					rows={25}
				/>
			}
		>
			<DataTable
				columns={columns}
				options={getConfigurationsQuery({
					conditions: {
						'contact/id': Number(id),
						'status/id': [2],
					},
				})}
			/>
		</Suspense>
	);
}
