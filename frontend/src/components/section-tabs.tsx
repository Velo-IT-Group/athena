import { Button } from '@/components/ui/button';
import SectionItem from '@/components/section-item';
import { Sortable, SortableContent } from '@/components/ui/sortable';
import { Plus } from 'lucide-react';
import { useSections } from '@/hooks/use-sections';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getSections } from '@/lib/supabase/read';

type Props = {
	params: { id: string; version: string };
};

const SectionTabs = ({ params }: Props) => {
	const { data: initialData } = useSuspenseQuery({
		queryKey: ['sections', params.id, params.version],
		queryFn: () => getSections({ data: params.version }),
	});

	const { sections, handleSectionInsert, handleSectionDeletion, handleSectionUpdate } = useSections({
		initialData,
		proposalId: params.id,
		versionId: params.version,
	});

	const orderedSections = sections.sort((a, b) => {
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

	return (
		<Sortable
			value={orderedSections}
			onValueChange={(newSections) => {
				newSections.map((section, index) => {
					return handleSectionUpdate({
						id: section.id,
						section: { order: index },
					});
				});
			}}
			getItemValue={(item) => item.id}
		>
			<SortableContent asChild>
				<>
					{orderedSections.map((section) => (
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
					))}
				</>
			</SortableContent>

			<Button
				variant='ghost'
				size='sm'
				className='w-auto text-muted-foreground'
				onClick={() => handleSectionInsert(sectionStub)}
			>
				<Plus className='mr-1.5' />
				<span>Add Section</span>
			</Button>
		</Sortable>
	);
};

export default SectionTabs;
