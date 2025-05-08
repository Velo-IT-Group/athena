'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table/column-header';
import { Button } from '@/components/ui/button';
import { getCurrencyString } from '@/utils/money';
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, GripVertical, PlusIcon } from 'lucide-react';
import type { ColumnDef, RowData } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { convertToProduct, convertToSnakeCase } from '@/utils/helpers';
import type { ExtendedCatalogItem } from '@/lib/manage/read';
import ProductColumnActions from '@/components/product-column-actions';
import { SortableItemHandle } from '@/components/ui/sortable';
import { useProduct } from '@/hooks/use-product';
import CurrencyInput from '@/components/currency-input';

export const columns: ColumnDef<Product>[] = [
	{
		id: 'drag',
		enableHiding: false,
		cell: () => (
			<SortableItemHandle asChild>
				<Button
					variant='ghost'
					size='icon'
					// className='size-8'
				>
					<GripVertical />
				</Button>
			</SortableItemHandle>
		),
	},
	{
		accessorKey: 'manufacturer_part_number',
		header: ({ column }) => {
			return (
				<DataTableColumnHeader
					column={column}
					title='Manufacturer Part Number'
				/>
			);
		},
		cell: ({ row }) => {
			return (
				<div className='flex items-center'>
					{row.getCanExpand() && (
						<>
							<Button
								variant='ghost'
								size='sm'
								{...{
									onClick: row.getToggleExpandedHandler(),
									style: { cursor: 'pointer' },
								}}
								className='inline-block'
							>
								{row.getIsExpanded() ? (
									<ChevronDownIcon className='w-4 h-4' />
								) : (
									<ChevronRightIcon className='w-4 h-4' />
								)}
							</Button>
						</>
					)}

					<span className=''>{row.original.identifier ?? row.getValue('manufacturer_part_number')}</span>
				</div>
			);
		},
	},
	{
		accessorKey: 'description',
		header: ({ column }) => {
			return (
				<DataTableColumnHeader
					column={column}
					title='Product Description'
					// className="w-[500px]"
				/>
			);
		},
		size: 500,
		cell: ({ row, table }) => {
			return (
				<Input
					className='w-[500px] border border-transparent hover:border-border hover:cursor-default rounded-lg shadow-none px-2 -mx-2 py-2 -my-2 truncate font-medium flex-1'
					defaultValue={row.getValue('description')}
					onBlur={(e) => {
						if (e.currentTarget.value !== row.getValue('description')) {
							table.options.meta?.updateProduct &&
								table.options.meta?.updateProduct({
									id: row.original.unique_id,
									product: {
										description: e.currentTarget.value,
									},
								});
						}
					}}
				/>
			);
		},
	},
	{
		accessorKey: 'cost',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Quote Item Cost'
				className='text-right w-[100px] text-nowrap'
			/>
		),
		cell: ({ row, table }) => {
			const handleUpdate = async (amount: number | null | undefined) => {
				table.options.meta?.updateProduct &&
					table.options.meta?.updateProduct({
						id: row.original.unique_id,
						product: {
							cost: amount,
						},
					});
			};

			const amount =
				row.subRows.length > 0 ? row.original.calculated_cost ?? 0 : (row.getValue('cost') as number);

			return (
				<span className='text-right'>
					{row.subRows.length > 0 ? (
						<>{getCurrencyString(amount)}</>
					) : (
						<CurrencyInput
							handleBlurChange={handleUpdate}
							defaultValue={amount}
							className='w-[100px] border border-transparent hover:border-border hover:cursor-default rounded-lg shadow-none px-2 -mx-2 py-2 -my-2 truncate font-medium flex-1'
						/>
					)}
				</span>
			);
		},
	},
	{
		accessorKey: 'price',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Quote Item Price'
				className='text-right w-[100px] text-nowrap'
			/>
		),
		cell: ({ row, table }) => {
			// const { handleProductUpdate } = useProduct({
			// 	initialData: [row.original],
			// 	params: { id: '1', version: '1' },
			// 	sectionId: '1',
			// });
			const handleUpdate = async (amount: number | null | undefined) => {
				table.options.meta?.updateProduct &&
					table.options.meta?.updateProduct({
						id: row.original.unique_id,
						product: {
							price: amount,
						},
					});
			};

			const amount =
				row.subRows.length > 0 ? row.original.calculated_price ?? 0 : (row.getValue('price') as number);

			return (
				<span className='text-right'>
					{row.subRows.length > 0 ? (
						<>{getCurrencyString(amount)}</>
					) : (
						<CurrencyInput
							handleBlurChange={handleUpdate}
							defaultValue={amount}
							className='w-[100px] border border-transparent hover:border-border hover:cursor-default rounded-lg shadow-none px-2 -mx-2 py-2 -my-2 truncate font-medium flex-1'
						/>
					)}
				</span>
			);
		},
	},
	{
		accessorKey: 'quantity',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Quantity'
				className='w-[100px] text-nowrap'
			/>
		),
		cell: ({ row, table }) => {
			return (
				<Input
					type='number'
					defaultValue={
						row.depth > 0
							? (row.getParentRow()?.getValue('quantity') as number) *
							  (row.getValue('quantity') as number)
							: row.getValue('quantity')
					}
					onBlur={async (e) => {
						if (e.currentTarget.valueAsNumber !== row.original.quantity) {
							table.options.meta?.updateProduct &&
								table.options.meta?.updateProduct({
									id: row.original.unique_id,
									product: {
										quantity: e.currentTarget.valueAsNumber,
									},
								});
						}
					}}
					className='w-[100px] border border-transparent hover:border-border hover:cursor-default rounded-lg shadow-none px-2 -mx-2 py-2 -my-2 truncate font-medium flex-1'
				/>
			);
		},
	},
	{
		accessorKey: 'extended_price',
		header: ({ column }) => (
			<DataTableColumnHeader
				column={column}
				title='Extended Price'
				className='w-[100px]'
			/>
		),
		cell: ({ row }) => {
			let amount: number = 0;

			if (row.depth > 0) {
				amount = ((row.getValue('extended_price') as number) *
					(row.getParentRow()?.original.quantity ?? 1)) as number;
			} else if (row.subRows.length > 0) {
				amount = (row.original.calculated_price ?? 0) * (row.original.quantity ?? 1);
			} else {
				amount = row.getValue('extended_price');
			}

			return <span className='w-[100px] text-right font-medium'>{getCurrencyString(amount)}</span>;
		},
	},
	{
		id: 'actions',
		enableHiding: false,
		cell: ({ row, table }) => (
			<ProductColumnActions
				product={row.original}
				handleProductDeletion={(id) => {
					table.options.meta?.deleteProduct({
						id,
					});
				}}
			/>
		),
	},
];

