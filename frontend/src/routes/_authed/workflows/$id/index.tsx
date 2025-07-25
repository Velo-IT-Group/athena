import { createFileRoute } from '@tanstack/react-router';
import React, { useCallback } from 'react';

import { useQuery } from '@tanstack/react-query';
import { getWorkflowEvents } from '@/lib/manage/read';

export const Route = createFileRoute('/_authed/workflows/$id/')({
	component: RouteComponent,
});

const initialNodes = [
	{ id: '1', position: { x: 0, y: 0 }, data: { label: '1' } },
	{ id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

function RouteComponent() {
	// const { data } = useQuery({
	// 	queryKey: ['workflows', Route.useParams().id, 'events'],
	// 	queryFn: () =>
	// 		getWorkflowEvents({
	// 			data: {
	// 				id: Route.useParams().id,
	// 				params: {},
	// 			},
	// 		}),
	// });

	// console.log(data);

	// const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	// const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

	// const onConnect = useCallback(
	// 	(params) => setEdges((eds) => addEdge(params, eds)),
	// 	[setEdges]
	// );

	return (
		<></>
		// <pre>{JSON.stringify(data, null, 2)}</pre>
		// <div
		// 	style={{
		// 		width: 'calc(100vw - var(--sidebar-width-icon))',
		// 		height: 'calc(100vh - var(--navbar-height))',
		// 	}}
		// >
		// 	<ReactFlow
		// 		nodes={nodes}
		// 		edges={edges}
		// 		onNodesChange={onNodesChange}
		// 		onEdgesChange={onEdgesChange}
		// 		onConnect={onConnect}
		// 	>
		// 		<Controls />
		// 		<MiniMap />
		// 		<Background
		// 			variant='dots'
		// 			gap={12}
		// 			size={1}
		// 		/>
		// 	</ReactFlow>
		// </div>
	);
}
