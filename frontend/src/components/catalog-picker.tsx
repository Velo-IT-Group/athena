'use client';
import React, { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { catalogColumns } from '@/components/table-columns/product';
import { DataTable } from '@/components/ui/data-table';
import { ExtendedCatalogItem, getCatalogItems } from '@/lib/manage/read';
import { createProduct } from '@/lib/supabase/create';
import Search from '@/components/search';
import { useRouter } from '@tanstack/react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TableSkeleton from '@/components/ui/data-table/skeleton';

type Props = {
	proposal: string;
	catalogItems: ExtendedCatalogItem[];
	params: { id: string; version: string };
	page: number;
	count: number;
	searchParams?: Record<string, string>;
	section: string;
	url?: string;
	productLength: number;
	children?: React.ReactNode;
};

const CatalogPicker = ({ params, section, searchParams, catalogItems, url, productLength, children }: Props) => {
	const router = useRouter();
	const queryClient = useQueryClient();
	const productQueryKey = ['products', section];

	const { mutate: handleProductInsert } = useMutation({
		mutationKey: ['createProduct', section],
		mutationFn: async ({ product, bundledItems }: { product: ProductInsert; bundledItems?: ProductInsert[] }) =>
			createProduct(product, bundledItems),
		onMutate: async ({ product, bundledItems }) => {
			// Cancel any outgoing refetches
			// (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({
				queryKey: productQueryKey,
			});

			// Snapshot the previous value
			const previousItems = queryClient.getQueryData<NestedProduct[]>(productQueryKey) ?? [];

			const newItems = [
				...previousItems,
				{
					...product,
					products: bundledItems,
				},
			];

			// Optimistically update to the new value
			queryClient.setQueryData(productQueryKey, newItems);

			// Return a context with the previous and new todo
			return { previousTodo: previousItems, newProduct: newItems };
		},
		// If the mutation fails,
		// use the context returned from onMutate to roll back
		onError: (err, newProduct, context) => {
			queryClient.setQueryData([productQueryKey], context?.previousTodo);
		},
		onSettled: async () => {
			await queryClient.invalidateQueries({
				queryKey: productQueryKey,
			});
		},
	});

	// access variables somewhere else
	// const variables = useMutationState<string>({
	//     filters: { mutationKey: ['createProduct', section], status: 'pending' },
	//     select: (mutation) => mutation.state.variables,
	// })

	const productInsert = async (product: ProductInsert, bundledItems?: ProductInsert[]) =>
		handleProductInsert({
			product: {
				...product,
				version: params.version,
				section: section ?? null,
				order: productLength + 1,
			},
			bundledItems: bundledItems?.map((item) => {
				return { ...item, version: params.version, section };
			}),
		});

	const baseUrl = url ?? `/proposals/${params.id}/${params.version}/products`;

	return (
		<Dialog
		// onOpenChange={(open) => {
		// 	if (!open) {
		// 		router.push(baseUrl);
		// 	}
		// }}
		>
			<DialogTrigger
				type='button'
				asChild
			>
				{children ? (
					<>{children}</>
				) : (
					<Button
						className='text-muted-foreground w-full justify-start'
						size='sm'
						variant='ghost'
						type='button'
					>
						Add product...
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className='max-w-none sm:!max-w-none w-w-padding h-w-padding flex flex-col space-y-3 overflow-y-auto w-full'>
				<DialogHeader>
					<DialogTitle>Add Products</DialogTitle>
				</DialogHeader>

				<div className='grid grid-cols-[250px_1fr] gap-4'>
					<Search
						baseUrl={baseUrl}
						placeholder='Search by identifier...'
						queryParam='identifier'
					/>

					<Search
						baseUrl={baseUrl}
						placeholder='Search by description...'
						queryParam='description'
					/>
				</div>

				<Suspense
					fallback={
						<TableSkeleton
							columns={catalogColumns.length}
							rows={25}
						/>
					}
				>
					<DataTable
						columns={catalogColumns}
						queryFn={getCatalogItems}
						meta={{
							filterKey: 'description',
							definition: { page: 'Companies' },
							filterParams: {
								conditions: `inactiveFlag = false ${
									searchParams?.description
										? `and description like '${searchParams?.description}'`
										: ''
								}${
									searchParams?.identifier ? `and identifier like '${searchParams?.identifier}'` : ''
								}`,
							},
							productInsert,
						}}
						initialData={{
							data: catalogItems,
							count: catalogItems.length,
						}}
					/>
				</Suspense>

				<DialogFooter>
					<DialogClose asChild>
						<Button>Save</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CatalogPicker;
