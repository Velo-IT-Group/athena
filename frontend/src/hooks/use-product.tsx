'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createProduct } from '@/lib/supabase/create';
import { deleteProduct } from '@/lib/supabase/delete';
import { updateProduct } from '@/lib/supabase/update';

import { getProductsQuery, getProposalTotalsQuery, getSectionsQuery } from '@/lib/supabase/api';
import { useCallback } from 'react';
import { addCacheItem, deleteCacheItem, updateArrayCacheItem } from '@/lib/utils';

type Props = {
	initialData: NestedProduct[];
	params: { id: string; version: string };
};

export const useProduct = ({ initialData, params }: Props) => {
	const query = getProductsQuery(params.version);
	const { queryKey } = query;
	const queryClient = useQueryClient();

	const { data: products } = useQuery({ ...query, initialData });

	const updateProposalTotals = useCallback((allProducts: NestedProduct[]) => {
		const previousTotals = queryClient.getQueryData<ProposalTotals>(
			getProposalTotalsQuery(params.id, params.version).queryKey
		);

		const recurringProducts = allProducts?.filter((p) => p.recurring_flag && p.recurring_bill_cycle === 2);
		const nonRecurringProducts = allProducts?.filter((p) => !p.recurring_flag);

		const recurringTotal = recurringProducts?.reduce((acc, p) => acc + (p.quantity ?? 0) * (p.price ?? 0), 0);
		const nonRecurringTotal = nonRecurringProducts?.reduce((acc, p) => acc + (p.quantity ?? 0) * (p.price ?? 0), 0);
		const recurringCost = recurringProducts?.reduce((acc, p) => acc + (p.quantity ?? 0) * (p.cost ?? 0), 0);
		const nonRecurringCost = nonRecurringProducts?.reduce((acc, p) => acc + (p.quantity ?? 0) * (p.cost ?? 0), 0);

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

	const handleProductUpdate = useMutation({
		mutationFn: async ({ id, product }: { id: string; product: ProductUpdate }) =>
			updateProduct({ data: { id, product } }),
		onMutate: async ({ id, product }) => {
			const previousTodo = queryClient.getQueryData<NestedProduct[]>(queryKey) ?? [];

			const updatedProduct = previousTodo?.find((s) => s.unique_id === id);

			if (!updatedProduct) throw new Error('Product not found');

			const newProduct: NestedProduct = {
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

			const cachedData = await updateArrayCacheItem<NestedProduct>(
				queryClient,
				queryKey,
				newProduct,
				(p) => p.unique_id === id
			);

			updateProposalTotals(cachedData.newItems);

			return cachedData;
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

	const handleProductInsert = useMutation({
		mutationFn: async ({ product, bundledItems }: { product: ProductInsert; bundledItems?: ProductInsert[] }) =>
			createProduct({ data: { product, bundledItems } }),
		onMutate: async ({ product, bundledItems }) => {
			const cachedItems = await addCacheItem<NestedProduct>(queryClient, queryKey, {
				...(product as NestedProduct),
				products: bundledItems as NestedProduct[],
			});

			updateProposalTotals(cachedItems.newItems);

			return cachedItems;
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newProduct, context) => {
			queryClient.setQueryData<NestedProduct[]>(queryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey,
			});
		},
	});

	const handleProductDeletion = useMutation({
		mutationFn: async ({ id }: { id: string }) => deleteProduct({ data: id }),
		onMutate: async ({ id }) => {
			const cachedItems = await deleteCacheItem<NestedProduct>(queryClient, queryKey, (p) => p.unique_id === id);

			updateProposalTotals(cachedItems.newItems);

			return cachedItems;
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
		data: products,
		handleProductUpdate,
		handleProductInsert,
		handleProductDeletion,
	};
};
