import ConversationHistory from '@/components/conversation-history';
import OpenProjects from '@/components/open-projects';
import OpenProjectsSkeleton from '@/components/open-projects/skeleton';
import SOPExceptions from '@/components/sop-exceptions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense } from 'react';

export const Route = createFileRoute('/_authed/companies/$id/')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();

	return (
		<section className='grid grid-cols-[2.5fr_1fr] gap-3 !px-0'>
			<Suspense fallback={<div>Loading...</div>}>
				<SOPExceptions companyId={Number(id)} />
			</Suspense>

			<Suspense
				fallback={
					<Card>
						<CardHeader>
							<CardTitle>Activity Log</CardTitle>
						</CardHeader>
						<CardContent className='p-3 space-y-3'>
							<Skeleton className='h-3.5 w-full' />
							<Skeleton className='h-3 w-3/4' />
							<Skeleton className='h-3 w-1/2' />
							<Skeleton className='h-3 w-1/4' />
						</CardContent>
					</Card>
				}
			>
				<ConversationHistory companyId={Number(id)} />
			</Suspense>

			<Suspense fallback={<OpenProjectsSkeleton />}>
				<OpenProjects companyId={Number(id)} />
			</Suspense>
		</section>
	);
}
