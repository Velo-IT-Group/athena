import { createFileRoute } from '@tanstack/react-router';
import WorkplanBuilder from '@/components/workplan-builder';
import { Suspense } from 'react';

export const Route = createFileRoute('/_authed/proposals/$id/$version/workplan')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id, version } = Route.useParams();

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<WorkplanBuilder params={{ id, version }} />
		</Suspense>
	);
}
