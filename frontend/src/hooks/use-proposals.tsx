import { getProposalsQuery } from '@/lib/supabase/api';
import { createProposal } from '@/lib/supabase/create';
import { deleteProposal } from '@/lib/supabase/delete';
import { updateQueryCache } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

type Props = {
	initialData?: NestedProposal[];
};

export const useProposals = ({ initialData }: Props) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const query = getProposalsQuery();
	const { queryKey } = query;

	const { data } = useQuery(query);

	const handleProposalInsert = useMutation({
		mutationFn: async ({ proposal }: { proposal: ProposalInsert }) => createProposal({ data: proposal }),
		onMutate: async ({ proposal }) => updateQueryCache(queryClient, queryKey, proposal),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newProduct, context) => {
			queryClient.setQueryData(queryKey, context?.previousItem);
		},
		onSuccess: async (data, variables, context) => {
			await navigate({ to: '/proposals/$id/$version', params: { id: data.id, version: data.version } });
		},
		onSettled: async (x, y, z, b) => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const handleProposalDeletion = useMutation({
		mutationFn: async ({ id }: { id: string }) => deleteProposal({ data: id }),
		onMutate: async ({ id }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const { data: previousItems } = queryClient.getQueryData<{ data: NestedProposal[]; count: number }>(
				queryKey
			) ?? {
				data: [],
				count: 0,
			};

			const newItems: NestedProposal[] = [...previousItems.filter((p) => p.id !== id)];

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, newItems);

			// Return a context with the previous and new items
			return { previousItems, newItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newProduct, context) => {
			queryClient.setQueryData(queryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
		onSuccess: async () => {
			await navigate({ to: '/proposals' });
		},
	});

	return { data, handleProposalInsert, handleProposalDeletion };
};
