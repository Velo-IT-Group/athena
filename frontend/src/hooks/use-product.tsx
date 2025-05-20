'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createProduct } from '@/lib/supabase/create';
import { deleteProduct } from '@/lib/supabase/delete';
import { updateProduct } from '@/lib/supabase/update';

import { getProposalTotalsQuery, getSectionProductsQuery, getSectionsQuery } from '@/lib/supabase/api';
import { useCallback } from 'react';
import { addCacheItem, updateCacheItem } from '@/lib/utils';

type Props = {
	initialData: NestedProduct[];
	params: { id: string; version: string };
	sectionId: string;
};

export const useProduct = ({ initialData, params, sectionId }: Props) => {
	const query = getSectionProductsQuery({
		proposalId: params.id,
		versionId: params.version,
		sectionId,
	});
	const { queryKey } = query;
	const queryClient = useQueryClient();

	const { data } = useQuery(query);

	const updateProposalTotals = useCallback((newProduct: NestedProduct) => {
		const previousTotals = queryClient.getQueryData<ProposalTotals>(
			getProposalTotalsQuery(params.id, params.version).queryKey
		);
		const proposalSections = queryClient.getQueryData<NestedSection[]>(
			getSectionsQuery(params.id, params.version).queryKey
		);

		const products = proposalSections?.flatMap((s) => s.products ?? []);
		const allProducts = [...(products?.filter((p) => p.unique_id !== newProduct.unique_id) ?? []), newProduct];

		const recurringProducts = allProducts?.filter((p) => p.recurring_flag && p.recurring_bill_cycle === 2);
		const nonRecurringProducts = allProducts?.filter((p) => !p.recurring_flag);

		const recurringTotal = recurringProducts?.reduce((acc, p) => acc + (p.extended_price ?? 0), 0);
		const nonRecurringTotal = nonRecurringProducts?.reduce((acc, p) => acc + (p.extended_price ?? 0), 0);
		const recurringCost = recurringProducts?.reduce((acc, p) => acc + (p.extended_cost ?? 0), 0);
		const nonRecurringCost = nonRecurringProducts?.reduce((acc, p) => acc + (p.extended_cost ?? 0), 0);
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

	const { mutate: handleProductUpdate } = useMutation({
		mutationFn: async ({ id, product }: { id: string; product: ProductUpdate }) =>
			updateProduct({ data: { id, product } }),
		onMutate: async ({ id, product }) => {
			const previousTodo = queryClient.getQueryData<NestedProduct[]>(queryKey) ?? [];

			const updatedProduct = previousTodo?.find((s) => s.unique_id === id);

			// @ts-expect-error types are seperate
			const newProduct: Product = {
				...updatedProduct,
				...product,
				extended_price:
					(product.quantity ?? updatedProduct?.quantity ?? 0) * (product.price ?? updatedProduct?.price ?? 0),
				extended_cost:
					(product.quantity ?? updatedProduct?.quantity ?? 0) * (product.cost ?? updatedProduct?.cost ?? 0),
				calculated_price:
					(product.quantity ?? updatedProduct?.quantity ?? 0) * (product.price ?? updatedProduct?.price ?? 0),
				calculated_cost:
					(product.quantity ?? updatedProduct?.quantity ?? 0) * (product.cost ?? updatedProduct?.cost ?? 0),
			};

			updateProposalTotals(newProduct);

			return updateCacheItem<NestedProduct>(queryClient, queryKey, newProduct, (p) => p.unique_id === id);
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

	const { mutate: handleProductInsert } = useMutation({
		mutationFn: async ({ product, bundledItems }: { product: ProductInsert; bundledItems?: ProductInsert[] }) =>
			createProduct({ data: { product, bundledItems } }),
		onMutate: async ({ product, bundledItems }) =>
			addCacheItem<NestedProduct>(queryClient, queryKey, {
				...product,
				products: bundledItems,
			}),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newProduct, context) => {
			queryClient.setQueryData([queryKey], context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const { mutate: handleProductDeletion } = useMutation({
		mutationFn: async ({ id }: { id: string }) => deleteProduct({ data: id }),
		onMutate: async ({ id }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey,
			});

			// Snapshot the previous value
			const previousItems = queryClient.getQueryData<NestedProduct[]>(queryKey) ?? [];

			const newItems: NestedProduct[] = [...previousItems.filter((p) => p.unique_id !== id)];

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

	return {
		data,
		handleProductUpdate,
		handleProductInsert,
		handleProductDeletion,
	};
};
