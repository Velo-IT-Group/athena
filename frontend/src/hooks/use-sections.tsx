import { getSectionsQuery } from '@/lib/supabase/api';
import { createSection } from '@/lib/supabase/create';
import { deleteSection } from '@/lib/supabase/delete';
import { getSections } from '@/lib/supabase/read';
import { updateSection } from '@/lib/supabase/update';
import { updateArrayQueryCache, updateQueryCache } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';

type Props = {
	proposalId: string;
	versionId: string;
	initialData: NestedSection[];
};

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
		onMutate: async (section) => updateArrayQueryCache(queryClient, query.queryKey, section),
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(query.queryKey, context?.previousItems);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey });
		},
	});

	const { mutate: handleSectionDeletion } = useMutation({
		mutationFn: (id: string) => deleteSection({ data: id }),
		onMutate: async (id) => {
			console.log('CREATE NEW SECTION', id);
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousItems = queryClient.getQueryData<Section[]>(query.queryKey) ?? [];

			const newItems = previousItems.filter((s) => s.id !== id);

			console.log(newItems);

			// Optimistically update to the new value
			queryClient.setQueryData<Section[]>(query.queryKey, newItems);

			// Return a context with the previous and new todo
			return { previousItems, newItems };
		},
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
		onMutate: async (newSection) => updateArrayQueryCache(queryClient, query.queryKey, newSection),
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
			updateArrayQueryCache(queryClient, query.queryKey, section, (s) => s.id === id),
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
