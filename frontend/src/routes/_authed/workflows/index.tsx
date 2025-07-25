import { createFileRoute, Link } from '@tanstack/react-router';

import { useQuery } from '@tanstack/react-query';
import { getWorkflows } from '@/lib/manage/read';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/table-columns/workflows';

const initialNodes = [
	{ id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
	{ id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

export const Route = createFileRoute('/_authed/workflows/')({
	component: RouteComponent,
});

function RouteComponent() {
	const { data } = useQuery({
		queryKey: ['workflows'],
		queryFn: () =>
			getWorkflows({
				data: {
					conditions: {
						activateFlag: true,
					},
				},
			}),
	});

	console.log(data);

	return (
		<DataTable
			columns={columns}
			options={{
				queryKey: ['workflows'],
				queryFn: () =>
					getWorkflows({
						data: {
							conditions: {
								activateFlag: true,
							},
						},
					}),
			}}
		/>
	);
	// <div className='flex flex-col gap-4'>
	// 	{data?.map((workflow) => (
	// 		<Link
	// 			key={workflow.id}
	// 			to='/workflows/$id'
	// 			params={{ id: workflow.id.toString() }}
	// 		>
	// 			{workflow.name}
	// 		</Link>
	// 	))}
	// </div>
}
