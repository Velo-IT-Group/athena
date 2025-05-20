import { Button } from '@/components/ui/button';
import SectionItem from '@/components/section-item';
import { Sortable, SortableContent } from '@/components/ui/sortable';
import { Plus } from 'lucide-react';
import { useSections } from '@/hooks/use-sections';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getSections } from '@/lib/supabase/read';
import { getSectionsQuery } from '@/lib/supabase/api';
import { Kanban, KanbanBoard, KanbanColumn, KanbanOverlay } from '@/components/ui/kanban';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { useState } from 'react';

type Props = {
	params: { id: string; version: string };
};

const SectionTabs = ({ params }: Props) => {
	const { data: initialData } = useSuspenseQuery(getSectionsQuery(params.id, params.version));

	const { sections, handleSectionInsert, handleSectionDeletion, handleSectionUpdate } = useSections({
		initialData,
		proposalId: params.id,
		versionId: params.version,
	});

	const orderedSections = sections?.sort((a, b) => {
		// First, compare by score in descending order
		if (Number(a.order) > Number(b.order)) return 1;
		if (Number(a.order) < Number(b.order)) return -1;

		// If scores are equal, then sort by created_at in ascending order
		return Number(a.id) - Number(b.id);
		// return new Date(a.=).getTime() - new Date(b.created_at).getTime();
	});

	const sectionStub: SectionInsert = {
		id: crypto.randomUUID(),
		name: 'New Section',
		created_at: new Date().toISOString(),
		version: params.version,
		order: orderedSections.length,
	};

	const groupedSections: Record<UniqueIdentifier, NestedProduct[]> = {};
	orderedSections.forEach((section) => {
		groupedSections[section.id as unknown as UniqueIdentifier] = section.products ?? [];
	});

	const [columns, setColumns] = useState<Record<UniqueIdentifier, NestedProduct[]>>(groupedSections);

	return (
		<Kanban
			value={columns}
			// onValueChange={(value) => {
			// 	const newColumns = Object.entries(value);
			// 	const currentColumns = Object.entries(columns);

			// 	setColumns(value);

			// 	const arePhasesSame = isSame(
			// 		newColumns.map(([key]) => key),
			// 		currentColumns.map(([key]) => key)
			// 	);

			// 	if (arePhasesSame) {
			// 		let ticketsToUpdate: Map<string, TicketUpdate> = new Map();
			// 		for (const [key, value] of newColumns) {
			// 			const currentPhase = currentColumns.find(([phaseId]) => phaseId === key);

			// 			if (!currentPhase) return;

			// 			const currentTasks = currentPhase[1];
			// 			const newTasks = value;

			// 			const areTicketsSame = isSame(
			// 				currentTasks.map((t) => t.id),
			// 				newTasks.map((t) => t.id)
			// 			);

			// 			if (areTicketsSame) continue;

			// 			newTasks.forEach((t, order) => {
			// 				const currentTicket = currentTasks.find((t) => t.id === t.id);

			// 				if (currentTicket?.order === order && currentTicket?.phase === key)
			// 					return currentTicket;

			// 				ticketsToUpdate.set(t.id, {
			// 					summary: t.summary,
			// 					order,
			// 					phase: key,
			// 				});
			// 			});
			// 		}
			// 		Array.from(ticketsToUpdate.entries()).forEach(([id, ticket]) => {
			// 			handleTicketUpdate({
			// 				id,
			// 				ticket,
			// 			});
			// 		});
			// 	} else {
			// 		const phasesToUpdate: Map<string, PhaseUpdate> = new Map();
			// 		newColumns.forEach(([key, value], order) => {
			// 			const currentPhase = sortedPhases.find((phase) => phase.id === key);

			// 			if (!currentPhase) return;

			// 			if (currentPhase.order === order && currentPhase.id === key) return;

			// 			phasesToUpdate.set(currentPhase.id, {
			// 				id: currentPhase.id,
			// 				version: currentPhase.version,
			// 				order,
			// 			});
			// 		});

			// 		Array.from(phasesToUpdate.entries()).forEach(([id, phase]) => {
			// 			handlePhaseUpdate({
			// 				id,
			// 				phase,
			// 			});
			// 		});
			// 	}
			// }}
			getItemValue={(item) => item.id}
			autoScroll
			orientation='vertical'
		>
			<KanbanBoard>
				<KanbanBoard>
					{Object.entries(columns).map(([columnValue, tasks]) => {
						const section = orderedSections.find((p) => p.id === columnValue);

						if (!section) return null;

						return (
							<KanbanColumn
								key={columnValue}
								value={columnValue}
								className='bg-background border-none p-0'
								asChild
							>
								<div>
									<SectionItem
										key={section.id}
										section={section}
										order={section.order}
										params={params}
										handleSectionInsert={handleSectionInsert}
										handleSectionUpdate={(updateSection) =>
											handleSectionUpdate({ id: section.id, section: updateSection })
										}
										handleSectionDeletion={() => handleSectionDeletion(section.id)}
									/>
								</div>
							</KanbanColumn>
						);
					})}
				</KanbanBoard>

				<KanbanOverlay>
					<div className='size-full rounded-md bg-primary/10' />
				</KanbanOverlay>
			</KanbanBoard>
		</Kanban>
		// <Sortable
		// 	value={orderedSections}
		// 	onValueChange={(newSections) => {
		// 		newSections.map((section, index) => {
		// 			return handleSectionUpdate({
		// 				id: section.id,
		// 				section: { order: index },
		// 			});
		// 		});
		// 	}}
		// 	getItemValue={(item) => item.id}
		// >
		// 	<SortableContent asChild>
		// 		<>
		// 			{orderedSections.map((section) => (
		// <SectionItem
		// 	key={section.id}
		// 	section={section}
		// 	order={section.order}
		// 	params={params}
		// 	handleSectionInsert={handleSectionInsert}
		// 	handleSectionUpdate={(updateSection) =>
		// 		handleSectionUpdate({ id: section.id, section: updateSection })
		// 	}
		// 	handleSectionDeletion={() => handleSectionDeletion(section.id)}
		// />
		// 			))}
		// 		</>
		// 	</SortableContent>

		// 	<Button
		// 		variant='ghost'
		// 		size='sm'
		// 		className='w-auto text-muted-foreground'
		// 		onClick={() => handleSectionInsert(sectionStub)}
		// 	>
		// 		<Plus className='mr-1.5' />
		// 		<span>Add Section</span>
		// 	</Button>
		// </Sortable>
	);
};

export default SectionTabs;
