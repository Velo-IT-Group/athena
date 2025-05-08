import { createPinnedItem, createVersion } from '@/lib/supabase/create';
import { deletePinnedItem } from '@/lib/supabase/delete';
import { getPinnedItems } from '@/lib/supabase/read';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

type Props = {};

export const usePinnedItems = (props: Props) => {
	const queryClient = useQueryClient();
	const queryKey = ['pinned_items'];

	const { data } = useQuery({
		queryKey,
		queryFn: () => getPinnedItems() as Promise<PinnedItem[]>,
		staleTime: Infinity,
	});

	const handlePinnedItemCreation = useMutation({
		mutationKey: ['pinned_items', 'create'],
		mutationFn: async ({ pinnedItem }: { pinnedItem: PinnedItemInsert }) =>
			await createPinnedItem({
				data: pinnedItem,
			}),
		onMutate: async () => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			const previousItems = queryClient.getQueryData<PinnedItem[]>(queryKey) ?? [];

			return { previousItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(queryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const handlePinnedItemDeletion = useMutation({
		mutationKey: ['pinned_items', 'delete'],
		mutationFn: (id: string) => deletePinnedItem({ data: id }),
		onMutate: async () => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			const previousItems = queryClient.getQueryData<PinnedItem[]>(queryKey) ?? [];

			return { previousItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(['pinned_items'], context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	return {
		pinnedItems: data,
		handlePinnedItemCreation,
		handlePinnedItemDeletion,
	};
};
