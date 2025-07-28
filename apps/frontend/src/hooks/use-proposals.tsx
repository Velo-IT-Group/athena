import { getProposalFollowersQuery, getProposalSettingsQuery, getProposalsQuery } from '@/lib/supabase/api';

import { deleteProposal } from '@/lib/supabase/delete';
import { createProposal, createProposalFollower, createVersion } from '@/lib/supabase/create';
import { updateProposal, updateProposalSettings } from '@/lib/supabase/update';

import { addCacheItem, deleteCacheItem, env, updateArrayCacheItem, updateCacheItem } from '@/lib/utils';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useNavigate } from '@tanstack/react-router';

interface Props {
	initialData?: NestedProposal[];
}

export const useProposals = ({ initialData }: Props) => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const query = getProposalsQuery();

	const { queryKey } = query;

	const {
		data: { data },
	} = useQuery({ ...query, initialData: { data: initialData || [], count: initialData?.length ?? 0 } });

	const handleProposalInsert = useMutation({
		mutationFn: async ({ proposal }: { proposal: ProposalInsert }) => createProposal({ data: proposal }),
		onMutate: async ({ proposal }) =>
			await addCacheItem<NestedProposal>(queryClient, queryKey, proposal as NestedProposal),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newProduct, context) => {
			queryClient.setQueryData<NestedProposal[]>(queryKey, context?.previousItems ?? []);
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
		onMutate: async ({ id }) => deleteCacheItem<NestedProposal>(queryClient, queryKey, (item) => item.id === id),
		// Cancel any outgoing refetches
		// (so they don't overwrite our optimistic update)
		onError: (err, newProduct, context) => {
			queryClient.setQueryData<NestedProposal[]>(queryKey, context?.previousItems ?? []);
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

	const handleBulkProposalDeletion = useMutation({
		mutationFn: async ({ id }: { id: string[] }) => deleteProposal({ data: id }),
		meta: {
			invalidatesQueries: ['proposals'],
			successMessage: 'Proposals deleted',
			errorMessage: 'Failed to delete proposals',
		},
	});

	const handleProposalUpdate = useMutation({
		mutationFn: async ({ id, proposal }: { id?: string; proposal: ProposalUpdate | ProposalUpdate[] }) =>
			updateProposal({ data: { id, proposal } }),
		meta: {
			invalidatesQueries: ['proposals'],
			successMessage: 'Proposals updated',
			errorMessage: 'Failed to update proposals',
		},
		// onMutate: async ({ id, proposal }) =>
		// 	updateArrayCacheItem<NestedProposal>(queryClient, queryKey, proposal, (item) => item.id === id),
		// onError: (err, newProduct, context) => {
		// 	queryClient.setQueryData<NestedProposal[]>(queryKey, context?.previousItems ?? []);
		// },
		// onSettled: async () => {
		// 	await queryClient.invalidateQueries({
		// 		queryKey,
		// 	});
		// },
	});

	const handleProposalSettingsUpdate = useMutation({
		mutationFn: async ({
			id,
			version,
			settings,
		}: {
			id: string;
			version: string;
			settings: ProposalSettingsUpdate;
		}) => updateProposalSettings({ data: { version, settings } }),
		onMutate: async ({ id, version, settings }) => {
			const settingsQuery = getProposalSettingsQuery(id, version);
			const { queryKey: settingsQueryKey } = settingsQuery;

			return updateCacheItem<ProposalSettings>(queryClient, settingsQueryKey, settings);
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, { id, version }, context) => {
			const settingsQuery = getProposalSettingsQuery(id, version);
			const { queryKey: settingsQueryKey } = settingsQuery;
			queryClient.setQueryData<ProposalSettings>(settingsQueryKey, context?.previousItem);
		},
		onSettled: async (_, __, { id, version }) => {
			const settingsQuery = getProposalSettingsQuery(id, version);
			const { queryKey: settingsQueryKey } = settingsQuery;
			await queryClient.invalidateQueries({
				queryKey: settingsQueryKey,
			});
		},
	});

	const handleProposalConversion = useMutation({
		mutationFn: async ({ id, version }: { id: string; version: string }) =>
			await fetch(`${env.VITE_SUPABASE_URL}/functions/v1/convert-proposal-to-project`, {
				method: 'POST',
				body: JSON.stringify({
					proposalId: id,
					versionId: version,
				}),
			}),
		onMutate: async ({ id }) =>
			updateArrayCacheItem<NestedProposal>(
				queryClient,
				queryKey,
				{ ...(data?.find((item) => item.id === id) ?? {}), is_getting_converted: true },
				(item) => item.id === id
			),
		onError: (err, newProduct, context) => {
			if (!context) return;
			queryClient.setQueryData<NestedProposal[]>(queryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const handleAddingFollower = useMutation({
		mutationFn: async ({ id, user }: { id: string; version: string; user: Profile }) =>
			await createProposalFollower({ data: { proposal_id: id, user_id: user.id } }),
		onMutate: async ({ id, version, user }) => {
			const followersQuery = getProposalFollowersQuery(id, version);
			const { queryKey: followersQueryKey } = followersQuery;
			return await addCacheItem<Profile>(queryClient, followersQueryKey, user);
		},
		onError: (err, { id, version }, context) => {
			const followersQuery = getProposalFollowersQuery(id, version);
			const { queryKey: followersQueryKey } = followersQuery;
			queryClient.setQueryData<Profile[]>(followersQueryKey, context?.previousItems);
		},
		onSettled: async (_, __, { id, version }) => {
			const followersQuery = getProposalFollowersQuery(id, version);
			const { queryKey: followersQueryKey } = followersQuery;
			await queryClient.invalidateQueries({
				queryKey: followersQueryKey,
			});
		},
	});

	const handleNewVersion = useMutation({
		mutationFn: async ({ id }: { id: string }) => await createVersion({ data: id }),
		onSuccess: (data, variables, context) => {
			navigate({
				to: '/proposals/$id/$version',
				params: {
					id: variables.id,
					version: data,
				},
			});
		},
	});

	return {
		data,
		handleProposalInsert,
		handleProposalDeletion,
		handleBulkProposalDeletion,
		handleProposalUpdate,
		handleProposalSettingsUpdate,
		handleProposalConversion,
		handleAddingFollower,
	};
};
