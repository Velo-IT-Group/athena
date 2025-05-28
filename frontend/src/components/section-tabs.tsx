import { Button } from '@/components/ui/button';
import SectionItem from '@/components/section-item';
import { Sortable, SortableContent } from '@/components/ui/sortable';
import { Plus } from 'lucide-react';
import { useSections } from '@/hooks/use-sections';
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { getSections } from '@/lib/supabase/read';
import { getProductsQuery, getSectionsQuery } from '@/lib/supabase/api';
import { Kanban, KanbanBoard, KanbanColumn, KanbanOverlay } from '@/components/ui/kanban';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { useEffect, useMemo, useState } from 'react';
import { isSame } from '@/lib/utils';
import { useProduct } from '@/hooks/use-product';

type Props = {
	params: { id: string; version: string };
};

const SectionTabs = ({ params }: Props) => {
	const [{ data: initialData }, { data: initialProducts }] = useSuspenseQueries({
		queries: [getSectionsQuery(params.id, params.version), getProductsQuery(params.version)],
	});

	const { sections, handleSectionInsert, handleSectionDeletion, handleSectionUpdate } = useSections({
		initialData,
		proposalId: params.id,
		versionId: params.version,
	});

	const {
		data: products,
		handleProductUpdate,
		handleProductInsert,
		handleProductDeletion,
	} = useProduct({
		initialData: initialProducts,
		params,
	});

	console.log(
		'products',
		products.map((p) => p.extended_price)
	);

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

	const groupedSections = useMemo(() => {
		const groupedSections: Record<UniqueIdentifier, NestedProduct[]> = {};
		orderedSections.forEach((section) => {
			groupedSections[section.id as unknown as UniqueIdentifier] =
				products?.filter((p) => p.section === section.id) ?? [];
		});
		return groupedSections;
	}, [orderedSections, products]);

	const [columns, setColumns] = useState<Record<UniqueIdentifier, NestedProduct[]>>(groupedSections);

	useEffect(() => {
		setColumns(groupedSections);
	}, [groupedSections]);

	return (
		<div className='flex flex-col items-start w-full flex-shink p-3 space-y-3 overflow-hidden px-6'>
			<div className='w-full'>
				<Kanban
					value={columns}
					onValueChange={(value) => {
						setColumns(value);
						const newColumns = Object.entries(value);
						const currentColumns = Object.entries(columns);

						const areSectionsSame = isSame(
							newColumns.map(([key]) => key),
							currentColumns.map(([key]) => key)
						);

						if (areSectionsSame) {
							let ticketsToUpdate: Map<string, ProductUpdate> = new Map();
							for (const [key, value] of newColumns) {
								const currentPhase = currentColumns.find(([phaseId]) => phaseId === key);

								if (!currentPhase) return;

								const currentTasks = currentPhase[1];
								const newTasks = value;

								const areTicketsSame = isSame(
									currentTasks.map((t) => t.unique_id),
									newTasks.map((t) => t.unique_id)
								);

								if (areTicketsSame) continue;

								newTasks.forEach((t, order) => {
									const currentTicket = currentTasks.find((t) => t.id === t.id);

									if (currentTicket?.order === order && currentTicket?.section === key)
										return currentTicket;

									ticketsToUpdate.set(t.unique_id, {
										order,
										section: key,
									});
								});
							}
							Array.from(ticketsToUpdate.entries()).forEach(([id, product]) => {
								handleProductUpdate.mutate({
									id,
									product,
								});
							});
						} else {
							const phasesToUpdate: Map<string, PhaseUpdate> = new Map();
							newColumns.forEach(([key, value], order) => {
								const currentPhase = orderedSections.find((phase) => phase.id === key);

								if (!currentPhase) return;

								if (currentPhase.order === order && currentPhase.id === key) return;

								phasesToUpdate.set(currentPhase.id, {
									id: currentPhase.id,
									version: currentPhase.version,
									order,
								});
							});

							Array.from(phasesToUpdate.entries()).forEach(([id, phase]) => {
								handleSectionUpdate({
									id,
									section: {
										order: phase.order,
									},
								});
							});
						}
					}}
					getItemValue={(item) => item.unique_id}
					autoScroll
					orientation='vertical'
				>
					<KanbanBoard>
						{Object.entries(columns).map(([columnValue, sectionProducts]) => {
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
											products={sectionProducts}
											params={params}
											handleSectionUpdate={(updateSection) =>
												handleSectionUpdate({ id: section.id, section: updateSection })
											}
											handleSectionDeletion={() => handleSectionDeletion(section.id)}
											handleProductUpdate={(id, product) =>
												handleProductUpdate.mutate({ id, product })
											}
											handleProductInsert={(product, bundledItems) =>
												handleProductInsert.mutate({ product, bundledItems })
											}
											handleProductDeletion={(id) => handleProductDeletion.mutate({ id })}
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
					className='w-auto text-muted-foreground'
					onClick={() => {
						handleSectionInsert(sectionStub);
						setColumns((prevColumns) => ({
							...prevColumns,
							[sectionStub.id as unknown as UniqueIdentifier]: [],
						}));
					}}
				>
					<Plus className='mr-1.5' />
					<span>Add Section</span>
				</Button>
			</div>
		</div>
	);
};

export default SectionTabs;
