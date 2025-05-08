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
	const queryClient = useQueryClient();
	const sectionQueryKey = ['proposals', proposalId, versionId, 'sections'];

	const { data: sections } = useQuery({
		queryKey: sectionQueryKey,
		queryFn: () => getSections({ data: versionId }) as Promise<NestedSection[]>,
		initialData,
	});

	const { mutate: handleSectionInsert } = useMutation({
		mutationFn: (section: SectionInsert) => createSection({ data: section }),
		onMutate: async (section) => updateArrayQueryCache(queryClient, sectionQueryKey, section),
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(sectionQueryKey, context?.previousItems);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: sectionQueryKey });
		},
	});

	const { mutate: handleSectionDeletion } = useMutation({
		mutationFn: (id: string) => deleteSection({ data: id }),
		onMutate: async (id) => {
			console.log('CREATE NEW SECTION', id);
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: sectionQueryKey,
			});

			// Snapshot the previous value
			const previousItems = queryClient.getQueryData<Section[]>(sectionQueryKey) ?? [];

			const newItems = previousItems.filter((s) => s.id !== id);

			console.log(newItems);

			// Optimistically update to the new value
			queryClient.setQueryData<Section[]>(sectionQueryKey, newItems);

			// Return a context with the previous and new todo
			return { previousItems, newItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			console.error(err);
			console.log(newTodo);
			queryClient.setQueryData(sectionQueryKey, context?.previousItems);
		},
		onSettled: async (data, err, variables, context) => {
			console.error(err);
			console.log(data);
			console.log(variables);
			console.log(context);

			await queryClient.invalidateQueries({
				queryKey: sectionQueryKey,
			});
		},
	});

	const { mutate: handleSectionCreation } = useMutation({
		mutationFn: (section: SectionInsert) => createSection({ data: section }),
		onMutate: async (newSection) => updateArrayQueryCache(queryClient, sectionQueryKey, newSection),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			console.error(err);
			console.log(newTodo);
			queryClient.setQueryData(sectionQueryKey, context?.previousItems);
		},
		onSettled: async (data, err, variables, context) => {
			console.error(err);
			console.log(data);
			console.log(variables);
			console.log(context);

			await queryClient.invalidateQueries({
				queryKey: sectionQueryKey,
			});
		},
	});

	const { mutate: handleSectionUpdate } = useMutation({
		mutationFn: async ({ id, section }: { id: string; section: SectionUpdate }) =>
			updateSection({ data: { id, section } }),
		onMutate: async ({ id, section }) =>
			updateArrayQueryCache(queryClient, sectionQueryKey, section, (s) => s.id === id),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(sectionQueryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: sectionQueryKey,
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
