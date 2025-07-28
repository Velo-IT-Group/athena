import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';
import TableSkeleton from '@/components/ui/data-table/skeleton';
import { columns } from '@/components/table-columns/ticket';
import { DataTable } from '@/components/ui/data-table';
import { zodValidator } from '@tanstack/zod-adapter';
import { getTicketsQuery } from '@/lib/manage/api';
import { psaConfig } from '@/utils/manage/params';
import { dataTableOptionsSchema, filterSchema } from '@/lib/utils';
import { serviceTicketSchema, type ServiceTicket } from '@/types/manage';

export const Route = createFileRoute('/_authed/tickets/')({
	component: RouteComponent,
	validateSearch: zodValidator(dataTableOptionsSchema),
});

function RouteComponent() {
	const params = Route.useSearch();

	let conditions = {
		closedFlag: false,
		parentTicketId: null,
		'board/id': [22, 26, 30, 31],
	};

	params?.filter?.forEach((f) => {
		const column = columns.find((c) => c.id === f.id);

		if (!column) return;

		if (column.meta?.type === 'text') {
			// console.log((f.value.values as Array<string>).join(','));
			conditions = Object.assign(conditions, {
				[column.meta?.filterKey as string]: {
					comparison: psaConfig.textOperators.find(
						(o) => o.label.toLowerCase() === f.value.operator
					)?.value,
					value: `'${(f.value.values as string[]).join(',') ?? ' '}'`,
				},
			});
		}

		// if (Array.isArray(f.value.values)) {
		// 	conditions = Object.assign(conditions, { [column.meta?.filterKey as string]: f.value.values });
		// }
	});

	const columnSort = columns.find((c) => c.id === params.sort?.field);

	return (
		<main className='p-3 space-y-1.5'>
			<section>
				<h1 className='text-2xl font-semibold'>Tickets</h1>
			</section>

			<Suspense fallback={<TableSkeleton columns={columns.length} />}>
				<DataTable
					columns={columns}
					options={getTicketsQuery({
						conditions,
						page: params.pagination?.page,
						pageSize: params.pagination?.pageSize,
						orderBy: {
							key:
								(columnSort?.meta
									?.sortKey as keyof ServiceTicket) ??
								'slaStatus',
							order: params.sort?.direction,
						},
					})}
					schema={serviceTicketSchema}
				/>
			</Suspense>
		</main>
	);
}
