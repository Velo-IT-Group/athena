'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createProduct } from '@/lib/supabase/create';
import { deleteProduct } from '@/lib/supabase/delete';
import { updateProduct } from '@/lib/supabase/update';

import { getSectionProducts } from '@/lib/supabase/read';
import { updateArrayQueryCache } from '@/lib/utils';

type Props = {
	initialData: NestedProduct[];
	params: { id: string; version: string };
	sectionId: string;
};

export const useProduct = ({ initialData, params, sectionId }: Props) => {
	const queryClient = useQueryClient();
	const productQueryKey = ['proposals', params.id, params.version, 'sections', sectionId, 'products'];

	const { data } = useQuery({
		queryKey: productQueryKey,
		queryFn: async () =>
			getSectionProducts({ data: { id: sectionId, version: params.version } }) as Promise<NestedProduct[]>,
		initialData,
	});

	const { mutate: handleProductUpdate } = useMutation({
		mutationFn: async ({ id, product }: { id: string; product: ProductUpdate }) =>
			updateProduct({ data: { id, product } }),
		onMutate: async ({ id, product }) => {
			const previousTodo = queryClient.getQueryData<NestedProduct[]>(productQueryKey) ?? [];
			const updatedProduct = previousTodo?.find((s) => s.unique_id === id);

			// @ts-expect-error types are seperate
			const newProduct: Product = {
				// ...updatedProduct,
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

			console.log(newProduct);

			return updateArrayQueryCache(queryClient, productQueryKey, newProduct, (p) => p.unique_id === id);
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newTodo, context) => {
			queryClient.setQueryData(productQueryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: productQueryKey,
			});
		},
	});

	const { mutate: handleProductInsert } = useMutation({
		mutationFn: async ({ product, bundledItems }: { product: ProductInsert; bundledItems?: ProductInsert[] }) =>
			createProduct({ data: { product, bundledItems } }),
		onMutate: async ({ product, bundledItems }) =>
			updateArrayQueryCache(queryClient, productQueryKey, {
				...product,
				products: bundledItems,
			}),
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newProduct, context) => {
			queryClient.setQueryData([productQueryKey], context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: productQueryKey,
			});
		},
	});

	const { mutate: handleProductDeletion } = useMutation({
		mutationFn: async ({ id }: { id: string }) => deleteProduct({ data: id }),
		onMutate: async ({ id }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: productQueryKey,
			});

			// Snapshot the previous value
			const previousItems = queryClient.getQueryData<NestedProduct[]>(productQueryKey) ?? [];

			const newItems: NestedProduct[] = [...previousItems.filter((p) => p.unique_id !== id)];

			// Optimistically update to the new value
			queryClient.setQueryData(productQueryKey, newItems);

			// Return a context with the previous and new items
			return { previousItems, newItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newProduct, context) => {
			queryClient.setQueryData(productQueryKey, context?.previousItems);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: productQueryKey,
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
