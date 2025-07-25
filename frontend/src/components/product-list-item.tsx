import { ChevronDown, Ellipsis, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import { Collapsible, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Editable, EditableArea, EditableInput, EditablePreview, EditableTrigger } from '@/components/ui/editable';
import {
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Props {
	product: NestedProduct;
	handleDeletion: () => void;
	handleProductUpdate: ({ id, product }: { id: string; product: ProductUpdate }) => void;
	className?: string;
}

const ProductListItem = ({ product, handleDeletion, handleProductUpdate, className }: Props) => {
	const price = product.product_class === 'Bundle' ? product.calculated_price! : product.price!;

	const formattedPrice = (price: number) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		}).format(price);

	return (
		<SortableItem
			value={product.unique_id}
			asChild
		>
			<Collapsible
				// open={collapsibleOpen}
				// onOpenChange={setCollapsibleOpen}
				className='border-b last:border-b-0'
				defaultOpen
			>
				<div className='grid grid-cols-9 items-center gap-3 group hover:bg-muted/50 py-0.5 [&[data-active=open]]:bg-blue-500'>
					<div className='flex items-center'>
						<Button
							variant='ghost'
							size='smIcon'
							className={cn(
								'opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground mr-6',
								product.product_class !== 'Bundle' && 'mr-6'
							)}
						>
							<GripVertical />
						</Button>
						{/* <SortableItemHandle asChild>
						</SortableItemHandle> */}

						{product.product_class === 'Bundle' && (
							<CollapsibleTrigger asChild>
								<Button
									variant='ghost'
									size='smIcon'
									className='text-muted-foreground [&[data-state=open]>svg]:rotate-180 transition-all'
								>
									<ChevronDown />
								</Button>
							</CollapsibleTrigger>
						)}

						<Editable
							defaultValue={product.identifier ?? product.manufacturer_part_number ?? ''}
							placeholder='Enter your text here'
							className='text-base flex flex-row items-center'
							onSubmit={(value) =>
								handleProductUpdate({
									id: product.unique_id,
									product: {
										identifier: value,
									},
								})
							}
							autosize
						>
							<EditableArea>
								<EditablePreview className='whitespace-pre-wrap px-1.5 text-sm border border-transparent hover:border-border hover:cursor-pointer' />
								<EditableInput className='px-1.5 text-sm' />
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
												<span>Rename product</span>
											</DropdownMenuItem>
										</EditableTrigger>

										{/* <DropdownMenuItem
										// onSelect={handleDuplication}
										>
											<CopyPlus className='mr-1.5 text-muted-foreground' />
											<span>Duplicate section</span>
										</DropdownMenuItem> */}

										<DropdownMenuItem onSelect={handleDeletion}>
											<Trash2 className='mr-1.5 text-red-500' />
											<span>Delete section</span>
										</DropdownMenuItem>
									</DropdownMenuGroup>
								</DropdownMenuContent>
							</DropdownMenu>
						</Editable>
					</div>

					<div className='col-span-3'>
						<Editable
							defaultValue={product.description ?? ''}
							placeholder='Enter your text here'
							className='text-base flex flex-row items-center'
							// onSubmit={(value) =>
							// 	handleTicketUpdate({
							// 		summary: value,
							// 		phase: ticket.phase,
							// 	})
							// }
							autosize
						>
							<EditableArea>
								<EditablePreview className='whitespace-pre-wrap px-1.5 text-sm border border-transparent hover:border-border hover:cursor-pointer' />
								<EditableInput className='px-1.5 text-sm' />
							</EditableArea>
						</Editable>
					</div>

					<div>
						<Editable
							defaultValue={product.cost?.toString() ?? ''}
							placeholder='Enter your text here'
							className='text-base flex flex-row items-center'
							onSubmit={(value) =>
								handleProductUpdate({
									id: product.unique_id,
									product: {
										cost: Number(value),
									},
								})
							}
							autosize
						>
							<EditableArea>
								<EditablePreview className='whitespace-pre-wrap px-1.5 text-sm border border-transparent hover:border-border hover:cursor-pointer before:content-["$"]' />
								<EditableInput className='px-1.5 text-sm' />
							</EditableArea>
						</Editable>
					</div>

					<div>
						<Editable
							defaultValue={product.price?.toString() ?? ''}
							placeholder='Enter your text here'
							className='text-base flex flex-row items-center'
							onSubmit={(value) =>
								handleProductUpdate({
									id: product.unique_id,
									product: {
										price: Number(value),
									},
								})
							}
							autosize
						>
							<EditableArea>
								<EditablePreview className='whitespace-pre-wrap px-1.5 text-sm border border-transparent hover:border-border hover:cursor-pointer before:content-["$"]' />
								<EditableInput className='px-1.5 text-sm' />
							</EditableArea>
						</Editable>
					</div>

					<div>
						<Editable
							defaultValue={product.quantity?.toString() ?? ''}
							placeholder='Enter your text here'
							className='text-base flex flex-row items-center'
							onSubmit={(value) =>
								handleProductUpdate({
									id: product.unique_id,
									product: {
										quantity: Number(value),
									},
								})
							}
							autosize
						>
							<EditableArea>
								<EditablePreview className='whitespace-pre-wrap px-1.5 text-sm border border-transparent hover:border-border hover:cursor-pointer' />
								<EditableInput className='px-1.5 text-sm' />
							</EditableArea>
						</Editable>
					</div>

					<div className='whitespace-pre-wrap px-1.5 text-sm hover:cursor-pointer text-muted-foreground'>
						{formattedPrice(product.extended_cost ?? 0)}
					</div>

					<div className='whitespace-pre-wrap px-1.5 text-sm hover:cursor-pointer text-muted-foreground'>
						{formattedPrice(product.extended_price ?? 0)}
					</div>
				</div>

				{/* <CollapsibleContent asChild>
					<Sortable
						value={sortedTasks}
						onValueChange={(newTasks) => {
							newTasks.map((task, index) =>
								handleTaskUpdate({
									id: task.id,
									task: {
										...task,
										order: index,
									},
								})
							);
						}}
						getItemValue={(item) => item.id}
					>
						<SortableContent asChild>
							<>
								{sortedTasks.map((task) => (
									<TaskListItem
										key={task.id}
										task={task}
										handleUpdate={(updatedTask) =>
											handleTaskUpdate({
												id: task.id,
												task: updatedTask,
											})
										}
										handleDeletion={() =>
											handleTaskDeletion({
												id: task.id,
											})
										}
										handleDuplication={() =>
											handleTaskDuplication({
												id: task.id,
											})
										}
									/>
								))}
							</>
						</SortableContent>
					</Sortable>
				</CollapsibleContent> */}
			</Collapsible>
		</SortableItem>
	);
};

export default ProductListItem;
