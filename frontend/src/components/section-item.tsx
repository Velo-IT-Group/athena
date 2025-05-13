import { ChevronDown, Ellipsis, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sortable, SortableContent, SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import { ExtendedCatalogItem, searchCatalogItems } from '@/lib/manage/read';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProduct } from '@/hooks/use-product';
import {
	EditableArea,
	EditableInput,
	EditablePreview,
	Editable,
	EditableTrigger,
	Input,
} from '@/components/ui/editable';
import { AsyncSelect } from '@/components/ui/async-select';
import { Badge } from '@/components/ui/badge';
import { convertToProduct, convertToSnakeCase } from '@/utils/helpers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { flexRender, getExpandedRowModel, getFacetedUniqueValues } from '@tanstack/react-table';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { columns } from '@/components/table-columns/product';
import { CommandItem } from '@/components/ui/command';

type Props = {
	section: NestedSection;
	params: { id: string; version: string };
	url?: string;
	order: number;
	handleSectionInsert: (section: SectionInsert) => void;
	handleSectionUpdate: (section: SectionUpdate) => void;
	handleSectionDeletion: () => void;
};

const SectionItem = ({ section, params, handleSectionUpdate, handleSectionDeletion }: Props) => {
	const [catalogItem, setCatalogItem] = useState<ExtendedCatalogItem | null>(null);

	const {
		data: products,
		handleProductUpdate,
		handleProductInsert,
		handleProductDeletion,
	} = useProduct({
		initialData: section.products ?? [],
		params,
		sectionId: section.id,
	});

	const orderedProducts = products?.sort((a, b) => {
		// First, compare by score in descending order
		if (Number(a.order) > Number(b.order)) return 1;
		if (Number(a.order) < Number(b.order)) return -1;

		// If scores are equal, then sort by created_at in ascending order
		// return 0;
		return new Date(a.created_at ?? '').getTime() - new Date(b.created_at ?? '').getTime();
	});

	const table = useReactTable<NestedProduct>({
		data: orderedProducts ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		enableExpanding: true,
		getRowId: (row) => row.unique_id,
		getSubRows: (row) => {
			const orderedItems = row.products?.sort((a, b) => {
				// First, compare by score in descending order
				if (Number(a.sequence_number) > Number(b.sequence_number)) return 1;
				if (Number(a.sequence_number) < Number(b.sequence_number)) return -1;

				// If scores are equal, then sort by created_at in ascending order
				return Number(a.id) - Number(b.id);
				// return new Date(a.=).getTime() - new Date(b.created_at).getTime();
			});

			return orderedItems;
		},
		meta: {
			updateProduct: handleProductUpdate,
			deleteProduct: handleProductDeletion,
		},
	});

	return (
		<SortableItem
			value={section.id}
			className='-ml-5'
			asChild
		>
			<Collapsible
				className='w-full'
				defaultOpen
			>
				<div className='flex items-center group h-12'>
					<SortableItemHandle asChild>
						<Button
							variant='ghost'
							size='smIcon'
							className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground'
						>
							<GripVertical />
						</Button>
					</SortableItemHandle>

					<CollapsibleTrigger asChild>
						<Button
							variant='ghost'
							size='smIcon'
							className='text-muted-foreground [&[data-state=open]>svg]:rotate-180 transition-all'
						>
							<ChevronDown />
						</Button>
					</CollapsibleTrigger>

					<Editable
						defaultValue={section.name}
						placeholder='Enter your text here'
						className='flex flex-row items-center text-lg md:text-lg'
						onSubmit={(name) => handleSectionUpdate({ name })}
						autosize
					>
						<EditableArea>
							<EditablePreview className='whitespace-pre-wrap font-semibold px-1.5 md:text-lg' />
							<EditableInput className='px-1.5 font-semibold md:text-lg' />
						</EditableArea>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant='ghost'
									size='smIcon'
									className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground data-[state=open]:opacity-100'
								>
									<Ellipsis />
								</Button>
							</DropdownMenuTrigger>

							<DropdownMenuContent>
								<DropdownMenuGroup>
									<EditableTrigger asChild>
										<DropdownMenuItem>
											<Pencil className='mr-1.5 text-muted-foreground' />
											<span>Rename phase</span>
										</DropdownMenuItem>
									</EditableTrigger>

									<DropdownMenuItem onSelect={() => handleSectionDeletion()}>
										<Trash2 className='mr-1.5 text-red-500' />
										<span>Delete phase</span>
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</Editable>
				</div>

				<CollapsibleContent>
					<Sortable
						value={orderedProducts ?? []}
						onValueChange={(newProducts) =>
							newProducts.map((product, index) =>
								handleProductUpdate({
									id: product.unique_id,
									product: {
										order: index,
									},
								})
							)
						}
						getItemValue={(item) => item.unique_id}
					>
						<Table>
							<TableHeader>
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead
													key={header.id}
													colSpan={header.colSpan}
													className='text-sm'
												>
													{header.isPlaceholder
														? null
														: flexRender(
																header.column.columnDef.header,
																header.getContext()
														  )}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>

							<SortableContent
								// className='-ml-5'
								asChild
							>
								<TableBody className='overflow-x-auto'>
									{table.getRowModel().rows?.length ? (
										table.getRowModel().rows.map((row) => (
											<SortableItem
												key={row.original.unique_id}
												value={row.original.unique_id}
												asChild
											>
												<TableRow
													key={row.id}
													data-state={row.getIsSelected() && 'selected'}
												>
													{row.getVisibleCells().map((cell) => (
														<TableCell
															key={cell.id}
															className='text-sm'
														>
															{flexRender(cell.column.columnDef.cell, cell.getContext())}
														</TableCell>
													))}
												</TableRow>
											</SortableItem>
										))
									) : (
										<TableRow>
											<TableCell
												colSpan={columns.length}
												className='h-24 text-center'
											>
												No results.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</SortableContent>
						</Table>
					</Sortable>

					<AsyncSelect<ExtendedCatalogItem>
						fetcher={(query, page) => {
							return searchCatalogItems({ data: { query, page } });
						}}
						renderOption={(item) => (
							<CommandItem
								value={item.id.toString()}
								onSelect={() => {
									const snakedObj: ProductInsert = {
										// @ts-ignore
										...convertToSnakeCase(item),
										version: params.version,
										section: section.id,
									};
									const newProduct = convertToProduct(snakedObj) as ProductInsert;

									console.log(newProduct);

									const bundledItems = item.bundledItems?.map((b) => {
										// @ts-ignore
										const snakedObj = convertToSnakeCase(b);
										// @ts-ignore
										const snakedFixed = {
											...snakedObj,
											// @ts-ignore
											id: b.catalogItem.id,
											version: params.version,
											// @ts-ignore
											identifier: b.identifier,
											section: section.id,
										};
										// @ts-ignore
										const newObj = convertToProduct(snakedFixed) as ProductInsert;

										return newObj;
									});

									// @ts-ignore
									delete newProduct['bundled_items'];

									console.log(newProduct, bundledItems);
									handleProductInsert({
										product: newProduct,
										bundledItems,
									});
								}}
							>
								<div className='flex items-center gap-2'>
									<div className='flex flex-col'>
										<div className='font-medium'>{item.description}</div>
										<div className='text-xs text-muted-foreground'>
											{item.identifier}
											{item.productClass === 'Bundle' && (
												<Badge
													variant='outline'
													className='ml-1.5'
												>
													Bundle
												</Badge>
											)}
										</div>
									</div>
								</div>
							</CommandItem>
						)}
						getOptionValue={(item) => item.id.toString()}
						getDisplayValue={(item) => (
							<div className='flex items-center gap-2'>
								<div className='flex flex-col'>
									<div className='font-medium'>{item.description}</div>
									<div className='text-xs text-muted-foreground'>{item.id}</div>
								</div>
							</div>
						)}
						notFound={<div className='py-6 text-center text-sm'>No products found</div>}
						label='Products'
						placeholder='Search products...'
						value={catalogItem?.id.toString() ?? ''}
						onChange={(value) => {
							if (!value) return;
							console.log(value);
							const snakedObj: ProductInsert = {
								// @ts-ignore
								...convertToSnakeCase(value),
								version: params.version,
								section: section.id,
							};
							const newProduct = convertToProduct(snakedObj) as ProductInsert;

							console.log(newProduct);

							const bundledItems = value.bundledItems?.map((b) => {
								// @ts-ignore
								const snakedObj = convertToSnakeCase(b);
								// @ts-ignore
								const snakedFixed = {
									...snakedObj,
									// @ts-ignore
									id: b.catalogItem.id,
									version: params.version,
									// @ts-ignore
									identifier: b.identifier,
									section: section.id,
								};
								// @ts-ignore
								const newObj = convertToProduct(snakedFixed) as ProductInsert;

								return newObj;
							});

							// @ts-ignore
							delete newProduct['bundled_items'];

							console.log(newProduct, bundledItems);
							handleProductInsert({
								product: newProduct,
								bundledItems,
							});
						}}
						className='min-w-[375px] max-w-fit'
					>
						<Button
							className='text-muted-foreground w-full justify-start'
							size='sm'
							variant='ghost'
						>
							<span className='px-9'>Add product...</span>
						</Button>
					</AsyncSelect>
				</CollapsibleContent>
			</Collapsible>
		</SortableItem>
	);
};

export default SectionItem;
