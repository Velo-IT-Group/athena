import React from 'react';
import {
	AlignCenter,
	ArrowDown,
	ArrowUp,
	ChevronDown,
	CopyPlus,
	Ellipsis,
	GripVertical,
	ListTodo,
	Pencil,
	Plus,
	Trash2,
} from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import TaskListItem from './task-list-item';
import { EditableArea, EditableInput, EditablePreview, Editable, EditableTrigger } from '@/components/ui/editable';
import { Sortable, SortableContent, SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import useTask from '@/hooks/use-task';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Props = {
	ticket: NestedTicket;
	tasks: Task[];
	handleDeletion: () => void;
	handleDuplication: () => void;
	handleTicketUpdate: (ticket: TicketUpdate) => void;
};

const TicketListItem = ({ ticket, tasks, handleDeletion, handleDuplication, handleTicketUpdate }: Props) => {
	const [collapsibleOpen, setCollapsibleOpen] = React.useState(false);
	const { data, handleTaskUpdate, handleTaskDeletion, handleTaskDuplication, handleTaskInsert } = useTask({
		initialData: tasks,
		ticketId: ticket.id,
	});

	const taskStub: TaskInsert = {
		id: crypto.randomUUID(),
		summary: '',
		notes: 'New Task',
		priority: 1,
		ticket: ticket.id,
		created_at: new Date().toISOString(),
		order: data.length,
	};

	const sortedTasks = data.sort((a, b) => {
		// First, compare by score in descending order
		if (Number(a.order) > Number(b.order)) return 1;
		if (Number(a.order) < Number(b.order)) return -1;

		// Then, compare by created_at in ascending order
		return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
	});

	return (
		<SortableItem
			key={ticket.id}
			value={ticket.id}
			asChild
		>
			<Collapsible
				open={collapsibleOpen}
				onOpenChange={setCollapsibleOpen}
				className='border-b last:border-b-0'
				defaultOpen
			>
				<div className='flex items-center group hover:bg-muted/50 py-0.5 [&[data-active=open]]:bg-blue-500'>
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
							className='text-muted-foreground [&[data-state=open]>svg]:rotate-180 transition-all ml-6'
						>
							<ChevronDown />
						</Button>
					</CollapsibleTrigger>

					<Editable
						defaultValue={ticket.summary}
						placeholder='Enter your text here'
						className='text-base flex flex-row items-center'
						onSubmit={(value) =>
							handleTicketUpdate({
								summary: value,
								phase: ticket.phase,
							})
						}
						autosize
					>
						<EditableArea>
							<EditablePreview className='whitespace-pre-wrap px-1.5 text-sm border border-transparent hover:border-border hover:cursor-pointer' />
							<EditableInput className='px-1.5 text-sm' />
						</EditableArea>

						{sortedTasks.length > 0 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<CollapsibleTrigger asChild>
										<Button
											variant='ghost'
											size='sm'
											className='text-muted-foreground [&[data-state=open]>svg]:rotate-180 transition-all h-6 px-1.5'
										>
											<span className='mr-1.5 text-xs'>{sortedTasks.length}</span>
											<ListTodo />
										</Button>
									</CollapsibleTrigger>
								</TooltipTrigger>

								<TooltipContent side='top'>View tasks</TooltipContent>
							</Tooltip>
						)}

						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant='ghost'
									size='smIcon'
									className='opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground'
									onClick={() => {
										handleTaskInsert({ task: taskStub });
										setCollapsibleOpen(true);
									}}
								>
									<Plus />
								</Button>
							</TooltipTrigger>

							<TooltipContent side='top'>Create task</TooltipContent>
						</Tooltip>

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
											<span>Rename section</span>
										</DropdownMenuItem>
									</EditableTrigger>

									<DropdownMenuSub>
										<DropdownMenuSubTrigger>
											<AlignCenter className='mr-1.5 text-muted-foreground' />
											<span>Add section</span>
										</DropdownMenuSubTrigger>

										<DropdownMenuSubContent>
											<DropdownMenuGroup>
												<DropdownMenuItem>
													<ArrowUp className='mr-1.5 text-muted-foreground' />
													<span>Add section above</span>
												</DropdownMenuItem>

												<DropdownMenuItem>
													<ArrowDown className='mr-1.5 text-muted-foreground' />
													<span>Add section below</span>
												</DropdownMenuItem>
											</DropdownMenuGroup>
										</DropdownMenuSubContent>
									</DropdownMenuSub>

									<DropdownMenuItem onSelect={handleDuplication}>
										<CopyPlus className='mr-1.5 text-muted-foreground' />
										<span>Duplicate section</span>
									</DropdownMenuItem>

									<DropdownMenuItem onSelect={handleDeletion}>
										<Trash2 className='mr-1.5 text-red-500' />
										<span>Delete section</span>
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</Editable>

					<Editable
						defaultValue={String(ticket.budget_hours)}
						placeholder='0'
						className='text-base flex flex-row items-center ml-auto text-muted-foreground'
						onSubmit={(value) =>
							handleTicketUpdate({
								summary: ticket.summary,
								phase: ticket.phase,
								budget_hours: Number(value),
							})
						}
						autosize
					>
						<EditableArea>
							<EditablePreview className='whitespace-pre-wrap px-1.5 text-sm border border-transparent hover:border-border hover:cursor-pointer' />
							<EditableInput
								className='px-1.5 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
								type='number'
								step={0.25}
								min={0}
							/>
						</EditableArea>
					</Editable>

					<p className='ml-[0.125ch]'>hrs</p>
				</div>

				<CollapsibleContent asChild>
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
				</CollapsibleContent>
			</Collapsible>
		</SortableItem>
	);
};

export default TicketListItem;
