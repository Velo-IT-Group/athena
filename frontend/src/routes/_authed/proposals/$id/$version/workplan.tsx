import TemplateCatalog from '@/components/template-catalog';

import type { ProjectTemplate } from '@/types/manage';

import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';

import { createFileRoute } from '@tanstack/react-router';
import { usePhase } from '@/hooks/use-phase';
import WorkplanBuilder from '@/components/workplan-builder';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { createNestedPhaseFromTemplate } from '@/utils/helpers';

export const Route = createFileRoute('/_authed/proposals/$id/$version/workplan')({
	component: RouteComponent,
});

function RouteComponent() {
	const { id, version } = Route.useParams();

	const { handlePhaseInsert } = usePhase({
		params: { id, version },
	});

	return (
		<DndContext
			onDragEnd={(dragEvent: DragEndEvent) => {
				const template = dragEvent.active.data.current as ProjectTemplate;
				if (!template.workplan) return;
				const phases = createNestedPhaseFromTemplate(template.workplan, version, 0);
				phases.map((phase) => {
					const tickets = phase.tickets ?? [];
					delete phase.tickets;
					const newPhase: PhaseInsert = {
						...phase,
						version,
					};

					handlePhaseInsert({
						newPhase,
						tickets,
					});
				});
			}}
		>
			<main className='grid grid-cols-[288px_1fr] items-start overflow-hidden border-t'>
				<div className='p-3 space-y-1.5 border-r'>
					<h2 className='font-semibold text-base'>Project Templates</h2>

					{/* {Array.from({ length: 25 }).map((_, index) => (
						<Skeleton
							key={index}
							className='w-full h-9 rounded-xl'
						/>
					))} */}
					<Suspense
						fallback={
							<div>
								{Array.from({ length: 25 }).map((_, index) => (
									<Skeleton
										key={index}
										className='w-full h-9 rounded-xl'
									/>
								))}
							</div>
						}
					>
						<TemplateCatalog />
					</Suspense>
				</div>

				<WorkplanBuilder params={{ id, version }} />
			</main>
		</DndContext>
	);
}
