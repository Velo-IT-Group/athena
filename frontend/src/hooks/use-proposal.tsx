import { getProposalFollowersQuery, getProposalQuery, getProposalSettingsQuery } from '@/lib/supabase/api';

import { createProposal, createProposalFollower } from '@/lib/supabase/create';
import { updateProposal, updateProposalSettings } from '@/lib/supabase/update';
import { deleteProposal } from '@/lib/supabase/delete';

import { deleteCacheItem, env, updateCacheItem } from '@/lib/utils';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

type Props = {
	id: string;
	version: string;
	initialData?: NestedProposal;
};

const useProposal = ({ id, version, initialData }: Props) => {
	const queryClient = useQueryClient();

	const query = getProposalQuery(id, version);
	const settingsQuery = getProposalSettingsQuery(id, version);

	const { queryKey: settingsQueryKey } = settingsQuery;
	const { queryKey } = query;

	const { data } = useQuery({
		...query,
		initialData,
	});

	const handleProposalSettingsUpdate = useMutation({
		mutationFn: async ({ settings }: { settings: ProposalSettingsUpdate }) =>
			updateProposalSettings({ data: { version, settings } }),
		onMutate: async (updatedItem) =>
			await updateCacheItem<ProposalSettings>(queryClient, settingsQueryKey, updatedItem.settings),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData<ProposalSettings>(
				settingsQueryKey,
				context?.previousItem ?? ({} as ProposalSettings)
			);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: settingsQueryKey,
			});
		},
	});

	const handleProposalUpdate = useMutation({
		mutationFn: async ({ proposal }: { proposal: ProposalUpdate }) => updateProposal({ data: { id, proposal } }),
		onMutate: async (updatedItem) =>
			await updateCacheItem<NestedProposal>(queryClient, queryKey, updatedItem.proposal),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData<NestedProposal>(queryKey, context?.previousItem);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const handleProposalInsert = useMutation({
		mutationFn: async ({ proposal }: { proposal: ProposalInsert }) => createProposal({ data: proposal }),
		onMutate: async ({ proposal }) => await updateCacheItem<NestedProposal>(queryClient, queryKey, proposal),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newProduct, context) => {
			queryClient.setQueryData<NestedProposal>(queryKey, context?.previousItem);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const handleProposalDeletion = useMutation({
		mutationFn: async ({ id }: { id: string }) => deleteProposal({ data: id }),
		onMutate: async ({ id }) =>
			await deleteCacheItem<NestedProposal>(queryClient, queryKey, (item) => item.id === id),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newProduct, context) => {
			queryClient.setQueryData<NestedProposal[]>(queryKey, context?.previousItems ?? []);
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
			queryClient.setQueryData<Profile[]>(queryKey, context?.previousItems ?? []);
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
