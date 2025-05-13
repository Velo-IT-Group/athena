import PhaseListItem from '@/components/phase-list-item';
import { Button } from '@/components/ui/button';
import { Sortable, SortableContent, SortableOverlay } from '@/components/ui/sortable';
import { usePhase } from '@/hooks/use-phase';
import { getPhasesQuery } from '@/lib/supabase/api';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Plus, PlusCircleIcon } from 'lucide-react';

type Props = {
	params: { id: string; version: string };
};

const WorkplanBuilder = ({ params }: Props) => {
	const { id, version } = params;

	const { data: initialData } = useSuspenseQuery(getPhasesQuery(id, version));

	const { data, handlePhaseDeletion, handlePhaseInsert, handlePhaseUpdate } = usePhase({
		initialData,
		params: { id, version },
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
		id: crypto.randomUUID(),
		visible: true,
		version,
		reference_id: null,
	};

	// const [phases, setPhases] = useState(sortedPhases);

	return (
		<div className='flex flex-col items-start w-full flex-shink p-3 space-y-3 overflow-hidden px-6'>
			<div className='w-full px-1.5 flex justify-between items-center'>
				<h1 className='text-xl font-semibold'>Workplan</h1>

				<Button
					size='sm'
					variant='secondary'
					onClick={() =>
						handlePhaseInsert({
							newPhase: phaseStub,
							tickets: [],
						})
					}
				>
					<PlusCircleIcon className='mr-1.5' /> Add Phase
				</Button>
			</div>

			<Sortable
				value={sortedPhases}
				onValueChange={(newPhases) => {
					newPhases.map((phase, index) =>
						handlePhaseUpdate({
							id: phase.id,
							phase: { order: index },
						})
					);
				}}
				getItemValue={(item) => item.id}
				autoScroll
			>
				<SortableContent asChild>
					<>
						{sortedPhases.map((phase) => (
							<PhaseListItem
								key={phase.id}
								params={params}
								phase={phase}
								tickets={phase.tickets ?? []}
								handleDeletion={() =>
									handlePhaseDeletion({
										id: phase.id,
									})
								}
								handleDuplication={() => {}}
								handleUpdate={(updatePhase) =>
									handlePhaseUpdate({
										id: phase.id,
										phase: updatePhase,
									})
								}
							/>
						))}
					</>
				</SortableContent>

				<SortableOverlay>
					<div className='size-full rounded-none bg-muted/10' />
				</SortableOverlay>
			</Sortable>

			<Button
				variant='ghost'
				size='sm'
				className='w-auto text-muted-foreground justify-start'
				onClick={() =>
					handlePhaseInsert({
						newPhase: phaseStub,
						tickets: [],
					})
				}
			>
				<Plus className='mr-1.5' />
				<span>Add Phase</span>
			</Button>
		</div>
	);
};

export default WorkplanBuilder;
