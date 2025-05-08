import { Suspense } from 'react';
import { columns } from '@/components/table-columns/contact';
import { DataTable, dataTableFilterQuerySchema } from '@/components/ui/data-table';
import TableSkeleton from '@/components/ui/data-table/skeleton';
import { getContacts } from '@/lib/manage/read';
import { createFileRoute } from '@tanstack/react-router';
import { getContactsQuery } from '@/lib/manage/api';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';
import type { Contact } from '@/types/manage';
import { psaConfig, type Conditions } from '@/utils/manage/params';

export const Route = createFileRoute('/_authed/contacts/')({
	component: RouteComponent,
	validateSearch: zodValidator(z.object({ filter: dataTableFilterQuerySchema.optional() })),
});

function RouteComponent() {
	const params = Route.useSearch();

	console.log(params);

	var conditions: Conditions<Contact> = {};

	params?.filter?.forEach((f) => {
		const column = columns.find((c) => c.id === f.id);

		if (!column) return;

		if (column.meta?.type === 'text') {
			// console.log((f.value.values as Array<string>).join(','));
			conditions = Object.assign(conditions, {
				[column.meta?.filterKey as string]: {
					comparison: psaConfig.textOperators.find((o) => o.label.toLowerCase() === f.value.operator)?.value,
					value: `'${(f.value.values as Array<string>).join(',') ?? ' '}'`,
				},
			});
		}

		// if (Array.isArray(f.value.values)) {
		// 	conditions = Object.assign(conditions, { [column.meta?.filterKey as string]: f.value.values });
		// }
	});

	console.log(conditions);

	return (
		<main className='p-3 space-y-1.5'>
			<section>
				<h1 className='text-2xl font-semibold'>Contacts</h1>
			</section>

			<Suspense
				fallback={
					<TableSkeleton
						columns={columns.length}
						rows={25}
					/>
				}
			>
				<DataTable
					options={getContactsQuery({
						conditions,
					})}
					columns={columns}
				/>
			</Suspense>
		</main>
	);
}
