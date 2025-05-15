import { useCurrentUser } from '@/hooks/use-current-user';
import { getProposalFollowersQuery, getProposalQuery } from '@/lib/supabase/api';
import { createProposal, createProposalFollower } from '@/lib/supabase/create';
import { deleteProposal } from '@/lib/supabase/delete';
import { updateProposal, updateProposalSettings } from '@/lib/supabase/update';
import { env, updateQueryCache } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type Props = {
	id: string;
	version: string;
	initialData?: NestedProposal;
};

const useProposal = ({ id, version, initialData }: Props) => {
	const queryClient = useQueryClient();
	const query = getProposalQuery(id, version);
	const { queryKey } = query;

	const { data } = useQuery({
		...query,
		initialData,
		refetchIntervalInBackground: true,
		refetchInterval: (query) => (!!query.state.data?.is_getting_converted ? 2000 : false),
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

	const handleProposalConversion = useMutation({
		mutationFn: async ({ id }: { id: string }) =>
			await fetch(`${env.VITE_SUPABASE_URL}/functions/v1/convert-proposal-to-project`, {
				method: 'POST',
				body: JSON.stringify({
					proposalId: id,
					versionId: version,
				}),
			}),
		onMutate: async ({ id }) => {
			await queryClient.cancelQueries({
				queryKey,
			});

			const previousItem = queryClient.getQueryData<NestedProposal>(queryKey);

			if (!previousItem) return;

			queryClient.setQueryData(queryKey, {
				...((previousItem ?? {}) as NestedProposal),
				is_getting_converted: true,
			});

			return { previousItem };
		},
		onError: (err, newProduct, context) => {
			queryClient.setQueryData(queryKey, context?.previousItem);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const handleAddingFollower = useMutation({
		mutationFn: async ({ user }: { user: Profile }) =>
			await createProposalFollower({ data: { proposal_id: id, user_id: user.id } }),
		onMutate: async ({ user }) => {
			const queryKey = getProposalFollowersQuery(id, version).queryKey;

			await queryClient.cancelQueries({
				queryKey,
			});

			const previousItems = queryClient.getQueryData<Profile[]>(queryKey);

			if (!previousItems) return;

			queryClient.setQueryData(queryKey, [...previousItems, user]);

			return { previousItems };
		},
		onError: (err, newProduct, context) => {
			queryClient.setQueryData(queryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	return {
		data,
		handleProposalUpdate,
		handleProposalSettingsUpdate,
		handleProposalInsert,
		handleProposalDeletion,
		handleProposalConversion,
		handleAddingFollower,
	};
};

export default useProposal;
