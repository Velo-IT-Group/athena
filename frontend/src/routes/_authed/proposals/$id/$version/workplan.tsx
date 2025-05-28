import { createFileRoute } from '@tanstack/react-router';
import WorkplanBuilder from '@/components/workplan-builder';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export const Route = createFileRoute('/_authed/proposals/$id/$version/workplan')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id, version } = Route.useParams();

	return (
		<Suspense
			fallback={
				<div className='grid grid-cols-[288px_1fr] items-start h-full overflow-hidden border-t flex-1 min-h-0'>
					<div className='p-3 flex flex-col gap-1.5 border-r overflow-y-auto min-h-0 flex-1'>
						<h2 className='font-semibold text-base'>Project Templates</h2>

						{Array.from({ length: 25 }).map((_, index) => (
							<Skeleton
								key={index}
								className='w-full h-9 rounded-xl'
							/>
						))}
					</div>

					<div className='flex flex-col items-start w-full flex-shink p-3 space-y-3 overflow-hidden px-6'>
						<div className='w-full px-1.5 flex justify-between items-center'>
							<h1 className='text-xl font-semibold'>Workplan</h1>

							<Button
								size='sm'
								variant='secondary'
								disabled
							>
								<PlusCircle className='mr-1.5' /> Add Phase
							</Button>
						</div>
					</div>
				</div>
			}
		>
			<WorkplanBuilder params={{ id, version }} />
		</Suspense>
	);
}
