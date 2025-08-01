import type { UniqueIdentifier } from '@dnd-kit/core';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Plus, PlusCircle, PlusCircleIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import PhaseListItem from '@/components/phase-list-item';
import TemplateCatalog from '@/components/template-catalog';
import { Button } from '@/components/ui/button';
import {
	Kanban,
	KanbanBoard,
	KanbanColumn,
	KanbanOverlay,
} from '@/components/ui/kanban';
import { Skeleton } from '@/components/ui/skeleton';
import { usePhase } from '@/hooks/use-phase';
import { useTicket } from '@/hooks/use-ticket';
import { getPhasesQuery } from '@/lib/supabase/api';
import { getPhases } from '@/lib/supabase/read';
import { isSame } from '@/lib/utils';
import { createNestedPhaseFromTemplate } from '@/utils/helpers';

export const Route = createFileRoute(
	'/_authed/proposals/$id/$version/workplan'
)({
	component: RouteComponent,
	ssr: 'data-only',
	loader: async ({ params }) =>
		await getPhases({
			data: { proposalId: params.id, versionId: params.version },
		}),
});

function RouteComponent() {
	const { id, version } = Route.useParams();
	const initialPhaseData = Route.useLoaderData();

	const { data: initialData } = useQuery({
		...getPhasesQuery(id, version),
		initialData: initialPhaseData,
	});

	const { data, handlePhaseDeletion, handlePhaseInsert, handlePhaseUpdate } =
		usePhase({
			params: { id, version },
			initialData,
		});

	const { handleTicketUpdate } = useTicket({
		initialData: data?.flatMap((p) => p.tickets ?? []) ?? [],
		phaseId: '',
		proposalId: id,
		versionId: version,
	});

	const sortedPhases =
		data?.sort((a, b) => {
			// First, compare by score in descending order
			if (Number(a.order) > Number(b.order)) return 1;
			if (Number(a.order) < Number(b.order)) return -1;

			// If scores are equal, then sort by created_at in ascending order
			return Number(a.id) - Number(b.id);
		}) ?? [];

	const phaseStub: PhaseInsert = {
		description: 'New Phase',
		hours: 0,
		order: data?.length ?? 0,
		id: useId(),
		visible: true,
		version,
		reference_id: null,
	};

	const groupedPhases: Record<UniqueIdentifier, NestedTicket[]> = {};
	sortedPhases.forEach((phase) => {
		groupedPhases[phase.id as unknown as UniqueIdentifier] =
			phase.tickets ?? [];
	});

	const [columns, setColumns] =
		useState<Partial<Record<UniqueIdentifier, NestedTicket[]>>>(
			groupedPhases
		);

	return (
		<div className='grid items-start h-full overflow-hidden border-t flex-1 min-h-0'>
			{/* <div className='p-3 flex flex-col gap-1.5 border-r overflow-y-auto min-h-0 flex-1'>
						<h2 className='font-semibold text-base'>Project Templates</h2>
		
						<Suspense
							fallback={
								<>
									{Array.from({ length: 25 }).map((_, index) => (
										<Skeleton
											key={index}
											className='w-full h-9 rounded-xl'
										/>
									))}
								</>
							}
						>
							<TemplateCatalog
								onSelect={(template) => {
									if (!template.workplan) return;
									const phases = createNestedPhaseFromTemplate(
										template.workplan,
										version,
										phaseStub.order ?? 0
									);
		
									const newColumns: Record<
										UniqueIdentifier,
										NestedTicket[]
									> = {};
									phases.forEach((phase) => {
										newColumns[
											phase.id as unknown as UniqueIdentifier
										] = phase.tickets ?? [];
									});
		
									setColumns((prevColumns) => ({
										...prevColumns,
										...newColumns,
									}));
		
									phases.forEach((phase) => {
										handlePhaseInsert({
											newPhase: phase,
											tickets: phase.tickets ?? [],
										});
									});
								}}
							/>
						</Suspense>
					</div> */}

			<div className='flex flex-col items-start w-full flex-shink p-3 space-y-3 overflow-hidden px-6'>
				<div className='w-full px-1.5 flex justify-between items-center'>
					<h1 className='text-xl font-semibold'>Workplan</h1>

					<Button
						size='sm'
						variant='outline'
						onClick={() => {
							handlePhaseInsert({
								newPhase: phaseStub,
								tickets: [],
							});
							setColumns((prevColumns) => ({
								...prevColumns,
								[phaseStub.id as unknown as UniqueIdentifier]:
									[],
							}));
						}}
					>
						<PlusCircle /> <span>Add Phase</span>
					</Button>
				</div>

				<Kanban
					value={columns}
					onValueChange={(value) => {
						setColumns(value);
						const newColumns = Object.entries(value);
						const currentColumns = Object.entries(columns);

						const arePhasesSame = isSame(
							newColumns.map(([key]) => key),
							currentColumns.map(([key]) => key)
						);

						if (arePhasesSame) {
							const ticketsToUpdate = new Map<
								string,
								TicketUpdate
							>();
							for (const [key, value] of newColumns) {
								const currentPhase = currentColumns.find(
									([phaseId]) => phaseId === key
								);

								if (!currentPhase) return;

								const currentTasks = currentPhase[1];
								const newTasks = value;

								const areTicketsSame = isSame(
									currentTasks.map((t) => t.id),
									newTasks.map((t) => t.id)
								);

								if (areTicketsSame) continue;

								newTasks.forEach((t, order) => {
									const currentTicket = currentTasks.find(
										(tt) => tt.id === t.id
									);

									if (
										currentTicket?.order === order &&
										currentTicket?.phase === key
									)
										return currentTicket;

									ticketsToUpdate.set(t.id, {
										summary: t.summary,
										order,
										phase: key,
									});
								});
							}
							Array.from(ticketsToUpdate.entries()).forEach(
								([id, ticket]) => {
									handleTicketUpdate({
										id,
										ticket,
									});
								}
							);
						} else {
							const phasesToUpdate = new Map<
								string,
								PhaseUpdate
							>();
							newColumns.forEach(([key], order) => {
								const currentPhase = sortedPhases.find(
									(phase) => phase.id === key
								);

								if (!currentPhase) return;

								if (
									currentPhase.order === order &&
									currentPhase.id === key
								)
									return;

								phasesToUpdate.set(currentPhase.id, {
									id: currentPhase.id,
									version: currentPhase.version,
									order,
								});
							});

							Array.from(phasesToUpdate.entries()).forEach(
								([id, phase]) => {
									handlePhaseUpdate({
										id,
										phase,
									});
								}
							);
						}
					}}
					getItemValue={(item) => item.id}
					autoScroll
					orientation='vertical'
				>
					<KanbanBoard>
						{Object.entries(columns).map(([columnValue, tasks]) => {
							const phase = sortedPhases.find(
								(p) => p.id === columnValue
							);

							if (!phase) return null;

							return (
								<KanbanColumn
									key={columnValue}
									value={columnValue}
									className='!bg-transparent border-none p-0'
									asChild
								>
									<div>
										<PhaseListItem
											phase={phase}
											tickets={tasks}
											handleDeletion={() =>
												handlePhaseDeletion({
													id: columnValue,
												})
											}
											handleDuplication={() => {}}
											handleUpdate={(phase) =>
												handlePhaseUpdate({
													id: columnValue,
													phase,
												})
											}
											params={{ id, version }}
										/>
									</div>
								</KanbanColumn>
							);
						})}
					</KanbanBoard>

					<KanbanOverlay>
						<div className='size-full rounded-md bg-primary/10' />
					</KanbanOverlay>
				</Kanban>

				<Button
					variant='ghost'
					size='sm'
					className='w-auto text-muted-foreground justify-start'
					onClick={() => {
						handlePhaseInsert({
							newPhase: phaseStub,
							tickets: [],
						});
						setColumns((prevColumns) => ({
							...prevColumns,
							[phaseStub.id as unknown as UniqueIdentifier]: [],
						}));
					}}
				>
					<Plus className='mr-1.5' />
					<span>Add Phase</span>
				</Button>
			</div>
		</div>
	);
}
