import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSection } from '@/lib/supabase/create';
import { updateSection } from '@/lib/supabase/update';
import { deleteSection } from '@/lib/supabase/delete';
import { getProductsQuery, getProposalTotalsQuery, getSectionQuery } from '@/lib/supabase/api';
import { useCallback } from 'react';
import { updateCacheItem, deleteCacheItem, addCacheItem } from '@/lib/utils';

interface Props {
	initialData: NestedSection;
	params: { id: string; version: string };
}

export const useSection = ({ initialData, params }: Props) => {
	const { id } = params;

	const query = getSectionQuery(initialData.id);
	const { queryKey } = query;
	const queryClient = useQueryClient();

	const { data: section } = useQuery({
		...query,
		initialData,
	});

	const { data: products } = useQuery({
		...getProductsQuery(section.id),
		initialData: initialData.products,
	});

	const updateProposalTotals = useCallback((sections: NestedSection[]) => {
		const previousTotals = queryClient.getQueryData<ProposalTotals>(
			getProposalTotalsQuery(params.id, params.version).queryKey
		);

		const products = sections?.flatMap((s) => s.products ?? []);

		const recurringProducts = products?.filter((p) => p.recurring_flag && p.recurring_bill_cycle === 2);
		const nonRecurringProducts = products?.filter((p) => !p.recurring_flag);

		const recurringTotal = recurringProducts?.reduce((acc, p) => acc + (p.extended_price ?? 0), 0);
		const nonRecurringTotal = nonRecurringProducts?.reduce((acc, p) => acc + (p.extended_price ?? 0), 0);
		const recurringCost = recurringProducts?.reduce((acc, p) => acc + (p.extended_cost ?? 0), 0);
		const nonRecurringCost = nonRecurringProducts?.reduce((acc, p) => acc + (p.extended_cost ?? 0), 0);

		console.log(sections, previousTotals, recurringTotal, nonRecurringTotal, recurringCost, nonRecurringCost);

		if (!previousTotals) return;

		const newTotals: ProposalTotals = {
			...previousTotals,
			non_recurring_product_total: nonRecurringTotal ?? 0,
			non_recurring_product_cost: nonRecurringCost ?? 0,
			recurring_total: recurringTotal ?? 0,
			recurring_cost: recurringCost ?? 0,
			total_price:
				(previousTotals?.labor_cost ? previousTotals?.labor_cost ?? 0 : 0) +
				(nonRecurringTotal ?? 0) +
				(recurringTotal ?? 0),
		};

		queryClient.setQueryData(getProposalTotalsQuery(params.id, params.version).queryKey, newTotals);
	}, []);

	const { mutate: handleSectionUpdate } = useMutation({
		mutationFn: async (section: SectionUpdate) => updateSection({ data: { id, section } }),
		onMutate: async (section) => updateCacheItem<NestedSection>(queryClient, queryKey, section, (s) => s.id === id),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData<NestedSection[]>(queryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: createNewSection } = useMutation({
		mutationFn: (section: SectionInsert) => createSection({ data: section }),
		onMutate: async (newSection) => addCacheItem<NestedSection>(queryClient, queryKey, newSection as NestedSection),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			console.error(err);
			console.log(newTodo);
			queryClient.setQueryData<NestedSection[]>(queryKey, context?.previousItems);
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

	const { mutate: handleSectionDeletion } = useMutation({
		mutationFn: () => deleteSection({ data: id }),
		onMutate: async () => deleteCacheItem<NestedSection>(queryClient, queryKey, (s) => s.id === id),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			console.error(err);
			console.log(newTodo);
			queryClient.setQueryData<NestedSection[]>(queryKey, context?.previousItems);
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

	return {
		section,
		products,
		handleSectionUpdate,
		handleSectionInsert: createNewSection,
		handleSectionDeletion,
	};
};
