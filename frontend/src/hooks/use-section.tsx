'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSection } from '@/lib/supabase/create';
import { getProducts, getSection, getSections } from '@/lib/supabase/read';
import { updateSection } from '@/lib/supabase/update';
import { deleteSection } from '@/lib/supabase/delete';
import { updateQueryCache } from '@/lib/utils';

type Props = {
	initialData: NestedSection;
	params: { id: string; version: string };
};

export const useSection = ({ initialData, params }: Props) => {
	const { id } = params;

	const queryClient = useQueryClient();
	const sectionQueryKey = ['sections', params.id, params.version];
	const productsQueryKey = ['products', params.id, params.version];

	const { data: section } = useQuery({
		queryKey: sectionQueryKey,
		queryFn: () => getSection({ data: params.version }) as Promise<NestedSection>,
		initialData,
	});

	const { data: products } = useQuery({
		queryKey: productsQueryKey,
		queryFn: () => getProducts({ data: params.version }) as Promise<NestedProduct[]>,
		initialData: initialData.products,
	});

	const { mutate: handleSectionUpdate } = useMutation({
		mutationFn: async (section: SectionUpdate) => updateSection({ data: { id, section } }),
		onMutate: async (section) => updateQueryCache(queryClient, sectionQueryKey, section),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(sectionQueryKey, context?.previousItem);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: sectionQueryKey,
			});
		},
	});

	const { mutate: createNewSection } = useMutation({
		mutationFn: (section: SectionInsert) => createSection({ data: section }),
		onMutate: async (newSection) => {
			console.log('CREATE NEW SECTION', newSection);
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: sectionQueryKey,
			});

			// Snapshot the previous value
			const previousTodo = queryClient.getQueryData<Section[]>(sectionQueryKey) ?? [];

			const newT = [...previousTodo, newSection];

			console.log(newT);

			// Optimistically update to the new value
			// @ts-expect-error - Throwing error because of the type mismatch
			queryClient.setQueryData<Section[]>(sectionQueryKey, newT);

			// Return a context with the previous and new todo
			return { previousTodo, newTodo: newT };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			console.error(err);
			console.log(newTodo);
			queryClient.setQueryData(sectionQueryKey, context?.previousTodo);
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

	const { mutate: handleSectionDeletion } = useMutation({
		mutationFn: () => deleteSection({ data: id }),
		onMutate: async () => {
			console.log('CREATE NEW SECTION', id);
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: sectionQueryKey,
			});

			// Snapshot the previous value
			const previousTodo = queryClient.getQueryData<Section[]>(sectionQueryKey) ?? [];

			const newT = previousTodo.filter((s) => s.id !== id);

			console.log(newT);

			// Optimistically update to the new value
			queryClient.setQueryData<Section[]>(sectionQueryKey, newT);

			// Return a context with the previous and new todo
			return { previousTodo, newTodo: newT };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			console.error(err);
			console.log(newTodo);
			queryClient.setQueryData(sectionQueryKey, context?.previousTodo);
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

	return {
		section,
		products,
		handleSectionUpdate,
		handleSectionInsert: createNewSection,
		handleSectionDeletion,
	};
};
