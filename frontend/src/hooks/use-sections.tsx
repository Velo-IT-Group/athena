import { getSectionsQuery } from '@/lib/supabase/api';

import { createSection } from '@/lib/supabase/create';
import { deleteSection } from '@/lib/supabase/delete';
import { updateSection } from '@/lib/supabase/update';

import { addCacheItem, deleteCacheItem, updateArrayCacheItem, updateCacheItem } from '@/lib/utils';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Props {
	proposalId: string;
	versionId: string;
	initialData: NestedSection[];
}

export const useSections = ({ proposalId, versionId, initialData }: Props) => {
	const query = getSectionsQuery(proposalId, versionId);
	const { queryKey } = query;
	const queryClient = useQueryClient();

	const { data: sections } = useQuery({
		...query,
		initialData,
	});

	const { mutate: handleSectionInsert } = useMutation({
		mutationFn: (section: SectionInsert) => createSection({ data: section }),
		onMutate: async (section) => addCacheItem<NestedSection>(queryClient, queryKey, section as NestedSection),
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(query.queryKey, context?.previousItems);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey });
		},
	});

	const { mutate: handleSectionDeletion } = useMutation({
		mutationFn: (id: string) => deleteSection({ data: id }),
		onMutate: async (id) => deleteCacheItem<NestedSection>(queryClient, queryKey, (item) => item.id === id),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			console.error(err);
			console.log(newTodo);
			queryClient.setQueryData(query.queryKey, context?.previousItems);
		},
		onSettled: async (data, err, variables, context) => {
			console.error(err);
			console.log(data);
			console.log(variables);
			console.log(context);

			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handleSectionCreation } = useMutation({
		mutationFn: (section: SectionInsert) => createSection({ data: section }),
		onMutate: async (newSection) => addCacheItem<NestedSection>(queryClient, queryKey, newSection as NestedSection),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			console.error(err);
			console.log(newTodo);
			queryClient.setQueryData(query.queryKey, context?.previousItems);
		},
		onSettled: async (data, err, variables, context) => {
			console.error(err);
			console.log(data);
			console.log(variables);
			console.log(context);

			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handleSectionUpdate } = useMutation({
		mutationFn: async ({ id, section }: { id: string; section: SectionUpdate }) =>
			updateSection({ data: { id, section } }),
		onMutate: async ({ id, section }) =>
			updateArrayCacheItem<NestedSection>(queryClient, queryKey, section, (s) => s.id === id),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(query.queryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	return {
		sections,
		handleSectionInsert,
		handleSectionDeletion,
		handleSectionCreation,
		handleSectionUpdate,
	};
};
