import { createProposal } from '@/lib/supabase/create';
import { deleteProposal } from '@/lib/supabase/delete';
import { getProposal } from '@/lib/supabase/read';
import { updateProposal, updateProposalSettings } from '@/lib/supabase/update';
import { updateQueryCache } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';

type Props = {
	id: string;
	version: string;
	initialData?: NestedProposal;
};

const useProposal = ({ id, version, initialData }: Props) => {
	const queryClient = useQueryClient();
	const queryKey = ['proposals', id, version];

	const { data } = useSuspenseQuery({
		queryKey,
		queryFn: () => getProposal({ data: id }) as Promise<NestedProposal>,
		initialData,
	});

	const { mutate: handleProposalSettingsUpdate } = useMutation({
		mutationFn: async ({ settings }: { settings: ProposalSettingsUpdate }) =>
			updateProposalSettings({ data: { version, settings } }),
		onMutate: async (updatedItem) =>
			updateQueryCache(queryClient, queryKey.push('settings') as unknown as string[], updatedItem.settings),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(queryKey, context?.previousItem);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handleProposalUpdate } = useMutation({
		mutationFn: async ({ proposal }: { proposal: ProposalUpdate }) => updateProposal({ data: { id, proposal } }),
		onMutate: async (updatedItem) => updateQueryCache(queryClient, queryKey, updatedItem.proposal),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(queryKey, context?.previousItem);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handleProposalInsert } = useMutation({
		mutationFn: async ({ proposal }: { proposal: ProposalInsert }) => createProposal({ data: proposal }),
		onMutate: async ({ proposal }) => updateQueryCache(queryClient, queryKey, proposal),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newProduct, context) => {
			queryClient.setQueryData(queryKey, context?.previousItem);
		},
		onSettled: async () => {
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
			const previousItems = queryClient.getQueryData<NestedProposal[]>(queryKey) ?? [];

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
	});

	return { data, handleProposalUpdate, handleProposalSettingsUpdate, handleProposalInsert, handleProposalDeletion };
};

export default useProposal;
