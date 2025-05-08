import { createEngagementNote } from '@/lib/supabase/create';
import { getEngagement, getEngagementNotes } from '@/lib/supabase/read';
import { updateArrayQueryCache } from '@/lib/utils';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';

type Props = {
	id: string;
	initialData?: {
		engagement: Engagement;
		notes: EngagementNote[];
	};
};

const useEngagement = ({ id, initialData }: Props) => {
	const queryClient = useQueryClient();
	const engagementsQueryKey = ['engagements', id];
	const engagementNotesQueryKey = ['engagement-notes', id];

	const [engagement, notes] = useQueries({
		queries: [
			{
				queryKey: engagementsQueryKey,
				queryFn: () => getEngagement({ data: id }),
				initialData,
			},
			{
				queryKey: engagementNotesQueryKey,
				queryFn: () => getEngagementNotes({ data: id }),
				initialData,
			},
		],
	});

	const handleCreateEngagementNote = useMutation({
		mutationFn: (note: EngagementNoteInsert) => createEngagementNote({ data: note }),
		onMutate: async (note) =>
			await updateArrayQueryCache(queryClient, engagementNotesQueryKey, note, (item) => item.id === note.id),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newPhase, context) => {
			queryClient.setQueryData(engagementNotesQueryKey, context?.previousItems || []);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: engagementNotesQueryKey,
			});
		},
	});

	return {
		engagement,
		notes,
		handleCreateEngagementNote,
	};
};

export default useEngagement;