export const catalogColumns: ColumnDef<ExtendedCatalogItem>[] = [
	{
		id: 'select',
		cell: ({ row, table }) => (
			<div className='w-2'>
				<Button
					variant='ghost'
					size='sm'
					className='relative flex cursor-default select-none items-center'
					onClick={() => {
						row.toggleSelected(!!!row.getIsSelected());
						if (!!!row.getIsSelected()) {
							// @ts-ignore
							const snakedObj: ProductInsert = {
								// @ts-ignore
								...convertToSnakeCase(row.original),
							};
							const newProduct = convertToProduct(snakedObj);

							const bundledItems = row.original.bundledItems?.map((b) => {
								// @ts-ignore
								const snakedObj = convertToSnakeCase(b);
								// @ts-ignore
								const snakedFixed = {
									...snakedObj,
									// @ts-ignore
									id: b.catalogItem.id,
									version: '',
									// @ts-ignore
									identifier: b.identifier,
								};
								// @ts-ignore
								const newObj = convertToProduct(snakedFixed);

								return newObj;
							});

							// @ts-ignore
							delete newProduct['bundled_items'];
							// @ts-ignore
							table.options?.meta?.productInsert(
								// @ts-ignore
								newProduct,
								bundledItems
							);
						}
					}}
				>
					<span className='flex h-3.5 w-3.5'>
						{row.getIsSelected() ? <CheckIcon className='h-4 w-4' /> : <PlusIcon className='h-4 w-4' />}
					</span>
				</Button>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'identifier',
		header: ({ column }) => {
			return (
				<DataTableColumnHeader
					column={column}
					title='ID'
				/>
			);
		},
		cell: ({ row }) => <span>{row.getValue('identifier')}</span>,
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'description',
		header: ({ column }) => {
			return (
				<DataTableColumnHeader
					column={column}
					title='Name'
				/>
			);
		},
		cell: ({ row }) => (
			<div className='flex items-center'>
				{row.getCanExpand() ? (
					<>
						<Button
							variant='ghost'
							size='sm'
							{...{
								onClick: row.getToggleExpandedHandler(),
								style: { cursor: 'pointer' },
							}}
							className='inline-block'
						>
							{row.getIsExpanded() ? (
								<ChevronDownIcon className='w-4 h-4' />
							) : (
								<ChevronRightIcon className='w-4 h-4' />
							)}
						</Button>
					</>
				) : (
					<></>
				)}

				<div
					className='flex space-x-2 text-muted-foreground'
					style={{ paddingLeft: `${row.depth * 2}rem` }}
				>
					{row.original.productClass === 'Bundle' && <Badge variant='outline'>Bundle</Badge>}
					<span className='truncate font-medium decoration-dashed underline decoration-muted-foreground '>
						{row.getValue('description')}
					</span>
				</div>
			</div>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		accessorKey: 'cost',
		header: () => <div className='text-right'>Cost</div>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('cost'));

			// Format the amount as a dollar amount
			const formatted = new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}).format(amount);

			return <div className='text-right font-medium'>{formatted}</div>;
		},
	},
	{
		accessorKey: 'price',
		header: () => <div className='text-right'>Price</div>,
		cell: ({ row }) => {
			const amount = parseFloat(row.getValue('price'));

			return <div className='text-right font-medium'>{getCurrencyString(amount)}</div>;
		},
	},
];
