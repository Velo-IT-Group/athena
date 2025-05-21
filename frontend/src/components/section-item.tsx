import { useEffect, useState } from 'react';

import { ChevronDown, Ellipsis, GripVertical, Loader2, Pencil, Trash2 } from 'lucide-react';

import { useProduct } from '@/hooks/use-product';

import { ExtendedCatalogItem, searchCatalogItems } from '@/lib/manage/read';

import { convertToProduct, convertToSnakeCase } from '@/utils/helpers';
import { getCurrencyString } from '@/utils/money';

import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditableArea, EditableInput, EditablePreview, Editable, EditableTrigger } from '@/components/ui/editable';
import { AsyncSelect } from '@/components/ui/async-select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CommandItem } from '@/components/ui/command';
import { KanbanColumnHandle, KanbanItem, KanbanItemHandle } from '@/components/ui/kanban';
import { Input } from '@/components/ui/input';
import CurrencyInput from '@/components/currency-input';
import {
	AlertDialog,
	AlertDialogDescription,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
	AlertDialogFooter,
	AlertDialogCancel,
} from '@/components/ui/alert-dialog';

type Props = {
	section: NestedSection;
	products: NestedProduct[];
	params: { id: string; version: string };
	url?: string;
	order: number;
	handleSectionInsert: (section: SectionInsert) => void;
	handleSectionUpdate: (section: SectionUpdate) => void;
	handleSectionDeletion: () => void;
};

const SectionItem = ({ section, products, params, handleSectionUpdate, handleSectionDeletion }: Props) => {
	const [catalogItem, setCatalogItem] = useState<ExtendedCatalogItem | null>(null);

	const { data, handleProductUpdate, handleProductInsert, handleProductDeletion, setProducts } = useProduct({
		initialData: products ?? [],
		params,
		sectionId: section.id,
	});

	useEffect(() => {
		setProducts(products ?? []);
	}, [products]);

	const orderedProducts = data?.sort((a, b) => {
		// First, compare by score in descending order
		if (Number(a.order) > Number(b.order)) return 1;
		if (Number(a.order) < Number(b.order)) return -1;

		// If scores are equal, then sort by created_at in ascending order
		// return 0;
		return new Date(a.created_at ?? '').getTime() - new Date(b.created_at ?? '').getTime();
	});

	return (
		<Collapsible
			className='w-full -ml-5'
			defaultOpen
		>
			<div className='flex items-center group h-12'>
				<KanbanColumnHandle asChild>
					<Button
						variant='ghost'
						size='smIcon'
						className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground'
					>
						<GripVertical />
					</Button>
				</KanbanColumnHandle>

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
				<Table>
					<TableHeader>
						<TableRow className='text-sm'>
							<TableHead className='-ml-3 w-12' />

							<TableHead className='-ml-3'>
								<span>Manufacturer Part Number</span>
							</TableHead>

							<TableHead className='-ml-3'>
								<span>Product Description</span>
							</TableHead>

							<TableHead className='text-right w-[100px] text-nowrap -ml-3'>
								<span>Quote Item Cost</span>
							</TableHead>

							<TableHead className='text-right w-[100px] text-nowrap -ml-3'>
								<span>Quote Item Price</span>
							</TableHead>

							<TableHead className='w-[100px] text-nowrap -ml-3'>
								<span>Quantity</span>
							</TableHead>

							<TableHead className='w-[100px] -ml-3'>
								<span>Extended Price</span>
							</TableHead>

							<TableHead className='-ml-3' />
						</TableRow>
					</TableHeader>

					<TableBody>
						{orderedProducts?.map((product) => (
							<KanbanItem
								key={product.unique_id}
								value={product.unique_id}
								asChild
							>
								<TableRow>
									<TableCell className='w-12'>
										<KanbanItemHandle asChild>
											<Button
												variant='ghost'
												size='icon'
											>
												<GripVertical />
											</Button>
										</KanbanItemHandle>
									</TableCell>

									<TableCell>
										<div className='flex items-center'>
											{/* {row.getCanExpand() && (
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
											)} */}

											<span>{product.identifier ?? product.manufacturer_part_number}</span>
										</div>
									</TableCell>

									<TableCell>
										<Input
											className='w-[500px] border border-transparent hover:border-border hover:cursor-default rounded-lg shadow-none px-2 -mx-2 py-2 -my-2 truncate font-medium flex-1'
											defaultValue={product.description ?? ''}
											onBlur={(e) => {
												if (e.currentTarget.value !== product.description) {
													handleProductUpdate.mutate({
														id: product.unique_id,
														product: {
															description: e.currentTarget.value,
														},
													});
												}
											}}
										/>
									</TableCell>

									<TableCell>
										<CurrencyInput
											handleBlurChange={(cost) => {
												handleProductUpdate.mutate({
													id: product.unique_id,
													product: {
														cost,
													},
												});
											}}
											defaultValue={product.cost ?? ''}
											className='w-[100px] border border-transparent hover:border-border hover:cursor-default rounded-lg shadow-none px-2 -mx-2 py-2 -my-2 truncate font-medium flex-1'
										/>
									</TableCell>

									<TableCell>
										<CurrencyInput
											handleBlurChange={(price) => {
												handleProductUpdate.mutate({
													id: product.unique_id,
													product: {
														price,
													},
												});
											}}
											defaultValue={product.price ?? ''}
											className='w-[100px] border border-transparent hover:border-border hover:cursor-default rounded-lg shadow-none px-2 -mx-2 py-2 -my-2 truncate font-medium flex-1'
										/>
									</TableCell>

									<TableCell>
										<Input
											type='number'
											defaultValue={product.quantity}
											onBlur={async (e) => {
												if (e.currentTarget.valueAsNumber !== product.quantity) {
													handleProductUpdate.mutate({
														id: product.unique_id,
														product: {
															quantity: e.currentTarget.valueAsNumber,
														},
													});
												}
											}}
											className='w-[100px] border border-transparent hover:border-border hover:cursor-default rounded-lg shadow-none px-2 -mx-2 py-2 -my-2 truncate font-medium flex-1'
										/>
									</TableCell>

									<TableCell>
										<span className='w-[100px] text-right font-medium'>
											{getCurrencyString(product.extended_price ?? 0)}
										</span>
									</TableCell>

									<TableCell>
										<>
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant='ghost'
														size='icon'
													>
														<span className='sr-only'>Delete item</span>
														<Trash2 className='text-red-500' />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Are you sure?</AlertDialogTitle>
														<AlertDialogDescription>
															This action cannot be undone. This will permanently delete
															the product from our servers.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>

														<Button
															onClick={() =>
																handleProductDeletion.mutate({
																	id: product.unique_id,
																})
															}
														>
															{handleProductDeletion && (
																<Loader2 className='animate-spin mr-1.5' />
															)}
															<span>Continue</span>
														</Button>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</>
									</TableCell>
								</TableRow>
							</KanbanItem>
						))}
					</TableBody>
				</Table>

				<AsyncSelect
					fetcher={async (query, page) => {
						return await searchCatalogItems({ data: { query, page } });
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

								handleProductInsert.mutate({
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
						const snakedObj: ProductInsert = {
							// @ts-ignore
							...convertToSnakeCase(value),
							version: params.version,
							section: section.id,
						};
						const newProduct = convertToProduct(snakedObj) as ProductInsert;

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

						handleProductInsert.mutate({
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
	);
};

export default SectionItem;
