import { getPinnedItemsQuery } from '@/lib/supabase/api';
import { createPinnedItem } from '@/lib/supabase/create';
import { deletePinnedItem } from '@/lib/supabase/delete';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const usePinnedItems = () => {
	const queryClient = useQueryClient();
	const queryKey = ['pinned_items'];

	const { data } = useQuery(getPinnedItemsQuery());

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
		data,
		handlePinnedItemCreation,
		handlePinnedItemDeletion,
	};
};
